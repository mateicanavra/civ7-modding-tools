#!/usr/bin/env node
import path from "node:path";
import {
  assertEqual,
  assertNoFindings,
  modRoot,
  read,
  repoRel,
  srcRoot,
  walkFiles,
} from "../../_shared/mapgen-static-check-lib.mjs";

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

const domainDirs = walkFiles(path.join(srcRoot, "domain"), [".ts"]);
for (const file of domainDirs.filter((file) => file.includes("/ops/"))) {
  const text = read(file);
  for (const match of text.matchAll(/from ["'](?:\.\.\/){2,3}config\.js["']/gu)) {
    findings.push({
      file: repoRel(file),
      line: lineOf(text, match.index ?? 0),
      rule: "op-schema-config-facade-import",
      detail: match[0],
    });
  }
}

for (const file of walkFiles(path.join(srcRoot, "recipes/standard"), [".ts"])) {
  const text = read(file);
  for (const match of text.matchAll(/\bM\d+_[A-Z0-9_]*TAGS\b|\bM\d+_CANONICAL_[A-Z0-9_]*\b/gu)) {
    findings.push({
      file: repoRel(file),
      line: lineOf(text, match.index ?? 0),
      rule: "milestone-tag-catalog-name",
      detail: match[0],
    });
  }
}
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

assertNoFindings("domain-config-catalogs", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
