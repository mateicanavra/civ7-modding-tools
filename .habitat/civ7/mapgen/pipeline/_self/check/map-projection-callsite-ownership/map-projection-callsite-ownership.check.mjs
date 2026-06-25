#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertEqual,
  assertNoFindings,
  callers,
  existingFiles,
  modRoot,
  read,
  repoRel,
  stagesRoot,
  walkFiles,
} from "../../_shared/mapgen-static-check-lib.mjs";

const stageFiles = walkFiles(stagesRoot, [".ts"]);
const physicsRoots = [
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
  "ecology-features",
].map((stage) => path.join(stagesRoot, stage));
const physicsFiles = existingFiles(physicsRoots, [".ts"]);
const findings = [];

findings.push(
  ...assertEqual(
    callers(stageFiles, /adapter\.buildElevation\s*\(/u),
    ["mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/buildElevation.ts"],
    "build-elevation-owner",
    "TerrainBuilder.buildElevation callers"
  ),
  ...assertEqual(callers(stageFiles, /adapter\.generateLakes\s*\(/u), [], "generate-lakes-owner", "adapter.generateLakes callers"),
  ...assertEqual(
    callers(stageFiles, /adapter\.stampLakes\s*\(/u),
    ["mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts"],
    "stamp-lakes-owner",
    "adapter.stampLakes callers"
  ),
  ...assertEqual(
    callers(stageFiles, /adapter\.modelRivers\s*\(/u),
    ["mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts"],
    "model-rivers-owner",
    "adapter.modelRivers callers"
  ),
  ...assertEqual(callers(stageFiles, /tile\.hexOddR/u), [], "odd-r-callsite", "tile.hexOddR callers")
);

for (const file of physicsFiles) {
  const text = read(file);
  for (const pattern of [/adapter\.getElevation\s*\(/gu, /adapter\.isCliffCrossing\s*\(/gu]) {
    for (const match of text.matchAll(pattern)) {
      findings.push({
        file: repoRel(file),
        line: text.slice(0, match.index ?? 0).split("\n").length,
        rule: "physics-engine-read",
        detail: match[0],
      });
    }
  }
}

const plotRivers = path.join(modRoot, "src/recipes/standard/stages/map-rivers/steps/plotRivers.ts");
const plotRiversContract = path.join(
  modRoot,
  "src/recipes/standard/stages/map-rivers/steps/plotRivers.contract.ts"
);
findings.push(
  ...assertContains(plotRivers, "selectNavigableRiverTerrain", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "setTerrainType", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "map.rivers.authoredTerrainMaterialization", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "CIV7_DEFAULT_RIVER_MODELING_ARGS", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "modelRivers(", "plot-rivers-materialization"),
  ...assertContains(plotRiversContract, "MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted", "plot-rivers-contract")
);
if (read(plotRiversContract).includes("riversModeled")) {
  findings.push({ file: repoRel(plotRiversContract), line: 1, rule: "plot-rivers-contract", detail: "riversModeled" });
}

assertNoFindings("map-projection-callsite-ownership", findings);
