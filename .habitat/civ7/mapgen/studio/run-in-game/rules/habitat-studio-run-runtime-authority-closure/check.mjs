#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const matrixPath =
  "docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/structural-authority-matrix.md";
const rulesRoot = ".habitat/civ7/mapgen/studio/run-in-game/rules";
const authorityRows = [
  ["SA-01", "grit-studio-run-public-contract-closed", "mapgen-studio", "Grit"],
  ["SA-02", "grit-studio-run-operation-identity-owner", "mapgen-studio", "Grit"],
  ["SA-03", "grit-studio-run-cancel-command-owner", "mapgen-studio", "Grit"],
  ["SA-04", "structure-swooper-catalog-source-index", "mod-swooper-maps", "structure-check"],
  ["SA-05", "grit-studio-run-launch-source-boundary", "mapgen-studio", "Grit"],
  ["SA-06", "grit-swooper-map-render-file-plan-boundary", "mod-swooper-maps", "Grit"],
  ["SA-07", "structure-studio-run-workspace-topology", "mapgen-studio", "structure-check"],
  ["SA-08", "grit-swooper-run-manifest-generator-boundary", "mod-swooper-maps", "Grit"],
  [
    "SA-09",
    "structure-swooper-catalog-index-target-topology",
    "mod-swooper-maps",
    "structure-check",
  ],
  ["SA-10", "grit-studio-run-generator-port-boundary", "mapgen-studio", "Grit"],
  ["SA-11", "grit-studio-run-copy-deploy-boundary", "mapgen-studio", "Grit"],
  ["SA-12", "grit-studio-run-direct-control-observation-boundary", "mapgen-studio", "Grit"],
  [
    "SA-13",
    "grit-studio-run-attribution-report-boundary",
    "mapgen-studio",
    "Grit + behavior evidence",
  ],
];
const closureRuleId = "habitat-studio-run-runtime-authority-closure";
const matrixRows = [
  ...authorityRows,
  ["SA-14", closureRuleId, "mapgen-studio", "Habitat command check"],
];
const expectedRuleIds = new Set(matrixRows.map(([, ruleId]) => ruleId));
const expectedMatrixRowIds = new Set(matrixRows.map(([row]) => row));

const failures = [];

assertMatrixRows();
assertRegisteredRules();
assertNoTemporaryRunInGameRules();

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

function assertMatrixRows() {
  const lines = readText(matrixPath).split("\n");
  const sectionStart = lines.indexOf("## Rows");
  const sectionEnd = lines.findIndex(
    (line, index) => index > sectionStart && line.startsWith("## ")
  );
  if (sectionStart < 0 || sectionEnd < 0) {
    failures.push("Structural authority matrix is missing its bounded Rows section.");
    return;
  }

  const tableLines = lines.slice(sectionStart + 1, sectionEnd).filter((line) => line.trim());
  const [header, separator, ...dataLines] = tableLines;
  const expectedHeader =
    "| Row | Packet | Assertion | Runner | Rule id / target | Owner surface | Scan roots | Lifecycle | Baseline / current-tree action | Hook scope |";
  if (header?.trim() !== expectedHeader) {
    failures.push("Structural authority matrix header drifted.");
  }
  const separatorColumns = parseMatrixLine(separator, "separator");
  if (separatorColumns && !separatorColumns.every((column) => /^-+$/.test(column))) {
    failures.push("Structural authority matrix separator drifted.");
  }

  const observedRows = dataLines.flatMap((line, index) => {
    const columns = parseMatrixLine(line, `data row ${index + 1}`);
    return columns ? [{ row: columns[0], columns }] : [];
  });
  for (const { row } of observedRows) {
    if (!expectedMatrixRowIds.has(row)) {
      failures.push(`${row}: unexpected structural authority matrix row.`);
    }
  }
  for (const [row, ruleId, , runnerLabel] of matrixRows) {
    const matches = observedRows.filter((entry) => entry.row === row);
    if (matches.length === 0) {
      failures.push(`${row}: missing from structural authority matrix.`);
      continue;
    }
    if (matches.length > 1) {
      failures.push(`${row}: duplicated in structural authority matrix.`);
      continue;
    }
    const [{ columns }] = matches;
    if (columns[4] !== `\`${ruleId}\``) {
      failures.push(`${row}: matrix row does not name ${ruleId}.`);
    }
    if (columns[3] !== runnerLabel) {
      failures.push(`${row}: matrix runner is not ${runnerLabel}.`);
    }
    if (columns[7] !== "registered enforced") {
      failures.push(`${row}: matrix lifecycle is not registered enforced.`);
    }
  }
}

