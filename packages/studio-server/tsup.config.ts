import { defineConfig } from "tsup";

/**
 * `@civ7/studio-server` build.
 *
 * `effect-orpc` (v0.2.2) publishes its public entry as RAW TypeScript source
 * (`exports["."] = "./src/index.ts"`), with no JS build wired into its `exports`
 * map. Node refuses to type-strip `.ts` files under `node_modules`, so any runtime
 * consumer that imports `@civ7/studio-server` (e.g. the Vite dev config loaded by
 * Node) would crash on `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. We therefore
 * BUNDLE `effect-orpc` into this package's `dist` (`noExternal`) so the shipped
 * `dist/index.js` is self-contained for that dependency. `@orpc/*`, `effect`, and
 * TypeBox ship proper JS and stay external.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/contract/index.ts", "src/liveGame/model.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  noExternal: ["effect-orpc"],
});
