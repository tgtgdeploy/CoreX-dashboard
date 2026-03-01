import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

import { cloudflare } from "@cloudflare/vite-plugin";

// Cloudflare Pages SPA: copy index.html → 404.html so unknown paths get the SPA shell
function spa404Plugin(): Plugin {
  return {
    name: "spa-404",
    closeBundle() {
      const out = path.resolve(import.meta.dirname, "dist");
      const src = path.join(out, "index.html");
      const dest = path.join(out, "404.html");
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [react(), spa404Plugin(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "src", "types"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://fitufrqpmcsxbvubjyqd.supabase.co/functions/v1",
        changeOrigin: true,
        rewrite: (p) => p,
      },
    },
  },
});