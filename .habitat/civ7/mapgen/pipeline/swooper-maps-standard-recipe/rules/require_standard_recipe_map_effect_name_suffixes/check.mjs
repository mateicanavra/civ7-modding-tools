#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  modRoot,
  read,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const tagContractsPath = path.join(modRoot, "src/recipes/standard/tag-contracts.ts");
const tagContracts = read(tagContractsPath);
const findings = [];

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

assertNoFindings("require_standard_recipe_map_effect_name_suffixes", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
