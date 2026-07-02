import { defineConfig } from "tsup";

/**
 * `@civ7/studio-contract` build.
 *
 * Pure contract artifact: TypeBox schemas + plain-`oc` routers only. All
 * runtime deps (`@orpc/contract`, `@standard-schema/spec`, TypeBox) ship
 * proper JS and stay external — nothing is bundled in. This package must
 * never grow an `@orpc/server`, `effect`, or `effect-orpc` import; the
 * dependency list enforces that for externals (bun's isolated installs —
 * an undeclared import doesn't resolve), and the `kind:foundation` boundary
 * row fences workspace-package imports.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
});
