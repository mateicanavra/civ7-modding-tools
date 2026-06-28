// Habitat-owned generated-schema operation.
//
// Generator metadata reads the committed schemas from this authority-tree
// packet. This writer keeps the JSON outputs converged with the Toolkit
// TypeBox schemas that Nx generators cannot consume directly.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
const { HabitatProjectGeneratorNxSchema } = await import(
  pathToFileURL(
    join(repoRoot, "tools/habitat/src/generators/scaffold/project/support/schema.ts")
  ).href
);
const { PatternGeneratorOptionsSchema } = await import(
  pathToFileURL(
    join(repoRoot, "tools/habitat/src/generators/scaffold/pattern/support/schema.ts")
  ).href
);
const schemaPaths = [
  ".habitat/habitat/toolkit/blueprints/generator/contract/generate/generate_generator_schema_contracts/scaffold-project.schema.json",
  ".habitat/habitat/toolkit/blueprints/generator/contract/generate/generate_generator_schema_contracts/scaffold-pattern.schema.json",
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
