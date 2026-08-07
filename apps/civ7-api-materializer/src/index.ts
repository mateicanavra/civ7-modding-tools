import { resolve } from "node:path";
import { defaultMaterializeOptions, materialize } from "./materialize.js";

const mode = process.argv[2];
if (mode !== "materialize" && mode !== "check") {
  throw new Error("Usage: bun run src/index.ts <materialize|check>");
}

const repoRoot = resolve(import.meta.dir, "../../..");
const result = await materialize(defaultMaterializeOptions(repoRoot, mode === "check"));
console.log(
  JSON.stringify(
    {
      status: mode === "check" ? "current" : "materialized",
      application: result.receipt.source.application.longVersion,
      steamBuildId: result.receipt.source.steam.buildId,
      snapshot: result.receipt.snapshot,
      sourceMaps: result.receipt.sourceMaps,
    },
    null,
    2
  )
);
