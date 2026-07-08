import { defineConfig } from "tsup";

/**
 * Private artifact contract for Studio Run in Game workspaces.
 *
 * This package is intentionally not the public oRPC contract. It is the shared
 * runtime handoff between the Studio server that writes manifests and the
 * Swooper generator that consumes them.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  clean: true,
});
