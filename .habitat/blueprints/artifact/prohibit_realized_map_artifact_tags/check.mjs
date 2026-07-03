#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  modRoot,
  read,
  repoRel,
  repoRoot,
  walkFiles,
} from "../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const findings = [];
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

assertNoFindings("prohibit_realized_map_artifact_tags", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}
