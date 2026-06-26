#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const sourceRoot = "tools/habitat-harness/src";
const packagePath = "tools/habitat-harness/package.json";

const allowedLibFiles = new Set([
  "tools/habitat-harness/src/lib/artifact-paths.ts",
  "tools/habitat-harness/src/lib/boundary-taxonomy.ts",
  "tools/habitat-harness/src/lib/effect-runtime.ts",
  "tools/habitat-harness/src/lib/git-state.ts",
  "tools/habitat-harness/src/lib/graph.ts",
  "tools/habitat-harness/src/lib/host-policy.ts",
  "tools/habitat-harness/src/lib/host-policy/decisions.ts",
  "tools/habitat-harness/src/lib/host-policy/declarations.ts",
  "tools/habitat-harness/src/lib/host-policy/index.ts",
  "tools/habitat-harness/src/lib/host-policy/schema.ts",
  "tools/habitat-harness/src/lib/host-policy/state.ts",
  "tools/habitat-harness/src/lib/nx-projects.ts",
  "tools/habitat-harness/src/lib/paths.ts",
  "tools/habitat-harness/src/lib/protected-zones/declarations.ts",
  "tools/habitat-harness/src/lib/protected-zones/diagnostics.ts",
  "tools/habitat-harness/src/lib/protected-zones/file-layer.ts",
  "tools/habitat-harness/src/lib/protected-zones/guard.ts",
  "tools/habitat-harness/src/lib/protected-zones/index.ts",
  "tools/habitat-harness/src/lib/protected-zones/path-actions.ts",
  "tools/habitat-harness/src/lib/protected-zones/recovery.ts",
  "tools/habitat-harness/src/lib/protected-zones/scan-root.ts",
  "tools/habitat-harness/src/lib/protected-zones/schema.ts",
  "tools/habitat-harness/src/lib/workspace-tools.ts",
]);

const allowedRuntimeEdges = new Set([
  "tools/habitat-harness/src/domains/rule-registry/load.ts",
  "tools/habitat-harness/src/domains/workspace-graph-integration/diff.ts",
  "tools/habitat-harness/src/domains/workspace-graph-integration/path.ts",
  "tools/habitat-harness/src/runtime/run.ts",
  "tools/habitat-harness/src/service/impl.ts",
]);

const allowedChildProcessEdges = new Set(["tools/habitat-harness/src/providers/command/runner.ts"]);

const allowedFsEdges = new Set([
  "tools/habitat-harness/src/adapters/grit/scan-roots/index.ts",
  "tools/habitat-harness/src/bin/habitat.ts",
  "tools/habitat-harness/src/domains/baseline-authority/context.ts",
  "tools/habitat-harness/src/domains/baseline-authority/integrity.ts",
  "tools/habitat-harness/src/domains/baseline-authority/state.ts",
  "tools/habitat-harness/src/domains/hook-runtime/resource-inspection.ts",
  "tools/habitat-harness/src/domains/hook-runtime/staged-worktree.ts",
  "tools/habitat-harness/src/domains/structural-check/render.ts",
  "tools/habitat-harness/src/lib/boundary-taxonomy.ts",
  "tools/habitat-harness/src/lib/graph.ts",
  "tools/habitat-harness/src/providers/nx/inventory.ts",
  "tools/habitat-harness/src/resources/filesystem.ts",
]);

const allowedTimeEdges = new Set([
  "tools/habitat-harness/src/domains/hook-runtime/runtime.ts",
  "tools/habitat-harness/src/domains/structural-check/selection.ts",
  "tools/habitat-harness/src/providers/command/output.ts",
  "tools/habitat-harness/src/providers/command/runner.ts",
  "tools/habitat-harness/src/resources/clock.ts",
]);

const allowedEnvEdges = new Set([
  "tools/habitat-harness/src/domains/proof-contract/command-output.ts",
  "tools/habitat-harness/src/providers/command/runner.ts",
]);

const allowedArtifactSemantics = new Set([
  "tools/habitat-harness/src/adapters/grit/provider/constants.ts",
  "tools/habitat-harness/src/adapters/grit/provider/index.ts",
  "tools/habitat-harness/src/config/habitat-config.ts",
  "tools/habitat-harness/src/domains/baseline-authority/context.ts",
  "tools/habitat-harness/src/domains/baseline-authority/integrity.ts",
  "tools/habitat-harness/src/domains/baseline-authority/operations.ts",
  "tools/habitat-harness/src/domains/pattern-governance/apply-admissions.ts",
  "tools/habitat-harness/src/domains/pattern-governance/index.ts",
  "tools/habitat-harness/src/domains/pattern-governance/paths.ts",
  "tools/habitat-harness/src/domains/pattern-governance/schema.ts",
  "tools/habitat-harness/src/domains/pattern-governance/validation.ts",
  "tools/habitat-harness/src/domains/rule-registry/load.ts",
  "tools/habitat-harness/src/generators/pattern/generator.ts",
  "tools/habitat-harness/src/generators/pattern/paths.ts",
  "tools/habitat-harness/src/lib/artifact-paths.ts",
  "tools/habitat-harness/src/lib/paths.ts",
  "tools/habitat-harness/src/lib/protected-zones/declarations.ts",
  "tools/habitat-harness/src/lib/protected-zones/diagnostics.ts",
  "tools/habitat-harness/src/lib/protected-zones/guard.ts",
  "tools/habitat-harness/src/lib/protected-zones/recovery.ts",
  "tools/habitat-harness/src/lib/protected-zones/schema.ts",
  "tools/habitat-harness/src/plugin/nx-plugin.ts",
  "tools/habitat-harness/src/plugin/target-definitions.ts",
  "tools/habitat-harness/src/rules/architecture.ts",
]);

