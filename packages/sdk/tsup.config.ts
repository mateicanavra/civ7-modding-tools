import { defineConfig } from "tsup";

const shared = {
  tsconfig: "tsconfig.json",
  target: "esnext",
  clean: false,
} as const;

export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/index.ts",
      "mapgen/index": "src/mapgen/index.ts",
    },
    format: ["esm"],
    dts: true,
  },
  {
    ...shared,
    entry: {
      index: "src/index.ts",
    },
    format: ["cjs"],
    dts: false,
  },
]);
