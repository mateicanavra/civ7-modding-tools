#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSwooperMapArtifactFilePlan } from "../../../../mods/mod-swooper-maps/scripts/map-artifacts/file-plan";
import { loadSwooperMapConfigRegistry } from "../../../../mods/mod-swooper-maps/scripts/generate-map-artifacts";
import { buildCanonicalMapConfigSchema } from "../../../../mods/mod-swooper-maps/src/maps/configs/canonical";
import { STANDARD_STAGES } from "../../../../mods/mod-swooper-maps/src/recipes/standard/recipe";
import { deriveRecipeConfigSchema } from "../../../../packages/mapgen-core/src/authoring/index";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const generatedDir = join(modRoot, "src/maps/generated");
const failures: string[] = [];

function textContent(file: { content: { kind: "text"; text: string } | { kind: "bytes" } }) {
  if (file.content.kind !== "text") throw new Error(`Expected text artifact ${file}`);
  return file.content.text;
}

const configs = await loadSwooperMapConfigRegistry();
const plan = buildSwooperMapArtifactFilePlan({
  configs,
  envelopeSchema: buildCanonicalMapConfigSchema(deriveRecipeConfigSchema(STANDARD_STAGES)),
});
const expectedGeneratedEntries = plan.files
  .filter((file) => file.kind === "generated-map-entry")
  .map((file) => ({
    relativePath: file.relativePath,
    text: textContent(file),
  }))
  .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
const actualGeneratedPaths = readdirSync(generatedDir)
  .filter((entry) => entry.endsWith(".ts"))
  .map((entry) => `src/maps/generated/${entry}`)
  .sort();
const expectedGeneratedPaths = expectedGeneratedEntries.map((entry) => entry.relativePath);

if (JSON.stringify(actualGeneratedPaths) !== JSON.stringify(expectedGeneratedPaths)) {
  failures.push(
    `generated map entrypoint set drifted: ${JSON.stringify(actualGeneratedPaths)} !== ${JSON.stringify(expectedGeneratedPaths)}`
  );
}

for (const expected of expectedGeneratedEntries) {
  const actualPath = join(modRoot, expected.relativePath);
  const actualText = readFileSync(actualPath, "utf8");
  if (actualText !== expected.text) {
    failures.push(`${expected.relativePath} drifted from the generated map file plan`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
