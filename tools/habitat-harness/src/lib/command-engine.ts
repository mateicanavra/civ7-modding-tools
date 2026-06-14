import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { executeRule, type HarnessRule, rules } from "../rules/architecture.js";
import { renderReport } from "../rules/messages.js";
import {
  applyBaseline,
  checkBaselineIntegrity,
  loadBaseline,
  mergeBase,
  violationKey,
  writeBaseline,
} from "./baseline.js";
import type { CheckReport, RuleReport } from "./diagnostics.js";
import { validateCheckReport } from "./diagnostics.js";
import { runGritApplyPatterns } from "./grit.js";

export { runHook } from "./hooks.js";

import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

export interface RuleSelection {
  owner?: string;
  rule?: string;
  tool?: string;
}

export interface CheckOptions extends RuleSelection {
  base?: string;
  commandArgs?: readonly string[];
  staged?: boolean;
}

export interface EmitCheckOptions {
  json?: boolean;
  output?: string;
}

export interface FixOptions {
  dryRun?: boolean;
}

export interface VerifyOptions {
  base?: string;
  commandArgs?: readonly string[];
}

export interface Classification {
  path: string;
  project: string | null;
  projectRoot?: string;
  tags?: string[];
  rulesInScope?: string[];
  verifyTargets?: string[];
  note?: string;
}

export function selectRules(selection: RuleSelection = {}): HarnessRule[] {
  let selected = rules;
  if (selection.owner) selected = selected.filter((rule) => rule.ownerProject === selection.owner);
  if (selection.rule) selected = selected.filter((rule) => rule.id === selection.rule);
  if (selection.tool) selected = selected.filter((rule) => rule.ownerTool === selection.tool);
  return selected;
}

export function buildHabitatCommand(command: string, argv: readonly string[] = []): string {
  const tail = argv.length > 0 ? ` ${argv.join(" ")}` : "";
  return `habitat ${command}${tail}`;
}

export function createCheckReport(options: CheckOptions = {}): CheckReport {
  const selected = selectRules(options);
  const reports: RuleReport[] = [];
  for (const rule of selected) {
    const started = Date.now();
    const baseline = loadBaseline(rule.id);
    const { diagnostics } = executeRule(rule, { staged: options.staged });
    applyBaseline(diagnostics, baseline);
    const newViolations = diagnostics.filter(
      (diagnostic) => !diagnostic.baselined && diagnostic.severity === "error"
    );
    const status: RuleReport["status"] =
      rule.lane === "advisory"
        ? diagnostics.length > 0
          ? "advisory-findings"
          : "pass"
        : newViolations.length > 0
          ? "fail"
          : "pass";
    reports.push({
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      lane: rule.lane,
      status,
      locked: baseline.size === 0 && rule.exceptionPath === "none",
      durationMs: Date.now() - started,
      diagnostics,
      detect: rule.detect,
      message: rule.message,
      remediate: rule.remediate,
    });
  }

  const integrityStarted = Date.now();
  const integrity = checkBaselineIntegrity(options.base ?? "main");
  reports.push({
    ruleId: "baseline-integrity",
    ownerTool: "habitat-native",
    lane: "enforced",
    status: integrity.length > 0 ? "fail" : "pass",
    locked: true,
    durationMs: Date.now() - integrityStarted,
    diagnostics: integrity.map((finding) => ({
      ruleId: "baseline-integrity",
      path: finding.file,
      message: finding.reason,
      severity: "error" as const,
      baselined: false,
    })),
    detect: ["habitat", "check", "(built-in)"],
    message:
      "Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.",
    remediate: null,
  });

  return {
    schemaVersion: 1,
    command: buildHabitatCommand("check", options.commandArgs),
    startedAt: new Date().toISOString(),
    ok: reports.every((report) => report.status !== "fail"),
    rules: reports,
  };
}

export function expandBaselines(selection: RuleSelection = {}): string[] {
  const messages: string[] = [];
  for (const rule of selectRules(selection)) {
    const { diagnostics } = executeRule(rule);
    const keys = diagnostics
      .filter((diagnostic) => diagnostic.severity === "error" && !diagnostic.baselined)
      .map(violationKey);
    if (keys.length > 0) {
      writeBaseline(rule.id, keys);
      messages.push(`baseline written: ${rule.id} (${keys.length} entries)`);
    }
  }
  return messages;
}

