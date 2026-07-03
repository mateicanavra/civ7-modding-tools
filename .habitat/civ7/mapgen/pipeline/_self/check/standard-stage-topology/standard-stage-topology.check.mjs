#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  assertEqual,
  assertNoFindings,
  modRoot,
  readMod,
  stagesRoot,
} from "../../_shared/mapgen-static-check-lib.mjs";

const expectedStageIds = [
  "foundation",
  "morphology-coasts",
  "morphology-routing",
  "morphology-erosion",
  "morphology-features",
  "hydrology-climate-baseline",
  "hydrology-hydrography",
  "hydrology-climate-refine",
  "ecology-pedology",
  "ecology-biomes",
  "map-morphology",
  "map-hydrology",
  "map-elevation",
  "map-rivers",
  "ecology-features",
  "map-ecology",
  "placement",
];
const legacyStageAliases = [
  "hydrology-pre",
  "hydrology-core",
  "hydrology-post",
  "narrative-pre",
  "narrative-mid",
  "narrative-post",
];

const recipeText = readMod("src/recipes/standard/recipe.ts");
const stageIds = extractOrderStandardStagesKeys(recipeText);
const findings = [
  ...assertEqual(stageIds, expectedStageIds, "stage-order", "standard stage order"),
];

for (const legacyId of legacyStageAliases) {
  if (stageIds.includes(legacyId)) {
    findings.push({ file: "mods/mod-swooper-maps/src/recipes/standard/recipe.ts", line: 1, rule: "legacy-stage-alias", detail: legacyId });
  }
}

const foundationPaths = stageIds.filter((id) => id === "foundation" || id.startsWith("foundation-"));
findings.push(...assertEqual(foundationPaths, ["foundation"], "foundation-stage-path", "foundation stage paths"));

const mapStageDirs = readdirSync(stagesRoot)
  .filter((entry) => entry.startsWith("map-"))
  .filter((entry) => statSync(path.join(stagesRoot, entry)).isDirectory())
  .sort();
for (const dir of mapStageDirs) {
  if (!stageIds.includes(dir)) {
    findings.push({ file: path.relative(modRoot, path.join(stagesRoot, dir)), line: 1, rule: "map-helper-stage-dir", detail: dir });
  }
}

assertNoFindings("standard-stage-topology", findings);

function extractOrderStandardStagesKeys(text) {
  const start = text.indexOf("const stages = orderStandardStages({");
  const end = text.indexOf("} as const);", start);
  if (start === -1 || end === -1) return [];
  return text
    .slice(start, end)
    .split("\n")
    .map((line) => line.trim().replace(/,$/, ""))
    .filter((line) => line && !line.startsWith("const stages"))
    .map((line) => {
      const quoted = line.match(/^"([^"]+)":/u);
      if (quoted) return quoted[1];
      const shorthand = line.match(/^([A-Za-z0-9_-]+)(?::|$)/u);
      return shorthand?.[1];
    })
    .filter(Boolean);
}
