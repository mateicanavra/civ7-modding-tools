import { defineConfig } from "tsup";

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
