#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  existingFiles,
  read,
  repoRel,
  stagesRoot,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const physicsRoots = [
  "foundation",
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
  "ecology-features",
].map((stage) => path.join(stagesRoot, stage));

const findings = [];
for (const file of existingFiles(physicsRoots, [".ts"]).filter((file) =>
  file.endsWith("contract.ts")
)) {
  const text = read(file);
  for (const token of ["artifact:map.", "effect:map.", "MAP_PROJECTION_EFFECT_TAGS.map"]) {
    const index = text.indexOf(token);
    if (index !== -1) {
      findings.push({
        file: repoRel(file),
        line: lineOf(text, index),
        rule: "physics-map-contract",
        detail: token,
      });
    }
  }
}

assertNoFindings("prohibit_map_projection_dependencies_in_physics_contracts", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
