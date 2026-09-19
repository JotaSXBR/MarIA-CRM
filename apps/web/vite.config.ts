import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const api = "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/health": api,
      "/auth": api,
      // `/setup` is both an API endpoint (POST + GET /setup/status) and a SPA
      // route: browser page loads stay local, API calls proxy through.
      "/setup": {
        target: api,
        bypass: (req) =>
          req.method === "GET" && req.url !== "/setup/status"
            ? req.url
            : undefined,
      },
      "/me": api,
      "/admin": api,
      "/members": api,
      // `/invitations` API calls proxy through; the SPA acceptance route lives
      // at `/invite/$token` so there is no path collision.
      "/invitations": api,
      // `/onboarding` is both a SPA route and an API prefix: browser page
      // loads stay local, API calls (which always carry `workspaceId`) proxy
      // through — same pattern as `/setup`.
      "/onboarding": {
        target: api,
        bypass: (req) =>
          req.method === "GET" && !req.url?.includes("workspaceId=")
            ? req.url
            : undefined,
      },
      "/contacts": api,
      "/companies": api,
      "/pipelines": api,
      "/stages": api,
      "/deals": api,
      "/conversations": api,
      "/messages": api,
      "/notes": api,
      "/tasks": api,
      "/tags": api,
      "/attributes": api,
      "/search": api,
      "/channel-instances": api,
      "/webhooks": api,
    },
  },
});
