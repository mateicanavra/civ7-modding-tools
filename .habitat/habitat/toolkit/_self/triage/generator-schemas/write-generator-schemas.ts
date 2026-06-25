// Habitat-owned generated-schema adapter.
//
// Integration note: this file has moved into the provisional niche hierarchy,
// but the generator bridge still writes and package metadata still reads the
// old `.habitat/tooling/components/generator-schemas` paths. A follow-up
// Toolkit integration slice must choose the accepted resolver path and update
// this adapter, `tools/habitat/generators.json`, schema support docs,
// and package scripts together.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PatternGeneratorOptionsSchema } from "../../../../../../tools/habitat/src/generators/scaffold/pattern/support/schema.ts";
import { HabitatProjectGeneratorNxSchema } from "../../../../../../tools/habitat/src/generators/scaffold/project/support/schema.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "..");
const schemaPaths = [
  ".habitat/tooling/components/generator-schemas/scaffold/project/schema.json",
  ".habitat/tooling/components/generator-schemas/scaffold/pattern/schema.json",
] as const;

writeSchema(schemaPaths[0], HabitatProjectGeneratorNxSchema);
writeSchema(schemaPaths[1], PatternGeneratorOptionsSchema);
execFileSync("bunx", ["biome", "format", "--write", ...schemaPaths], {
  cwd: repoRoot,
  stdio: "inherit",
});

function writeSchema(relativePath: string, schema: unknown): void {
  writeFileSync(join(repoRoot, relativePath), `${JSON.stringify(schema, null, 2)}\n`);
}
