import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcryptjs from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, gt, ne, sql, isNull, desc } from "drizzle-orm";
import type { Pool } from "pg";
import type { Database } from "@maria/database";
import {
  channelInstances,
  invitations,
  memberships,
  organizations,
  sessions,
  users,
  workspaces,
  type WorkspaceOnboardingState,
} from "@maria/database/schema";

export const WORKSPACE_ROLES = ["viewer", "agent", "manager", "admin"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  viewer: 1,
  agent: 2,
  manager: 3,
  admin: 4,
};

export function hasWorkspaceRole(
  role: WorkspaceRole,
  minimum: WorkspaceRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/** ADR 0015 item 4: a grant never exceeds the grantor's rank — `admin` may
 * manage/grant any role (including `admin`); `manager` manages `agent` and
 * `viewer` only; `viewer`/`agent` manage nothing. */
export function canManageRole(
  actor: WorkspaceRole,
  target: WorkspaceRole,
): boolean {
  return (
    actor === "admin" ||
    (hasWorkspaceRole(actor, "manager") && ROLE_RANK[target] < ROLE_RANK[actor])
  );
}

/** Workspace onboarding wizard (ADR 0015 item 6). One ordered registry drives
 * routing, progress and the review summary; `review` is closed by
 * `completeOnboarding`, never by a direct step update. */
export const ONBOARDING_STEPS = [
  "basics",
  "channel",
  "team",
  "review",
] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];
export type OnboardingStepStatus = "pending" | "done" | "skipped";
export type OnboardingStep = {
  id: OnboardingStepId;
  status: OnboardingStepStatus;
  data?: Record<string, unknown> | undefined;
};
export type OnboardingView = {
  workspaceName: string;
  onboardedAt: Date | null;
  steps: OnboardingStep[];
};

