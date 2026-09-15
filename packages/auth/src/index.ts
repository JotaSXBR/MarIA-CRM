import { randomBytes } from "node:crypto";
import bcryptjs from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, gt } from "drizzle-orm";
import type { Pool } from "pg";
import type { Database } from "@maria/database";
import { memberships, sessions, users } from "@maria/database/schema";

export type UserRole = "admin" | "member";

export type AuthPort = {
  login(
    email: string,
    password: string,
  ): Promise<{ token: string } | undefined>;
  verifySession(
    token: string,
  ): Promise<{ userId: string; email: string; isAdmin: boolean } | undefined>;
  authorizeWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<{ role: UserRole } | undefined>;
  createUser(input: {
    email: string;
    name: string;
    password: string;
    workspaceId?: string | undefined;
    role?: UserRole | undefined;
  }): Promise<{ userId: string } | undefined>;
  ensureAdmin(userId: string): Promise<boolean>;
  seedAdmin(): Promise<void>;
};

export type LocalAuthConfig = {
  adminEmail?: string | undefined;
  adminPassword?: string | undefined;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

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
    { userId: string; email: string; isAdmin: boolean } | undefined
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
      isAdmin: row.user.isAdmin,
    };
  };

  const authorizeWorkspace = async (
    userId: string,
    workspaceId: string,
  ): Promise<{ role: UserRole } | undefined> => {
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
      return { role: membership.role as UserRole };
    });
  };

  const createUser = async (input: {
    email: string;
    name: string;
    password: string;
    workspaceId?: string;
    role?: UserRole;
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
          role: role ?? "member",
        });
      });
    }
    return { userId: user.id };
  };

  const ensureAdmin = async (userId: string): Promise<boolean> => {
    const rows = await db
      .select({ isAdmin: users.isAdmin, active: users.active })
      .from(users)
      .where(eq(users.id, userId));
    const user = rows[0];
    return user?.isAdmin === true && user?.active === true;
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
    createUser,
    ensureAdmin,
    seedAdmin,
  };
}
