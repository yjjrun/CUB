import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: Vite serves the SPA and proxies the JSON API to the Python server
// (run `npm run api` in another terminal). Prod: `vite build` -> dist/, served
// by nginx which proxies /api/* to the Python app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "dist",
  },
});
