// Habitat-owned generated-schema adapter. Integration note: Nx still requires
// schema JSON files at stable paths; this script writes those bridge assets
// under `.habitat` while TypeBox schema definitions remain in the SDK source.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PatternGeneratorOptionsSchema } from "../../../../tools/habitat-harness/src/generators/scaffold/pattern/support/schema.ts";
import { HabitatProjectGeneratorNxSchema } from "../../../../tools/habitat-harness/src/generators/scaffold/project/support/schema.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
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
