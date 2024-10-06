import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "crypto";

export default defineConfig({
  base: "/apps/ucm",
  plugins: [react()],
  resolve: {
    alias: { "@": new URL("./src/", import.meta.url).pathname },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (a) => {
          let hash = createHash("sha256");
          hash.update(a.source);
          hash.update(a.name!);
          const str = hash.digest("hex").slice(0, 16);
          return `assets/${str}-${a.name}`;
        },
        entryFileNames: (c) => {
          let hash = createHash("sha256");
          for (let m of c.moduleIds) {
            hash.update(m);
          }
          const str = hash.digest("hex").slice(0, 16);
          return `assets/${str}-${c.name}.js`;
        },
      },
    },
  },
});
