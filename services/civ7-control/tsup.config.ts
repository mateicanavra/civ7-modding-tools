import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/contract.ts"],
  format: ["esm", "cjs"],
  target: "esnext",
  clean: true,
});
