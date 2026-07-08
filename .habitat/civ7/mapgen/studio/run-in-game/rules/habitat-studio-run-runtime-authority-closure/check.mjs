#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const matrixPath =
  "docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/structural-authority-matrix.md";
const rulesRoot = ".habitat/civ7/mapgen/studio/run-in-game/rules";
const childRows = [
  ["SA-01", "grit-studio-run-public-contract-closed"],
  ["SA-02", "grit-studio-run-operation-identity-owner"],
  ["SA-03", "grit-studio-run-cancel-command-owner"],
  ["SA-04", "structure-swooper-catalog-source-index"],
  ["SA-05", "grit-studio-run-launch-source-boundary"],
  ["SA-06", "grit-swooper-map-render-file-plan-boundary"],
  ["SA-07", "structure-studio-run-workspace-topology"],
  ["SA-08", "grit-swooper-run-manifest-generator-boundary"],
  ["SA-09", "structure-swooper-catalog-index-target-topology"],
  ["SA-10", "grit-studio-run-generator-port-boundary"],
  ["SA-11", "grit-studio-run-copy-deploy-boundary"],
  ["SA-12", "grit-studio-run-direct-control-observation-boundary"],
  ["SA-13", "grit-studio-run-attribution-report-boundary"],
];
const closureRuleId = "habitat-studio-run-runtime-authority-closure";
const matrixRows = [...childRows, ["SA-14", closureRuleId]];
const expectedRuleIds = new Set(matrixRows.map(([, ruleId]) => ruleId));

const failures = [];

if (process.env.HABITAT_STUDIO_RUN_AUTHORITY_CLOSURE_CHILD === "1") {
  console.error("SA-14 recursion guard tripped: closure check selected itself in a child run.");
  process.exit(1);
}

assertMatrixRows();
assertRegisteredRules();
assertNoTemporaryRunInGameRules();

if (failures.length === 0) {
  runRegisteredRuleChecks();
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

function assertMatrixRows() {
  const matrix = readText(matrixPath);
  for (const [row, ruleId] of matrixRows) {
    const line = matrix.split("\n").find((entry) => entry.startsWith(`| ${row} |`));
    if (!line) {
      failures.push(`${row}: missing from structural authority matrix.`);
      continue;
    }
    if (!line.includes(`\`${ruleId}\``)) {
      failures.push(`${row}: matrix row does not name ${ruleId}.`);
    }
    if (!line.includes("| registered enforced |")) {
      failures.push(`${row}: matrix lifecycle is not registered enforced.`);
    }
  }
}

function assertRegisteredRules() {
  for (const [, ruleId] of matrixRows) {
    const manifestPath = join(rulesRoot, ruleId, "rule.json");
    if (!existsSync(join(repoRoot, manifestPath))) {
      failures.push(`${ruleId}: missing Habitat rule manifest at ${manifestPath}.`);
      continue;
    }
    const manifest = readJson(manifestPath);
    if (manifest.id !== ruleId) failures.push(`${ruleId}: manifest id drifted.`);
    if (manifest.schemaVersion !== 2) failures.push(`${ruleId}: manifest schemaVersion is not 2.`);
    if (manifest.lane !== "enforced") failures.push(`${ruleId}: manifest lane is not enforced.`);
    if (manifest.operation?.kind !== "check") {
      failures.push(`${ruleId}: manifest operation is not a check.`);
    }
    if (!manifest.runner?.name) failures.push(`${ruleId}: manifest runner is missing.`);
    const baseline = manifest.supportFiles?.baseline;
    if (!baseline || !existsSync(join(repoRoot, baseline))) {
      failures.push(`${ruleId}: manifest baseline file is missing.`);
    }
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

function runRegisteredRuleChecks() {
  const args = [
    "habitat",
    "check",
    "--json",
    ...childRows.flatMap(([, ruleId]) => ["--rule", ruleId]),
  ];
  const result = spawnSync("bun", args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, HABITAT_STUDIO_RUN_AUTHORITY_CLOSURE_CHILD: "1" },
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status === 0) {
    const parsed = parseCheckReport(result.stdout);
    if (parsed && parsed.ok !== true) {
      failures.push(`SA-01 through SA-13 Habitat check returned ok=false: ${failingRules(parsed)}`);
    }
    return;
  }
  const parsed = parseCheckReport(result.stdout);
  failures.push(
    parsed
      ? `SA-01 through SA-13 Habitat check failed: ${failingRules(parsed)}`
      : `SA-01 through SA-13 Habitat check failed: ${tail(result.stdout + result.stderr)}`
  );
}

function readText(path) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function parseCheckReport(output) {
  const start = output.indexOf("{");
  if (start < 0) return undefined;
  try {
    return JSON.parse(output.slice(start));
  } catch {
    return undefined;
  }
}

function failingRules(report) {
  if (!Array.isArray(report.rules)) return "unable to read child rule statuses";
  const failed = report.rules
    .filter((rule) => rule.status !== "pass")
    .map((rule) => `${rule.ruleId}:${rule.status}`);
  return failed.length > 0 ? failed.join(", ") : "no failed child rules reported";
}

function tail(output) {
  return output.trim().split("\n").slice(-8).join("\n");
}
