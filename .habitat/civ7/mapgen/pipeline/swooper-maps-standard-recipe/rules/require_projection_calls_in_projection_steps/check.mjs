#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  modRoot,
  read,
  repoRel,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const findings = [];
const buildElevation = path.join(
  modRoot,
  "src/recipes/standard/stages/map-elevation/steps/buildElevation.ts"
);
const stampLakes = path.join(modRoot, "src/recipes/standard/stages/map-hydrology/steps/lakes.ts");
const plotRivers = path.join(modRoot, "src/recipes/standard/stages/map-rivers/steps/plotRivers.ts");
const plotRiversContract = path.join(
  modRoot,
  "src/recipes/standard/stages/map-rivers/steps/plotRivers.contract.ts"
);
findings.push(
  ...assertContains(buildElevation, "adapter.buildElevation(", "build-elevation-owner"),
  ...assertContains(stampLakes, "adapter.stampLakes(", "stamp-lakes-owner"),
  ...assertContains(plotRivers, "selectNavigableRiverTerrain", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "setTerrainType", "plot-rivers-materialization"),
  ...assertContains(
    plotRivers,
    "map.rivers.authoredTerrainMaterialization",
    "plot-rivers-materialization"
  ),
  ...assertContains(plotRivers, "CIV7_DEFAULT_RIVER_MODELING_ARGS", "plot-rivers-materialization"),
  ...assertContains(plotRivers, "modelRivers(", "plot-rivers-materialization"),
  ...assertContains(
    plotRiversContract,
    "MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted",
    "plot-rivers-contract"
  )
);
if (read(plotRiversContract).includes("riversModeled")) {
  findings.push({
    file: repoRel(plotRiversContract),
    line: 1,
    rule: "plot-rivers-contract",
    detail: "riversModeled",
  });
}

assertNoFindings("require_projection_calls_in_projection_steps", findings);
