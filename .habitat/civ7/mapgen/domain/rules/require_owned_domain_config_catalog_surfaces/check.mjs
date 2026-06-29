#!/usr/bin/env node
import path from "node:path";
import {
  assertEqual,
  assertNoFindings,
  modRoot,
  read,
  srcRoot,
} from "../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const findings = [];
const morphologyConfig = path.join(srcRoot, "domain/morphology/config.ts");
const configExports = read(morphologyConfig)
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean)
  .sort();
findings.push(
  ...assertEqual(
    configExports,
    ['export * from "./shared/knob-multipliers.js";', 'export * from "./shared/knobs.js";'].sort(),
    "morphology-config-facade",
    "morphology config exports"
  )
);

const tagsText = read(path.join(modRoot, "src/recipes/standard/tags.ts"));
for (const token of [
  "FIELD_DEPENDENCY_TAGS",
  "STANDARD_ENGINE_EFFECT_TAGS",
  "MAP_PROJECTION_EFFECT_TAGS",
]) {
  if (!tagsText.includes(token)) {
    findings.push({
      file: "mods/mod-swooper-maps/src/recipes/standard/tags.ts",
      line: 1,
      rule: "owner-tag-catalog-name",
      detail: `missing ${token}`,
    });
  }
}

assertNoFindings("require_owned_domain_config_catalog_surfaces", findings);
