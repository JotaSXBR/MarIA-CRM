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
      "/me": api,
      "/admin": api,
      "/contacts": api,
      "/companies": api,
      "/pipelines": api,
      "/stages": api,
      "/deals": api,
      "/conversations": api,
      "/messages": api,
      "/notes": api,
      "/tasks": api,
      "/channel-instances": api,
      "/webhooks": api,
    },
  },
});
