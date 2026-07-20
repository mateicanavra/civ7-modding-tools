import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ===========================================================================
// Frontend-only Vite config (bun-server workstream; runtime-one-mount slice).
// ---------------------------------------------------------------------------
// The studio server surface is ONE oRPC mount — `/rpc`, hosting the unified
// `@civ7/studio-server` contract (studio + `civ7.*` control + `recipeDag.*`)
// — and ALL server state lives in the standalone Bun daemon
// (src/server/daemon/daemon.ts). Dev orchestration is Nx-owned:
// `mapgen-studio:dev` runs this frontend target after the continuous daemon
// target is active. This config proxies exactly `/rpc` to the daemon. The
// legacy `/api/*` REST handlers and the former satellite mounts are RETIRED —
// `/api` paths 404 at the daemon and are not proxied.
//
// No server modules are imported here anymore: config evaluation is cheap,
// restarts are safe, and the effect-orpc TS-source constraint is gone (the
// daemon runs under Bun, which loads TS natively).
// ===========================================================================

const STUDIO_DEV_PORT = parsePort(process.env.STUDIO_DEV_PORT, 5173, "STUDIO_DEV_PORT");
const STUDIO_DEV_RPC_TARGET = process.env.STUDIO_DEV_RPC_TARGET ?? "http://127.0.0.1:5174";

function parsePort(value: string | undefined, fallback: number, label: string): number {
  if (value === undefined) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`${label} must be an integer from 1 to 65535: ${value}`);
  }
  return port;
}

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // deck.gl -> loaders.gl includes a Node-only helper that imports `child_process`.
      // In the browser, this path is never executed, but Rollup warns because the
      // `child_process` "browser external" stub has no exports. Alias to a tiny
      // browser shim so builds stay clean (and failures are explicit if it ever runs).
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      {
        find: "child_process",
        replacement: fileURLToPath(new URL("./src/shims/child_process.ts", import.meta.url)),
      },
      ...(command === "serve"
        ? [
            {
              find: "@swooper/mapgen-viz",
              replacement: fileURLToPath(
                new URL("../../packages/mapgen-viz/src/index.ts", import.meta.url)
              ),
            },
            // Development serve uses source freshness; production builds have the design goal
            // of package artifact authority. Exact matching prevents this alias from
            // intercepting contract subpaths.
            {
              find: /^@civ7\/studio-contract$/,
              replacement: fileURLToPath(
                new URL("../../packages/studio-contract/src/index.ts", import.meta.url)
              ),
            },
            // DEV-ONLY source alias (DESIGN.md §2 adjudication 7): HMR against
            // the UI package's source barrel; the production build resolves
            // dist via the exports map so the shipped app consumes the real
            // artifact. MUST stay an exact-match regex: string aliases also
            // capture subpaths, and the package's `theme.css`/`fonts.css` are
            // runtime `@import`s in src/index.css that must keep resolving
            // through the exports map (a string key rewrites them under
            // src/index.ts and 500s the dev stylesheet).
            {
              find: /^@swooper\/mapgen-studio-ui$/,
              replacement: fileURLToPath(
                new URL("../../packages/mapgen-studio-ui/src/index.ts", import.meta.url)
              ),
            },
          ]
        : []),
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    host: "127.0.0.1",
    port: STUDIO_DEV_PORT,
    strictPort: true,
    proxy: {
      "/rpc": { target: STUDIO_DEV_RPC_TARGET },
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
