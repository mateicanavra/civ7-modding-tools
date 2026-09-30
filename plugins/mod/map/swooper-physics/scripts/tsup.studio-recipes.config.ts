import { defineConfig } from "tsup";

/** Builds the Standard recipe and finite metric-study entrypoints consumed by workspace callers. */
export default defineConfig([
  {
    entry: {
      "recipes/standard": "src/recipes/standard/recipe.ts",
    },
    outDir: "dist",
    format: ["esm"],
    target: "esnext",
    dts: false,
    clean: false,
    bundle: true,
    splitting: false,
  },
  {
    entry: {
      "recipes/standard-metrics": "src/recipes/standard/metrics/index.ts",
    },
    outDir: "dist",
    format: ["esm"],
    target: "esnext",
    dts: false,
    clean: false,
    bundle: true,
    splitting: false,
  },
]);
