import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    setup: "src/setup.ts",
  },
  format: ["esm"],
  target: "esnext",
  dts: true,
  clean: true,
  external: [/^\/base-standard\/.*/],
  noExternal: [],
});
