import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import mapResolution from "@civ7/api/map-resolution" with { type: "json" };
import { defineConfig } from "tsup";

const resolutionRoot = dirname(fileURLToPath(import.meta.resolve("@civ7/api/map-resolution")));
const declarationPaths = Object.fromEntries(
  Object.entries(mapResolution.compilerOptions.paths).map(([moduleId, paths]) => [
    moduleId,
    paths.map((path) => resolve(resolutionRoot, path)),
  ])
);

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
  dts: {
    compilerOptions: { paths: declarationPaths },
  },
  clean: true,
  // CRITICAL: Keep /base-standard/... imports external
  // These are resolved at runtime by the Civ7 game engine
  external: [/^\/base-standard\/.*/],
  // Bundle our workspace dependencies
  noExternal: ["@civ7/types"],
});
