#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const packageJsonFiles = walkFiles(
  repoRoot,
  (file) => path.basename(file) === "package.json"
).filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`));

const normalEntrypointNames = new Set([
  "dev",
  "build",
  "check",
  "test",
  "predev",
  "prebuild",
  "precheck",
  "pretest",
]);

const hiddenDependencyOrchestrationPatterns = [
  {
    id: "preflight-script",
    pattern: /(?:^|\s)(?:node|bun)\s+\.{1,2}\/.*scripts\/preflight\/|scripts\/preflight\//,
    reason: "normal package entrypoints must not run dependency-freshness preflights",
    scope: "normal",
  },
  {
    id: "workspace-filter-build",
    pattern: /\bbun\s+run\s+--filter\b/,
    reason: "cross-workspace package selection belongs in root Nx scripts",
    scope: "all",
  },
  {
    id: "workspace-cwd-build",
    pattern: /\bbun\s+run\s+--cwd\s+(?:apps|packages|mods)\//,
    reason: "package-local scripts must not build or test another workspace by path",
    scope: "all",
  },
  {
    id: "nested-nx",
    pattern: /\b(?:bunx\s+)?nx\s+(?:run|run-many|affected)\b/,
    reason: "package-local scripts must not invoke Nx orchestration recursively",
    scope: "all",
  },
];

const failures = [];

for (const file of packageJsonFiles) {
  const rel = toRepoRelative(file);
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  const scripts = pkg.scripts ?? {};
  const isRootPackage = rel === "package.json";

  for (const [scriptName, command] of Object.entries(scripts)) {
    if (isRootPackage) continue;
    const isNormalEntrypoint = normalEntrypointNames.has(scriptName);

    for (const rule of hiddenDependencyOrchestrationPatterns) {
      if (rule.scope === "normal" && !isNormalEntrypoint) continue;
      if (!rule.pattern.test(command)) continue;
      failures.push({
        file: rel,
        package: pkg.name ?? rel,
        script: scriptName,
        rule: rule.id,
        reason: rule.reason,
        command,
      });
    }
  }
}

if (failures.length > 0) {
  console.error("Package-local scripts contain hidden workspace dependency orchestration.");
  console.error(
    "Use root Nx scripts for dependency freshness; keep package-local scripts leaf-local."
  );
  for (const failure of failures) {
    console.error(
      `\n- ${failure.file} (${failure.package}) script '${failure.script}' violates ${failure.rule}`
    );
    console.error(`  ${failure.reason}`);
    console.error(`  command: ${failure.command}`);
  }
  process.exit(1);
}

function walkFiles(rootDir, predicate) {
  if (!existsSync(rootDir)) return [];
  const out = [];
  for (const entry of readdirSync(rootDir)) {
    if (entry === ".git" || entry === "node_modules") continue;
    const full = path.join(rootDir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFiles(full, predicate));
      continue;
    }
    if (predicate(full)) out.push(full);
  }
  return out;
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
