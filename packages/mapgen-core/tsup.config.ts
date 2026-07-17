import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "tsconfig.json",
  entry: [
    "src/index.ts",
    "src/engine/index.ts",
    "src/authoring/index.ts",
    "src/authoring/contracts.ts",
    "src/authoring/recipe-dag.ts",
    "src/compiler/normalize.ts",
    "src/compiler/recipe-compile.ts",
    "src/lib/math/index.ts",
    "src/lib/grid/index.ts",
    "src/lib/plates/index.ts",
    "src/lib/rng/index.ts",
    "src/lib/noise/index.ts",
    "src/lib/collections/index.ts",
    "src/lib/mesh/index.ts",
  ],
  format: ["esm"],
  target: "esnext",
  dts: true,
  clean: true,
  // Core stays runtime-neutral. Final Civ7 map bundlers own embedded-V8 compatibility.
  external: [/^\/base-standard\/.*/],
});
