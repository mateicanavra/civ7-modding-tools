import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "tools/tsconfig.json",
  entry: {
    index: "src/index.ts",
    "civ7-adapter": "src/civ7-adapter.ts",
    "mock-adapter": "src/mock-adapter.ts",
    "map-script-build": "tools/map-script-build.ts",
  },
  format: ["esm"],
  target: "esnext",
  dts: true,
  clean: true,
  // CRITICAL: Keep /base-standard/... imports external
  // These are resolved at runtime by the Civ7 game engine
  external: [/^\/base-standard\/.*/],
  // Bundle our workspace dependencies
  noExternal: ["@civ7/types"],
});