const forbiddenPublicSymbols = [
  "BaselineAuthorityLive",
  "CommandRunnerLive",
  "Effect.run",
  "GitProviderLive",
  "GritProviderLive",
  "HabitatRuntimeLive",
  "ManagedRuntime",
  "WorkspaceToolProviderLive",
  "checkBaselineIntegrity",
  "makeFake",
  "readVerifyTargetPlan",
  "resolveVerifyBase",
  "runAffectedVerification",
  "runGraph",
  "runHabitatEffect",
];

const failures = [];
const sourceFiles = tsFiles(path.join(repoRoot, sourceRoot));

checkPackageExports();
checkPublicFacade();
checkDeletedAdapters();
checkLibRatchet();
checkSourceEdges();

if (failures.length > 0) {
  console.error("=== Habitat Public Surface Guards ===");
  for (const failure of failures) {
    console.error(`\n${failure.title}`);
    for (const detail of failure.details) console.error(`  - ${detail}`);
  }
  process.exit(1);
}

console.log("Habitat public surface guards passed.");

function checkPackageExports() {
  const manifest = JSON.parse(read(packagePath));
  const exportKeys = Object.keys(manifest.exports ?? {}).sort();
  const expected = [".", "./plugin", "./public/*"];
  if (JSON.stringify(exportKeys) !== JSON.stringify(expected)) {
    fail("Package export map must expose only public entrypoints.", [
      `${packagePath}: exports are ${JSON.stringify(exportKeys)}, expected ${JSON.stringify(expected)}`,
    ]);
  }

  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    const serialized = `${key} ${String(value)}`;
    if (/providers|runtime|adapters|config|errors|rules|lib|domains/.test(serialized)) {
      fail("Package export map leaks internal implementation paths.", [`${key}: ${String(value)}`]);
    }
  }
}

function checkPublicFacade() {
  const rootIndex = "tools/habitat-harness/src/index.ts";
  if (read(rootIndex).trim() !== 'export * from "./public/index.js";') {
    fail("Root package index must stay a one-line public facade.", [rootIndex]);
  }

  const publicFiles = sourceFiles.filter((file) => file.startsWith(`${sourceRoot}/public/`));
  for (const file of publicFiles) {
    const text = read(file);
    for (const symbol of forbiddenPublicSymbols) {
      if (text.includes(symbol)) {
        fail("Public facade exports an internal runtime/provider/helper symbol.", [
          `${file}: contains ${symbol}`,
        ]);
      }
    }
    if (/from\s+["']\.\.\/(?:adapters|config|errors|lib|providers|runtime|rules)\//.test(text)) {
      fail("Public facade imports from an internal implementation owner.", [file]);
    }
  }
}

function checkDeletedAdapters() {
  for (const file of [
    "tools/habitat-harness/src/lib/baseline.ts",
    "tools/habitat-harness/src/lib/check-report.ts",
    "tools/habitat-harness/src/lib/diagnostics.ts",
  ]) {
    if (existsSync(path.join(repoRoot, file))) {
      fail("Removed public compatibility adapter returned.", [file]);
    }
  }
}

function checkLibRatchet() {
  const libFiles = sourceFiles.filter((file) => file.startsWith(`${sourceRoot}/lib/`));
  const unapproved = libFiles.filter((file) => !allowedLibFiles.has(file));
  if (unapproved.length > 0) {
    fail(
      "New Habitat feature/support files under src/lib require an owning domain/provider.",
      unapproved
    );
  }
}

function checkSourceEdges() {
  for (const file of sourceFiles) {
    const text = read(file);
    checkAllowed(
      file,
      text,
      /\bEffect\.run(?:Promise|Sync|Fork)?\b|ManagedRuntime\.make\b/g,
      allowedRuntimeEdges,
      "Effect runtime construction/execution must stay in approved runtime edges."
    );
    checkAllowed(
      file,
      text,
      /from\s+["']node:child_process["']|\bspawnSync\s*\(/g,
      allowedChildProcessEdges,
      "Child-process sync execution must stay inside command provider implementation."
    );
    checkAllowed(
      file,
      text,
      /from\s+["']node:fs(?:\/promises)?["']/g,
      allowedFsEdges,
      "Direct fs imports must stay in approved resource/provider/legacy support edges."
    );
    checkAllowed(
      file,
      text,
      /\bDate\.now\s*\(|new\s+Date\s*\(/g,
      allowedTimeEdges,
      "Direct time access must stay in clock/provider legacy edges."
    );
    checkAllowed(
      file,
      text,
      /\bprocess\.env\b/g,
      allowedEnvEdges,
      "Direct env reads must stay in config/provider legacy edges."
    );
    checkAllowed(
      file,
      text,
      /\.habitat|ruleRegistryRepoPath|baselineRepoPath|patternManifestRoot|patternManifestPath/g,
      allowedArtifactSemantics,
      "Authored artifact path semantics must stay in artifact authority owners."
    );
  }
}

function checkAllowed(file, text, pattern, allowedFiles, title) {
  const matches = [...text.matchAll(pattern)].map((match) => lineForIndex(text, match.index ?? 0));
  if (matches.length === 0 || allowedFiles.has(file)) return;
  fail(
    title,
    matches.map((line) => `${file}:${line}`)
  );
}

function tsFiles(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return tsFiles(fullPath);
    if (!entry.name.endsWith(".ts")) return [];
    return [toRepoRelative(fullPath)];
  });
}

function lineForIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), "utf8");
}

function fail(title, details) {
  failures.push({ title, details });
}

function toRepoRelative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}
