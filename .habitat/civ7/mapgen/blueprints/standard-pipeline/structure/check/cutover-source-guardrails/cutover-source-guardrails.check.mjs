#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  modRoot,
  read,
  repoRel,
  walkFiles,
} from "../../../../../_shared/mapgen-static-check-lib.mjs";

const runtimeRoots = [
  path.join(modRoot, "src/domain"),
  path.join(modRoot, "src/recipes/standard"),
  path.join(modRoot, "src/maps"),
];
const files = runtimeRoots.flatMap((root) => walkFiles(root, [".ts", ".json"]));
const legacyStageTokens = [
  '"hydrology-pre"',
  '"hydrology-core"',
  '"hydrology-post"',
  '"narrative-pre"',
  '"narrative-mid"',
  '"narrative-post"',
];
const dualStagePairs = [
  { legacy: '"hydrology-pre"', target: '"hydrology-climate-baseline"' },
  { legacy: '"hydrology-core"', target: '"hydrology-hydrography"' },
  { legacy: '"hydrology-post"', target: '"hydrology-climate-refine"' },
];
const bannedShimSurfacePatterns = [
  /\bdualRead/gi,
  /\bdual[-_ ]?engine/gi,
  /\bdual[-_ ]?path/gi,
  /\bshadow(?:Path|Compute|Layer|Mode|Toggle|Bridge)/gi,
  /\bcompare(?:Layer|Layers|Mode|Toggle|Only|Path)/gi,
  /\bcomparison(?:Layer|Layers|Mode|Toggle|Only|Path)/gi,
  /\bshim(?:med|ming|s)?\b/gi,
  /\bcompat(?:ibility)?[-_ ]?(shim|bridge)\b/gi,
  /\btransitional[-_ ]?(shim|bridge)\b/gi,
];

const findings = [];
if (files.length === 0) {
  findings.push({ file: "(computed)", line: 1, rule: "scan-roots", detail: "no runtime files" });
}

for (const file of files) {
  const text = read(file);
  for (const token of legacyStageTokens) {
    const index = text.indexOf(token);
    if (index !== -1) {
      findings.push({
        file: repoRel(file),
        line: lineOf(text, index),
        rule: "legacy-stage",
        detail: token,
      });
    }
  }
  for (const pair of dualStagePairs) {
    if (text.includes(pair.legacy) && text.includes(pair.target)) {
      findings.push({
        file: repoRel(file),
        line: 1,
        rule: "dual-stage-path",
        detail: `${pair.legacy} + ${pair.target}`,
      });
    }
  }
  for (const pattern of bannedShimSurfacePatterns) {
    for (const match of text.matchAll(pattern)) {
      findings.push({
        file: repoRel(file),
        line: lineOf(text, match.index ?? 0),
        rule: "shim-surface",
        detail: match[0],
      });
    }
  }
}

assertNoFindings("cutover-source-guardrails", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
