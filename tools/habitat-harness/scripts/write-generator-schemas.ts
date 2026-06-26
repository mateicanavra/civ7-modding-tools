import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PatternGeneratorOptionsSchema } from "@internal/habitat-harness/service/modules/scaffold/pattern/schema";
import { HabitatProjectGeneratorNxSchema } from "@internal/habitat-harness/service/modules/scaffold/project/schema";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPaths = [
  "src/service/modules/scaffold/project/schema.json",
  "src/service/modules/scaffold/pattern/schema.json",
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
