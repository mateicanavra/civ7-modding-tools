import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/runtime.ts"],
  format: ["esm", "cjs"],
  target: "esnext",
  clean: true,
  noExternal: ["effect-orpc"],
});
