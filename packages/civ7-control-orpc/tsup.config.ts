import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/runtime.ts", "src/game-ui.ts"],
  format: ["esm", "cjs"],
  target: "esnext",
  clean: true,
  noExternal: ["effect-orpc"],
});
