import { defineConfig } from "tsup";

/** Builds the Standard recipe bundle consumed by MapGen Studio's browser runner. */
export default defineConfig({
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
});
