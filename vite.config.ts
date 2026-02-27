import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
