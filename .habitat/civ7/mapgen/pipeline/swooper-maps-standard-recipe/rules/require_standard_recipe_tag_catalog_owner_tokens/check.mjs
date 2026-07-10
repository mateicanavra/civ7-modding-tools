#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  modRoot,
  read,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const tagsPath = path.join(modRoot, "src/recipes/standard/tags.ts");
const tagsText = read(tagsPath);
const findings = [];

for (const token of [
  "FIELD_DEPENDENCY_TAGS",
  "STANDARD_ENGINE_EFFECT_TAGS",
  "MAP_PROJECTION_EFFECT_TAGS",
]) {
  if (!tagsText.includes(token)) {
    findings.push({
      file: "mods/mod-swooper-maps/src/recipes/standard/tags.ts",
      line: 1,
      rule: "standard-tag-catalog-owner-token",
      detail: `missing ${token}`,
    });
  }
}

assertNoFindings("require_standard_recipe_tag_catalog_owner_tokens", findings);