export function renderCheckReport(report: CheckReport, options: EmitCheckOptions = {}): string {
  const json = stringifyCheckReport(report);
  if (options.output) writeFileSync(path.resolve(repoRoot, options.output), `${json}\n`);
  return options.json ? json : renderReport(report);
}

export function stringifyCheckReport(report: CheckReport): string {
  const schemaErrors = validateCheckReport(report);
  if (schemaErrors.length > 0) {
    throw new Error(
      `habitat internal error: report violates its own schema:\n${schemaErrors.join("\n")}`
    );
  }
  return JSON.stringify(report, null, 2);
}

export function runFix(options: FixOptions = {}): SpawnResult {
  const grit = runGritApplyPatterns({ dryRun: options.dryRun });
  if (grit.exitCode !== 0) return grit;
  const argv = options.dryRun ? ["biome", "check", "."] : ["biome", "check", "--write", "."];
  const biome = run(argv, { cwd: repoRoot });
  return {
    exitCode: biome.exitCode,
    stdout: `${grit.stdout}${biome.stdout}`,
    stderr: `${grit.stderr}${biome.stderr}`,
  };
}

export function resolveVerifyBase(base?: string): string {
  return base ?? mergeBase("main") ?? "main";
}

export function runAffectedVerification(base: string): SpawnResult {
  return run(
    [
      "nx",
      "affected",
      "-t",
      "build,check,test,boundaries,biome:ci,grit:check,generated:check",
      "--base",
      base,
    ],
    {
      cwd: repoRoot,
    }
  );
}

export function runGraph(options: { json?: boolean } = {}): SpawnResult {
  const dir = mkdtempSync(path.join(tmpdir(), "habitat-graph-"));
  const graphPath = path.join(dir, "graph.json");
  try {
    const graphResult = run(["nx", "graph", "--file", graphPath], { cwd: repoRoot });
    if (graphResult.exitCode !== 0) return graphResult;
    const graph = JSON.parse(readFileSync(graphPath, "utf8"));
    return {
      exitCode: 0,
      stdout: `${JSON.stringify(graph.graph ?? graph, null, options.json ? 0 : 2)}\n`,
      stderr: "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function classifyPath(target: string): Classification {
  const rel = toRepoRelative(target);
  const roots: Array<{ name: string; root: string; tags: string[] }> = [];
  for (const glob of ["apps", "packages", "packages/plugins", "mods", "tools"]) {
    const dir = path.join(repoRoot, glob);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const packagePath = path.join(dir, entry, "package.json");
      if (!existsSync(packagePath)) continue;
      const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
      roots.push({
        name: pkg.name,
        root: toRepoRelative(path.join(dir, entry)),
        tags: pkg.nx?.tags ?? [],
      });
    }
  }
  const owner = roots
    .filter((root) => rel === root.root || rel.startsWith(`${root.root}/`))
    .sort((a, b) => b.root.length - a.root.length)[0];
  if (!owner) return { path: rel, project: null, note: "workspace-level path" };
  const owningRules = rules
    .filter(
      (rule) =>
        rule.ownerProject === owner.name || rule.ownerProject === "@internal/habitat-harness"
    )
    .map((rule) => rule.id);
  return {
    path: rel,
    project: owner.name,
    projectRoot: owner.root,
    tags: owner.tags,
    rulesInScope: owningRules,
    verifyTargets: [
      `nx run ${owner.name}:check`,
      `nx run ${owner.name}:test`,
      "nx run @internal/habitat-harness:boundaries",
      "nx run-many -t biome:ci --projects=@internal/habitat-harness",
      "nx run @internal/habitat-harness:grit:check",
      "nx run @internal/habitat-harness:generated:check",
      "habitat check",
    ],
  };
}

export function commandSummary(): string {
  return `rule pack: ${rules.length} rules (+ baseline-integrity built-in)`;
}
