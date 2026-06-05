import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "civ7-intelligence-bridge": "src/ui/civ7-intelligence-bridge.ts",
  },
  outDir: "mod/ui",
  format: ["esm"],
  target: "esnext",
  bundle: true,
  splitting: false,
  skipNodeModulesBundle: false,
  clean: true,
  noExternal: [
    "@civ7/control-orpc",
    "@orpc/client",
    "@orpc/contract",
    "@orpc/server",
    "@orpc/shared",
    "@standard-schema/spec",
    "effect",
    "effect-orpc",
    "typebox",
  ],
  sourcemap: false,
  minify: false,
});
