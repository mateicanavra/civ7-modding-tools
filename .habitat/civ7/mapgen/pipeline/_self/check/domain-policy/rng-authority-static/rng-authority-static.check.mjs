#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  modRel,
  modRoot,
  read,
  repoRel,
  walkFiles,
} from "../../../_shared/mapgen-static-check-lib.mjs";

const allowed = new Set([
  "src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts:official-discovery-generator",
]);
const roots = [path.join(modRoot, "src/domain"), path.join(modRoot, "src/recipes/standard")];
const patterns = [
  { name: "direct-adapter-rng", re: /\.\s*getRandomNumber\s*\(/u },
  { name: "terrainbuilder-rng", re: /\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(/u },
  { name: "ambient-random", re: /\bMath\s*\.\s*random\s*\(/u },
  { name: "official-lakes-generator", re: /\.\s*generateLakes\s*\(/u },
  { name: "official-biome-generator", re: /\.\s*designateBiomes\s*\(/u },
  { name: "official-feature-generator", re: /\.\s*addFeatures\s*\(/u },
  { name: "official-snow-generator", re: /\.\s*generateSnow\s*\(/u },
  {
    name: "official-resource-generator",
    re: /\.\s*(?:generateResources|generateOfficialResources)\s*\(/u,
  },
  {
    name: "official-discovery-generator",
    re: /\.\s*(?:generateDiscoveries|generateOfficialDiscoveries)\s*\(/u,
  },
  {
    name: "official-start-generator",
    re: /\.\s*(?:assignStartPositions|chooseStartSectors)\s*\(/u,
  },
];

const findings = [];
for (const file of roots.flatMap((root) => walkFiles(root, [".ts"]))) {
  const text = read(file);
  const rel = modRel(file);
  const lines = text.split(/\r?\n/u);
  const inAuthoredGeneration =
    rel.startsWith("src/recipes/standard") || rel.startsWith("src/domain");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { name, re } of patterns) {
      if (!re.test(line)) continue;
      if (allowed.has(`${rel}:${name}`)) continue;
      findings.push({ file: repoRel(file), line: i + 1, rule: name, detail: line.trim() });
    }
    if (inAuthoredGeneration && /from\s+["']@swooper\/mapgen-core\/lib\/rng/u.test(line)) {
      findings.push({
        file: repoRel(file),
        line: i + 1,
        rule: "authored-generation-internal-rng-import",
        detail: line.trim(),
      });
    }
  }
}

assertNoFindings("rng-authority-static", findings);
