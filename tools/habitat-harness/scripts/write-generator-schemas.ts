import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PatternGeneratorOptionsSchema } from "../src/generators/pattern/schema.ts";
import { HabitatProjectGeneratorNxSchema } from "../src/generators/project/schema.ts";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPaths = [
  "src/generators/project/schema.json",
  "src/generators/pattern/schema.json",
] as const;

writeSchema(schemaPaths[0], HabitatProjectGeneratorNxSchema);
writeSchema(schemaPaths[1], PatternGeneratorOptionsSchema);
execFileSync("bunx", ["biome", "format", "--write", ...schemaPaths], {
  cwd: packageRoot,
  stdio: "inherit",
});

function writeSchema(relativePath: string, schema: unknown): void {
  writeFileSync(join(packageRoot, relativePath), `${JSON.stringify(schema, null, 2)}\n`);
}
