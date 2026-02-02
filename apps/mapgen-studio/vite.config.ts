import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // deck.gl -> loaders.gl includes a Node-only helper that imports `child_process`.
    // In the browser, this path is never executed, but Rollup warns because the
    // `child_process` "browser external" stub has no exports. Alias to a tiny
    // browser shim so builds stay clean (and failures are explicit if it ever runs).
    alias: {
      child_process: fileURLToPath(new URL("./src/shims/child_process.ts", import.meta.url)),
      // Ensure Vite can always resolve the Viz contract helpers in dev, regardless of
      // workspace linking or package.json export nuances.
      "@swooper/mapgen-viz": fileURLToPath(new URL("../../packages/mapgen-viz/src/index.ts", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
