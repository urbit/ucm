import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { createHash } from "crypto";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/ublog",
  plugins: [react()],
});
