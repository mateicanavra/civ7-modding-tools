#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const {
  assertEqual,
  assertNoFindings,
  readMod,
} = await import(pathToFileURL(
  join(repoRoot, ".habitat/_support/execution/command-check/mapgen-static-check-lib.mjs")
).href);

const expectedStageIds = [
  "foundation-mantle",
  "foundation-lithosphere",
  "foundation-tectonics",
  "foundation-orogeny",
  "foundation-projection",
  "morphology-coasts",
  "morphology-routing",
  "morphology-erosion",
  "morphology-features",
  "morphology-shelf",
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

const recipeText = readMod("src/recipes/standard/recipe.ts");
const stageIds = extractOrderStandardStagesKeys(recipeText);
const findings = assertEqual(stageIds, expectedStageIds, "stage-order", "standard stage order");

assertNoFindings("verify_standard_recipe_declared_stage_keys", findings);

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
