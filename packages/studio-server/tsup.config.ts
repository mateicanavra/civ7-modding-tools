import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/contract/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
});
