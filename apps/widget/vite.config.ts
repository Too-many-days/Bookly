import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/bookly-widget.ts"),
      name: "BooklyWidget",
      fileName: "embed",
      formats: ["iife"],
    },
    outDir: "dist",
    minify: "esbuild",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
