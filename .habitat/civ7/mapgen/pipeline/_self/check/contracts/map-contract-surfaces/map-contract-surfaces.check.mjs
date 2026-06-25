#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  existingFiles,
  modRoot,
  read,
  repoRel,
  repoRoot,
  stagesRoot,
  walkFiles,
} from "../../../_shared/mapgen-static-check-lib.mjs";

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

const sourceFiles = [
  ...walkFiles(path.join(modRoot, "src"), [".ts"]),
  ...walkFiles(path.join(repoRoot, "packages/mapgen-core/src"), [".ts"]),
];
for (const file of sourceFiles) {
  const text = read(file);
  const index = text.indexOf("artifact:map.realized.");
  if (index !== -1) {
    findings.push({
      file: repoRel(file),
      line: lineOf(text, index),
      rule: "realized-map-artifact",
      detail: "artifact:map.realized.",
    });
  }
}

const tagContracts = read(path.join(modRoot, "src/recipes/standard/tag-contracts.ts"));
for (const match of tagContracts.matchAll(/["'](effect:map\.[^"']+)["']/gu)) {
  const effect = match[1];
  if (!/^effect:map\.[a-z][a-zA-Z0-9]*(Plotted|Built|ParityCaptured)$/.test(effect)) {
    findings.push({
      file: "mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts",
      line: lineOf(tagContracts, match.index ?? 0),
      rule: "map-effect-name",
      detail: effect,
    });
  }
}

assertNoFindings("map-contract-surfaces", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