export type AuthPort = {
  login(
    email: string,
    password: string,
  ): Promise<{ token: string } | undefined>;
  verifySession(
    token: string,
  ): Promise<
    | { userId: string; email: string; name: string; isAdmin: boolean }
    | undefined
  >;
  authorizeWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<{ role: WorkspaceRole } | undefined>;
  listUserWorkspaces(userId: string): Promise<
    {
      workspaceId: string;
      workspaceName: string;
      role: WorkspaceRole;
      onboarded: boolean;
    }[]
  >;
  createUser(input: {
    email: string;
    name: string;
    password: string;
    workspaceId?: string | undefined;
    role?: WorkspaceRole | undefined;
  }): Promise<{ userId: string } | undefined>;
  listUsers(): Promise<
    {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
      active: boolean;
      createdAt: Date;
    }[]
  >;
  updateUser(
    userId: string,
    input: { name?: string | undefined; active?: boolean | undefined },
  ): Promise<"updated" | "not-found" | "last-admin">;
  changePassword(
    userId: string,
    input: {
      currentPassword: string;
      newPassword: string;
      exceptToken?: string | undefined;
    },
  ): Promise<"updated" | "invalid-password" | "not-found">;
  listMembers(workspaceId: string): Promise<
    {
      id: string;
      userId: string;
      role: WorkspaceRole;
      email: string;
      name: string;
    }[]
  >;
  addMembership(input: {
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
  }): Promise<"created" | "duplicate" | "not-found">;
  /** Membership mutations enforce the grant rank inside the workspace
   * advisory lock (ADR 0015 item 4): `actorRole` must be able to manage the
   * target's current role and, for updates, the new role — `forbidden`
   * otherwise. Platform administration passes `"admin"`. */
  updateMembershipRole(
    workspaceId: string,
    membershipId: string,
    role: WorkspaceRole,
    actorRole: WorkspaceRole,
  ): Promise<"updated" | "not-found" | "last-admin" | "forbidden">;
  removeMembership(
    workspaceId: string,
    membershipId: string,
    actorRole: WorkspaceRole,
  ): Promise<"removed" | "not-found" | "last-admin" | "forbidden">;
  /** Workspace-scoped invitation lifecycle (ADR 0015 item 5). The plaintext
   * token is returned exactly once at creation; only its sha256 hash is
   * persisted. The caller must already be authorized for the workspace. */
  createInvitation(input: {
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
  }): Promise<
    | { id: string; token: string; expiresAt: Date }
    | "already-member"
    | "conflict"
  >;
  /** Live (unconsumed) invitations for a workspace, newest first. */
  listInvitations(workspaceId: string): Promise<
    {
      id: string;
      email: string;
      role: WorkspaceRole;
      expiresAt: Date;
      createdAt: Date;
    }[]
  >;
  /** Consumes a live invitation without creating a membership. Cross-workspace
   * ids are invisible to the scoped transaction and return "not-found". */
  revokeInvitation(
    workspaceId: string,
    invitationId: string,
  ): Promise<"revoked" | "not-found">;
  /** Public token lookup — the token hash itself authorizes reading its own
   * row (app.invite_token_hash scope); no workspace context is required. */
  previewInvitation(token: string): Promise<
    | {
        email: string;
        workspaceId: string;
        workspaceName: string;
        role: WorkspaceRole;
        expiresAt: Date;
      }
    | "invalid"
    | "unusable"
  >;
  /** Atomic acceptance: resolves the invitee (creates a new user or attaches
   * an authenticated one), inserts the membership and consumes the invitation
   * in a single transaction serialized on the invitation row. Failed identity
   * checks leave the invitation live so it can be retried. */
  acceptInvitation(
    token: string,
    input: { name?: string; password?: string; userId?: string },
  ): Promise<
    | {
        kind: "created" | "attached" | "already-member";
        userId: string;
        email: string;
      }
    | "invalid"
    | "unusable"
    | "user-exists"
    | "email-mismatch"
  >;
  /** Workspace onboarding wizard state (ADR 0015 item 6). A step's status is
   * its stored record when present, otherwise auto-resolved from workspace
   * facts — `channel` is done when a channel instance exists and `team` when
   * the workspace has more than one member. */
  getOnboarding(workspaceId: string): Promise<OnboardingView | undefined>;
  /** Records a step as done/skipped with optional step data. `review` is not
   * updatable — it closes through `completeOnboarding`. Mutations are frozen
   * once the workspace is onboarded (ADR: reset only by workspace deletion). */
  updateOnboardingStep(
    workspaceId: string,
    step: OnboardingStepId,
    input: {
      status: "done" | "skipped";
      data?: Record<string, unknown> | undefined;
    },
  ): Promise<"updated" | "not-found" | "invalid-step" | "already-onboarded">;
  /** Completing requires every registry step to be `done` or `skipped`; sets
   * `onboarded_at` and marks `review` done under a workspace row lock.
   * Idempotent: an already-onboarded workspace returns its `onboardedAt`. */
  completeOnboarding(
    workspaceId: string,
  ): Promise<{ onboardedAt: Date } | "not-found" | "incomplete">;
  /** First-run gate: true while the `users` table is empty (ADR 0015). */
  setupRequired(): Promise<boolean>;
  /** Atomic first-run bootstrap: master `is_admin` user, implicit
   * organization, first workspace and its `admin` membership — serialized by
   * the global advisory lock with a user-count re-check inside it. */
  completeSetup(input: {
    email: string;
    name: string;
    password: string;
    workspaceName: string;
  }): Promise<{ userId: string; workspaceId: string } | "already-setup">;
  seedAdmin(): Promise<void>;
};

