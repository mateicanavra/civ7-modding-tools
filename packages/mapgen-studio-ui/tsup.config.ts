import { defineConfig } from "tsup";

/**
 * `@swooper/mapgen-studio-ui` build — JS half.
 *
 * tsup bundles `src/index.ts` → `dist/index.js` (ESM, browser, workspace and
 * npm deps auto-external). Declarations do NOT come from tsup: the `build`
 * script runs a separate strict `tsc -p tsconfig.dts.json` tree emit into
 * `dist/types/` (fails on any type error — no TS7056 tolerance), which both
 * the `types` export conditions and the design-sync converter resolve from.
 * The stylesheet (`dist/styles.css`) and fonts (`dist/fonts/`) are produced by
 * the tailwind CLI + `scripts/copy-fonts.mjs` steps of the same script.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "browser",
  dts: false,
  clean: true,
});
