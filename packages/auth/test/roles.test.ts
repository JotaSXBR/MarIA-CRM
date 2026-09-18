import { describe, expect, test } from "vitest";
import {
  ROLE_RANK,
  WORKSPACE_ROLES,
  hasWorkspaceRole,
  type WorkspaceRole,
} from "../src/index.ts";

describe("workspace role rank", () => {
  test("orders viewer < agent < manager < admin", () => {
    expect(WORKSPACE_ROLES).toEqual(["viewer", "agent", "manager", "admin"]);
    expect(WORKSPACE_ROLES.map((role) => ROLE_RANK[role])).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test.each([
    ["viewer", "viewer", true],
    ["viewer", "agent", false],
    ["agent", "viewer", true],
    ["agent", "manager", false],
    ["manager", "agent", true],
    ["manager", "admin", false],
    ["admin", "manager", true],
    ["admin", "viewer", true],
  ] as [WorkspaceRole, WorkspaceRole, boolean][])(
    "hasWorkspaceRole(%s, %s) === %s",
    (role, minimum, expected) => {
      expect(hasWorkspaceRole(role, minimum)).toBe(expected);
    },
  );
});