export type LocalAuthConfig = {
  adminEmail?: string | undefined;
  adminPassword?: string | undefined;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function hashPassword(password: string, rounds = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    bcryptjs.hash(password, rounds, (error, hash) => {
      if (error) reject(error);
      else resolve(hash);
    });
  });
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcryptjs.compare(password, hash, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createLocalAuth(
  pool: Pool,
  database: Database,
  config: LocalAuthConfig,
): AuthPort {
  const db = drizzle({ client: pool });
  type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

  const login = async (
    email: string,
    password: string,
  ): Promise<{ token: string } | undefined> => {
    const normalized = normalizeEmail(email);
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized));
    const user = rows[0];
    if (!user || !user.active) return undefined;
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return undefined;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.insert(sessions).values({
      id: token,
      userId: user.id,
      expiresAt,
    });
    return { token };
  };

  const verifySession = async (
    token: string,
  ): Promise<
    | { userId: string; email: string; name: string; isAdmin: boolean }
    | undefined
  > => {
    const rows = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.id, token),
          gt(sessions.expiresAt, new Date()),
          eq(users.active, true),
        ),
      );
    const row = rows[0];
    if (!row) return undefined;
    return {
      userId: row.user.id,
      email: row.user.email,
      name: row.user.name,
      isAdmin: row.user.isAdmin,
    };
  };

  const authorizeWorkspace = async (
    userId: string,
    workspaceId: string,
  ): Promise<{ role: WorkspaceRole } | undefined> => {
    return database.withWorkspace(workspaceId, async (tx) => {
      const rows = await tx
        .select({ role: memberships.role })
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.workspaceId, workspaceId),
          ),
        );
      const membership = rows[0];
      if (!membership) return undefined;
      return { role: membership.role as WorkspaceRole };
    });
  };

  const listUserWorkspaces = async (userId: string) =>
    database.withUser(userId, async (tx) => {
      const rows = await tx
        .select({
          workspaceId: memberships.workspaceId,
          workspaceName: workspaces.name,
          role: memberships.role,
          onboardedAt: workspaces.onboardedAt,
        })
        .from(memberships)
        .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
        .where(eq(memberships.userId, userId));
      return rows.map(({ onboardedAt, ...row }) => ({
        ...row,
        onboarded: onboardedAt !== null,
      }));
    });

  const createUser = async (input: {
    email: string;
    name: string;
    password: string;
    workspaceId?: string;
    role?: WorkspaceRole;
  }): Promise<{ userId: string } | undefined> => {
    const normalized = normalizeEmail(input.email);
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalized));
    if (existing[0]) return undefined;
    const passwordHash = await hashPassword(input.password);
    const rows = await db
      .insert(users)
      .values({
        email: normalized,
        name: input.name,
        passwordHash,
      })
      .returning({ id: users.id });
    const user = rows[0];
    if (!user) return undefined;
    const { workspaceId, role } = input;
    if (workspaceId) {
      await database.withWorkspace(workspaceId, async (tx) => {
        await tx.insert(memberships).values({
          userId: user.id,
          workspaceId,
          role: role ?? "agent",
        });
      });
    }
    return { userId: user.id };
  };

  const listUsers = async () =>
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt, users.id);

  const lockGlobalAdminState = async (tx: Transaction) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('maria_auth_global_admin'))`,
    );
  };

  const lockWorkspaceMemberships = async (
    tx: Transaction,
    workspaceId: string,
  ) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('maria_auth_memberships'), hashtext(${workspaceId}))`,
    );
  };

  const countActiveAdmins = async (tx: Pick<Transaction, "select">) => {
    const rows = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.isAdmin, true), eq(users.active, true)));
    return rows.length;
  };

  const updateUser = async (
    userId: string,
    input: { name?: string | undefined; active?: boolean | undefined },
  ): Promise<"updated" | "not-found" | "last-admin"> => {
    return db.transaction(async (tx) => {
      if (input.active === false) await lockGlobalAdminState(tx);
      const rows = await tx
        .select({ isAdmin: users.isAdmin, active: users.active })
        .from(users)
        .where(eq(users.id, userId));
      const user = rows[0];
      if (!user) return "not-found";
      if (
        input.active === false &&
        user.isAdmin &&
        user.active &&
        (await countActiveAdmins(tx)) <= 1
      ) {
        return "last-admin";
      }
      const set: { name?: string; active?: boolean } = {};
      if (input.name !== undefined) set.name = input.name;
      if (input.active !== undefined) set.active = input.active;
      if (Object.keys(set).length === 0) return "updated";
      await tx.update(users).set(set).where(eq(users.id, userId));
      return "updated";
    });
  };

  const changePassword = async (
    userId: string,
    input: {
      currentPassword: string;
      newPassword: string;
      exceptToken?: string | undefined;
    },
  ): Promise<"updated" | "invalid-password" | "not-found"> => {
    const rows = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId));
    const user = rows[0];
    if (!user) return "not-found";
    const valid = await verifyPassword(
      input.currentPassword,
      user.passwordHash,
    );
    if (!valid) return "invalid-password";
    const passwordHash = await hashPassword(input.newPassword);
    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
      // Revoke every other session so a leaked token cannot outlive a
      // password change; the caller's session stays valid via exceptToken.
      await tx
        .delete(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            input.exceptToken ? ne(sessions.id, input.exceptToken) : undefined,
          ),
        );
    });
    return "updated";
  };

  const listMembers = async (workspaceId: string) =>
    database.withWorkspace(workspaceId, async (tx) =>
      tx
        .select({
          id: memberships.id,
          userId: memberships.userId,
          role: memberships.role,
          email: users.email,
          name: users.name,
        })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(eq(memberships.workspaceId, workspaceId)),
    );

  const addMembership = async (input: {
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
  }): Promise<"created" | "duplicate" | "not-found"> => {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);
    if (!user[0]) return "not-found";
    const workspace = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.id, input.workspaceId))
      .limit(1);
    if (!workspace[0]) return "not-found";
    return database.withWorkspace(input.workspaceId, async (tx) => {
      const rows = await tx
        .insert(memberships)
        .values(input)
        .onConflictDoNothing()
        .returning({ id: memberships.id });
      return rows[0] ? "created" : "duplicate";
    });
  };

  const isLastWorkspaceAdmin = async (
    tx: Pick<Transaction, "select">,
    workspaceId: string,
    membershipId: string,
  ): Promise<boolean> => {
    const rows = await tx
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        and(
          eq(memberships.workspaceId, workspaceId),
          eq(memberships.role, "admin"),
        ),
      );
    return rows.length === 1 && rows[0]?.id === membershipId;
  };

  const updateMembershipRole = async (
    workspaceId: string,
    membershipId: string,
    role: WorkspaceRole,
    actorRole: WorkspaceRole,
  ): Promise<"updated" | "not-found" | "last-admin" | "forbidden"> => {
    return database.withWorkspace(workspaceId, async (tx) => {
      await lockWorkspaceMemberships(tx, workspaceId);
      const rows = await tx
        .select({ role: memberships.role })
        .from(memberships)
        .where(eq(memberships.id, membershipId));
      const membership = rows[0];
      if (!membership) return "not-found";
      // Rank checks run under the advisory lock so a concurrent promotion
      // cannot slip a now-unmanageable target past the actor.
      if (
        !canManageRole(actorRole, membership.role) ||
        !canManageRole(actorRole, role)
      ) {
        return "forbidden";
      }
      if (
        membership.role === "admin" &&
        role !== "admin" &&
        (await isLastWorkspaceAdmin(tx, workspaceId, membershipId))
      ) {
        return "last-admin";
      }
      await tx
        .update(memberships)
        .set({ role })
        .where(eq(memberships.id, membershipId));
      return "updated";
    });
  };

  const removeMembership = async (
    workspaceId: string,
    membershipId: string,
    actorRole: WorkspaceRole,
  ): Promise<"removed" | "not-found" | "last-admin" | "forbidden"> => {
    return database.withWorkspace(workspaceId, async (tx) => {
      await lockWorkspaceMemberships(tx, workspaceId);
      const rows = await tx
        .select({ role: memberships.role })
        .from(memberships)
        .where(eq(memberships.id, membershipId));
      const membership = rows[0];
      if (!membership) return "not-found";
      if (!canManageRole(actorRole, membership.role)) {
        return "forbidden";
      }
      if (
        membership.role === "admin" &&
        (await isLastWorkspaceAdmin(tx, workspaceId, membershipId))
      ) {
        return "last-admin";
      }
      await tx.delete(memberships).where(eq(memberships.id, membershipId));
      return "removed";
    });
  };

  const inviteTokenHash = (token: string): string =>
    createHash("sha256").update(token).digest("hex");

  const createInvitation = async (input: {
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
  }): Promise<
    | { id: string; token: string; expiresAt: Date }
    | "already-member"
    | "conflict"
  > =>
    database.withWorkspace(input.workspaceId, async (tx) => {
      const email = normalizeEmail(input.email);
      const memberRows = await tx
        .select({ id: memberships.id })
        .from(memberships)
        .innerJoin(users, eq(users.id, memberships.userId))
        .where(
          and(
            eq(memberships.workspaceId, input.workspaceId),
            eq(users.email, email),
          ),
        )
        .limit(1);
      if (memberRows[0]) return "already-member";
      // One live invitation per (workspace, email): predecessors are revoked
      // before the insert; the partial unique index serializes races.
      const now = new Date();
      await tx
        .update(invitations)
        .set({ consumedAt: now })
        .where(
          and(
            eq(invitations.workspaceId, input.workspaceId),
            eq(invitations.email, email),
            isNull(invitations.consumedAt),
          ),
        );
      const token = randomBytes(24).toString("base64url");
      const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);
      try {
        const rows = await tx
          .insert(invitations)
          .values({
            email,
            workspaceId: input.workspaceId,
            role: input.role,
            tokenHash: inviteTokenHash(token),
            expiresAt,
            invitedBy: input.invitedBy,
          })
          .returning({ id: invitations.id });
        const row = rows[0];
        if (!row) throw new Error("invitation insert returned no row");
        return { id: row.id, token, expiresAt };
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "23505"
        ) {
          return "conflict";
        }
        throw error;
      }
    });

  const listInvitations = async (workspaceId: string) =>
    database.withWorkspace(workspaceId, (tx) =>
      tx
        .select({
          id: invitations.id,
          email: invitations.email,
          role: invitations.role,
          expiresAt: invitations.expiresAt,
          createdAt: invitations.createdAt,
        })
        .from(invitations)
        .where(
          and(
            eq(invitations.workspaceId, workspaceId),
            isNull(invitations.consumedAt),
          ),
        )
        .orderBy(desc(invitations.createdAt)),
    );

  const revokeInvitation = async (
    workspaceId: string,
    invitationId: string,
  ): Promise<"revoked" | "not-found"> =>
    database.withWorkspace(workspaceId, async (tx) => {
      const rows = await tx
        .update(invitations)
        .set({ consumedAt: new Date() })
        .where(
          and(eq(invitations.id, invitationId), isNull(invitations.consumedAt)),
        )
        .returning({ id: invitations.id });
      return rows[0] ? "revoked" : "not-found";
    });

  const previewInvitation = async (
    token: string,
  ): Promise<
    | {
        email: string;
        workspaceId: string;
        workspaceName: string;
        role: WorkspaceRole;
        expiresAt: Date;
      }
    | "invalid"
    | "unusable"
  > => {
    const tokenHash = inviteTokenHash(token);
    return database.withInvitation(tokenHash, async (tx) => {
      const rows = await tx
        .select({
          email: invitations.email,
          role: invitations.role,
          expiresAt: invitations.expiresAt,
          consumedAt: invitations.consumedAt,
          workspaceId: invitations.workspaceId,
          workspaceName: workspaces.name,
        })
        .from(invitations)
        .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
        .where(eq(invitations.tokenHash, tokenHash))
        .limit(1);
      const invite = rows[0];
      if (!invite) return "invalid";
      if (invite.consumedAt || invite.expiresAt <= new Date()) {
        return "unusable";
      }
      return {
        email: invite.email,
        workspaceId: invite.workspaceId,
        workspaceName: invite.workspaceName,
        role: invite.role,
        expiresAt: invite.expiresAt,
      };
    });
  };

  const acceptInvitation = async (
    token: string,
    input: { name?: string; password?: string; userId?: string },
  ): Promise<
    | {
        kind: "created" | "attached" | "already-member";
        userId: string;
        email: string;
      }
    | "invalid"
    | "unusable"
    | "user-exists"
    | "email-mismatch"
  > => {
    const tokenHash = inviteTokenHash(token);
    return database.withInvitation(tokenHash, async (tx) => {
      const rows = await tx
        .select({
          id: invitations.id,
          email: invitations.email,
          role: invitations.role,
          workspaceId: invitations.workspaceId,
          expiresAt: invitations.expiresAt,
          consumedAt: invitations.consumedAt,
        })
        .from(invitations)
        .where(eq(invitations.tokenHash, tokenHash))
        .limit(1);
      const invite = rows[0];
      if (!invite) return "invalid";
      if (invite.consumedAt || invite.expiresAt <= new Date()) {
        return "unusable";
      }
      // Identity resolution happens before consumption so a failed check
      // (existing account, mismatched session) leaves the invitation live.
      let userId: string | undefined;
      let kind: "created" | "attached";
      let passwordHash: string | undefined;
      if (input.userId) {
        const callers = await tx
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);
        const caller = callers[0];
        if (!caller || caller.email !== invite.email) {
          return "email-mismatch";
        }
        userId = caller.id;
        kind = "attached";
      } else {
        const existing = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, invite.email))
          .limit(1);
        if (existing[0]) return "user-exists";
        if (!input.name || !input.password) return "invalid";
        passwordHash = await hashPassword(input.password);
        kind = "created";
      }
      // Workspace scope is required for the membership insert; the invitation
      // row stays visible through the token-hash policy clause.
      await tx.execute(
        sql`select set_config('app.workspace_id', ${invite.workspaceId}, true)`,
      );
      // Consumption is atomic: racing acceptors serialize on the row lock and
      // the loser re-evaluates consumed_at as set — before touching users.
      const consumed = await tx
        .update(invitations)
        .set({ consumedAt: new Date() })
        .where(
          and(eq(invitations.id, invite.id), isNull(invitations.consumedAt)),
        )
        .returning({ id: invitations.id });
      if (!consumed[0]) return "unusable";
      if (kind === "created") {
        const inserted = await tx
          .insert(users)
          .values({
            email: invite.email,
            name: input.name!,
            passwordHash: passwordHash!,
          })
          .returning({ id: users.id });
        const user = inserted[0];
        if (!user) throw new Error("invitation failed to create the user");
        userId = user.id;
      }
      if (!userId) throw new Error("invitation resolved no user");
      const membership = await tx
        .insert(memberships)
        .values({
          userId,
          workspaceId: invite.workspaceId,
          role: invite.role,
        })
        .onConflictDoNothing()
        .returning({ id: memberships.id });
      if (!membership[0]) {
        return { kind: "already-member", userId, email: invite.email };
      }
      return { kind, userId, email: invite.email };
    });
  };

  /** Stored step records win; otherwise auto-resolve from workspace facts so
   * already-satisfied steps arrive done and the wizard can skip them. */
  const resolveOnboardingSteps = async (
    tx: Transaction,
    state: WorkspaceOnboardingState,
  ): Promise<OnboardingStep[]> => {
    const stored = state.steps ?? {};
    const channelRows = await tx
      .select({ id: channelInstances.id })
      .from(channelInstances)
      .limit(1);
    const memberRows = await tx
      .select({ id: memberships.id })
      .from(memberships);
    const autoDone: Partial<Record<OnboardingStepId, boolean>> = {
      channel: channelRows.length > 0,
      team: memberRows.length > 1,
    };
    return ONBOARDING_STEPS.map((id) => {
      const record = stored[id];
      return {
        id,
        status: record?.status ?? (autoDone[id] ? "done" : "pending"),
        data: record?.data,
      };
    });
  };

  const getOnboarding = async (
    workspaceId: string,
  ): Promise<OnboardingView | undefined> =>
    database.withWorkspace(workspaceId, async (tx) => {
      const rows = await tx
        .select({
          name: workspaces.name,
          onboardingState: workspaces.onboardingState,
          onboardedAt: workspaces.onboardedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));
      const workspace = rows[0];
      if (!workspace) return undefined;
      return {
        workspaceName: workspace.name,
        onboardedAt: workspace.onboardedAt,
        steps: await resolveOnboardingSteps(tx, workspace.onboardingState),
      };
    });

  const updateOnboardingStep = async (
    workspaceId: string,
    step: OnboardingStepId,
    input: {
      status: "done" | "skipped";
      data?: Record<string, unknown> | undefined;
    },
  ): Promise<
    "updated" | "not-found" | "invalid-step" | "already-onboarded"
  > => {
    if (step === "review") return "invalid-step";
    return database.withWorkspace(workspaceId, async (tx) => {
      // FOR UPDATE serializes step writes against a concurrent completion —
      // read-modify-write then merges on the latest committed state.
      const rows = await tx
        .select({
          onboardingState: workspaces.onboardingState,
          onboardedAt: workspaces.onboardedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .for("update");
      const workspace = rows[0];
      if (!workspace) return "not-found";
      if (workspace.onboardedAt) return "already-onboarded";
      const record = input.data
        ? { status: input.status, data: input.data }
        : { status: input.status };
      const state = workspace.onboardingState ?? {};
      await tx
        .update(workspaces)
        .set({
          onboardingState: {
            ...state,
            steps: { ...state.steps, [step]: record },
          },
        })
        .where(eq(workspaces.id, workspaceId));
      return "updated";
    });
  };

  const completeOnboarding = async (
    workspaceId: string,
  ): Promise<{ onboardedAt: Date } | "not-found" | "incomplete"> =>
    database.withWorkspace(workspaceId, async (tx) => {
      const rows = await tx
        .select({
          onboardingState: workspaces.onboardingState,
          onboardedAt: workspaces.onboardedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .for("update");
      const workspace = rows[0];
      if (!workspace) return "not-found";
      if (workspace.onboardedAt) return { onboardedAt: workspace.onboardedAt };
      const steps = await resolveOnboardingSteps(tx, workspace.onboardingState);
      if (steps.some((s) => s.id !== "review" && s.status === "pending")) {
        return "incomplete";
      }
      const onboardedAt = new Date();
      const state = workspace.onboardingState ?? {};
      await tx
        .update(workspaces)
        .set({
          onboardedAt,
          onboardingState: {
            ...state,
            steps: { ...state.steps, review: { status: "done" } },
          },
        })
        .where(eq(workspaces.id, workspaceId));
      return { onboardedAt };
    });

  const setupRequired = async (): Promise<boolean> => {
    const rows = await db.select({ id: users.id }).from(users).limit(1);
    return rows.length === 0;
  };

  const completeSetup = async (input: {
    email: string;
    name: string;
    password: string;
    workspaceName: string;
  }): Promise<{ userId: string; workspaceId: string } | "already-setup"> => {
    const passwordHash = await hashPassword(input.password);
    const workspaceId = randomUUID();
    return database.withWorkspace(workspaceId, async (tx) => {
      await lockGlobalAdminState(tx);
      const existing = await tx.select({ id: users.id }).from(users).limit(1);
      if (existing[0]) return "already-setup";
      const userRows = await tx
        .insert(users)
        .values({
          email: normalizeEmail(input.email),
          name: input.name,
          passwordHash,
          isAdmin: true,
        })
        .returning({ id: users.id });
      const user = userRows[0];
      if (!user) throw new Error("setup failed to create the master user");
      const orgRows = await tx
        .insert(organizations)
        .values({ name: input.workspaceName })
        .returning({ id: organizations.id });
      const organization = orgRows[0];
      if (!organization) {
        throw new Error("setup failed to create the default organization");
      }
      await tx.insert(workspaces).values({
        id: workspaceId,
        orgId: organization.id,
        name: input.workspaceName,
      });
      await tx.insert(memberships).values({
        userId: user.id,
        workspaceId,
        role: "admin",
      });
      return { userId: user.id, workspaceId };
    });
  };

  const seedAdmin = async (): Promise<void> => {
    if (!config.adminEmail || !config.adminPassword) return;
    const normalized = normalizeEmail(config.adminEmail);
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalized));
    if (rows[0]) return;
    const passwordHash = await hashPassword(config.adminPassword);
    await db.insert(users).values({
      email: normalized,
      name: "Admin",
      passwordHash,
      isAdmin: true,
    });
  };

  return {
    login,
    verifySession,
    authorizeWorkspace,
    listUserWorkspaces,
    createUser,
    listUsers,
    updateUser,
    changePassword,
    listMembers,
    addMembership,
    updateMembershipRole,
    removeMembership,
    createInvitation,
    listInvitations,
    revokeInvitation,
    previewInvitation,
    acceptInvitation,
    getOnboarding,
    updateOnboardingStep,
    completeOnboarding,
    setupRequired,
    completeSetup,
    seedAdmin,
  };
}
