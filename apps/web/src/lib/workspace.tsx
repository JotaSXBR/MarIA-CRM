import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api.ts";

export type WorkspaceMembership = {
  workspaceId: string;
  workspaceName: string;
  role: "admin" | "member";
};

const WORKSPACE_KEY = "maria.workspace";

type WorkspaceContextValue = {
  memberships: WorkspaceMembership[];
  workspace: WorkspaceMembership | undefined;
  selectWorkspace: (workspaceId: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: memberships = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<WorkspaceMembership[]>("/me/workspaces"),
  });
  const [selectedId, setSelectedId] = useState(() =>
    localStorage.getItem(WORKSPACE_KEY),
  );
  const workspace =
    memberships.find((m) => m.workspaceId === selectedId) ?? memberships[0];

  return (
    <WorkspaceContext.Provider
      value={{
        memberships,
        workspace,
        selectWorkspace: (workspaceId) => {
          localStorage.setItem(WORKSPACE_KEY, workspaceId);
          setSelectedId(workspaceId);
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
