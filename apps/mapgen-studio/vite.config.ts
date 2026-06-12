import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// ===========================================================================
// Frontend-only Vite config (bun-server workstream, daemon cutover).
// ---------------------------------------------------------------------------
// The studio server surface — `/rpc` (studio-server), `/api/civ7/rpc`
// (control-oRPC), `/api/recipe-dag/rpc` (recipe DAG), and ALL server state —
// lives in the standalone Bun daemon (src/server/daemon/daemon.ts). Dev runs
// both via `bun run dev` (src/server/daemon/devLive.ts); this config only
// proxies `/rpc` + `/api` to the daemon. The legacy hand-rolled `/api/*` REST
// handlers are RETIRED (user directive 2026-06-12: no legacy, no fallbacks) —
// unknown `/api` paths 404 at the daemon.
//
// No server modules are imported here anymore: config evaluation is cheap,
// restarts are safe, and the effect-orpc TS-source constraint is gone (the
// daemon runs under Bun, which loads TS natively).
// ===========================================================================

const STUDIO_DEV_RPC_TARGET = process.env.STUDIO_DEV_RPC_TARGET ?? "http://127.0.0.1:5174";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // deck.gl -> loaders.gl includes a Node-only helper that imports `child_process`.
      // In the browser, this path is never executed, but Rollup warns because the
      // `child_process` "browser external" stub has no exports. Alias to a tiny
      // browser shim so builds stay clean (and failures are explicit if it ever runs).
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      child_process: fileURLToPath(new URL("./src/shims/child_process.ts", import.meta.url)),
      ...(command === "serve"
        ? {
            "@swooper/mapgen-viz": fileURLToPath(
              new URL("../../packages/mapgen-viz/src/index.ts", import.meta.url)
            ),
          }
        : {}),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/rpc": { target: STUDIO_DEV_RPC_TARGET },
      "/api": { target: STUDIO_DEV_RPC_TARGET },
    },
    watch: {
      ignored: [
        "**/mods/mod-swooper-maps/dist/**",
        "**/mods/mod-swooper-maps/mod/**",
        "**/mods/mod-swooper-maps/src/maps/generated/**",
        "**/mods/mod-swooper-maps/src/maps/configs/*.config.json",
        "**/packages/*/dist/**",
        "**/packages/*/types/**",
      ],
    },
  },
}));
