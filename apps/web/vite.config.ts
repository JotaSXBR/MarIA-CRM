import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const api = "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
      "/channel-instances": api,
      "/webhooks": api,
    },
  },
});
