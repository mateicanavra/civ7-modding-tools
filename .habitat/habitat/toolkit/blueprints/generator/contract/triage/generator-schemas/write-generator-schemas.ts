// Habitat-owned generated-schema adapter.
//
// Integration note: generator metadata now reads the schemas from this
// authority-tree packet. The Toolkit still needs a first-class generator schema
// packet model, but the compatibility writer no longer emits the retired
// `.habitat/tooling/components` paths.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PatternGeneratorOptionsSchema } from "@habitat/cli/generators/scaffold/pattern/support/schema";
import { HabitatProjectGeneratorNxSchema } from "@habitat/cli/generators/scaffold/project/support/schema";

const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
const schemaPaths = [
  ".habitat/habitat/toolkit/blueprints/generator/contract/triage/generator-schemas/scaffold-project.schema.json",
  ".habitat/habitat/toolkit/blueprints/generator/contract/triage/generator-schemas/scaffold-pattern.schema.json",
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

function findRepoRoot(startDirectory: string): string {
  let current = startDirectory;
  while (true) {
    if (
      existsSync(join(current, ".habitat")) &&
      existsSync(join(current, "tools/habitat/package.json"))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Unable to locate repository root from ${startDirectory}`);
    }
    current = parent;
  }
}