function parseMatrixLine(line, label) {
  const trimmed = line?.trim();
  if (!trimmed?.startsWith("|") || !trimmed.endsWith("|")) {
    failures.push(`Structural authority matrix ${label} is not a closed table row.`);
    return undefined;
  }
  const columns = trimmed
    .split("|")
    .slice(1, -1)
    .map((column) => column.trim());
  if (columns.length !== 10) {
    failures.push(`Structural authority matrix ${label} does not have 10 columns.`);
    return undefined;
  }
  return columns;
}

function assertRegisteredRules() {
  for (const [, ruleId, ownerProject, runnerLabel] of matrixRows) {
    const manifestPath = join(rulesRoot, ruleId, "rule.json");
    if (!existsSync(join(repoRoot, manifestPath))) {
      failures.push(`${ruleId}: missing Habitat rule manifest at ${manifestPath}.`);
      continue;
    }
    const manifest = readJson(manifestPath);
    if (manifest.id !== ruleId) failures.push(`${ruleId}: manifest id drifted.`);
    if (manifest.schemaVersion !== 2) failures.push(`${ruleId}: manifest schemaVersion is not 2.`);
    if (manifest.ownerProject !== ownerProject) {
      failures.push(`${ruleId}: manifest owner is not ${ownerProject}.`);
    }
    if (manifest.lane !== "enforced") failures.push(`${ruleId}: manifest lane is not enforced.`);
    if (manifest.operation?.kind !== "check") {
      failures.push(`${ruleId}: manifest operation is not a check.`);
    }
    assertRunnerShape(ruleId, manifest.runner, runnerLabel);
    const expectedBaseline = `${rulesRoot}/${ruleId}/baseline.json`;
    if (manifest.supportFiles?.baseline !== expectedBaseline) {
      failures.push(`${ruleId}: manifest baseline is not the canonical rule-local file.`);
    } else if (!existsSync(join(repoRoot, expectedBaseline))) {
      failures.push(`${ruleId}: canonical baseline file is missing.`);
    } else {
      const baseline = readJson(expectedBaseline);
      if (!Array.isArray(baseline) || baseline.length !== 0) {
        failures.push(`${ruleId}: closure requires an empty baseline.`);
      }
    }
  }
}

function assertRunnerShape(ruleId, runner, runnerLabel) {
  const expected =
    runnerLabel === "Grit" || runnerLabel === "Grit + behavior evidence"
      ? ["grit", undefined]
      : runnerLabel === "structure-check"
        ? ["habitat", "structure"]
        : runnerLabel === "Habitat command check"
          ? ["habitat", "script"]
          : undefined;
  if (!expected) {
    failures.push(`${ruleId}: matrix runner is not recognized.`);
    return;
  }
  const [name, mode] = expected;
  if (runner?.name !== name || runner?.mode !== mode) {
    failures.push(`${ruleId}: manifest runner does not match matrix authority ${runnerLabel}.`);
  }
}

function assertNoTemporaryRunInGameRules() {
  const entries = readdirSync(join(repoRoot, rulesRoot), { withFileTypes: true });
  const seenManifestIds = new Set();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!expectedRuleIds.has(entry.name)) {
      failures.push(`${entry.name}: rule directory is not listed in SA-01 through SA-14.`);
    }
    if (entry.name.includes("temporary")) {
      failures.push(`${entry.name}: unresolved packet-local temporary rule remains registered.`);
    }
    const manifestPath = join(rulesRoot, entry.name, "rule.json");
    if (!existsSync(join(repoRoot, manifestPath))) {
      failures.push(`${entry.name}: rule directory has no Habitat manifest.`);
      continue;
    }
    const manifest = readJson(manifestPath);
    if (seenManifestIds.has(manifest.id)) {
      failures.push(`${entry.name}: duplicate rule manifest id ${manifest.id}.`);
    }
    seenManifestIds.add(manifest.id);
    if (manifest.id !== entry.name) {
      failures.push(`${entry.name}: manifest id ${manifest.id} does not match rule directory.`);
    }
    if (!expectedRuleIds.has(manifest.id)) {
      failures.push(`${entry.name}: rule manifest is not listed in SA-01 through SA-14.`);
    }
    if (manifest.runner?.name === "grit" && manifest.lane === "advisory") {
      failures.push(`${entry.name}: advisory Grit rule remains in the Run in Game authority set.`);
    }
  }
}

function readText(path) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}
