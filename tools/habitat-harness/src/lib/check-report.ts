import { writeFileSync } from "node:fs";
import path from "node:path";
import { executeRule, type HarnessRule, rules } from "../rules/architecture.js";
import { renderReport } from "../rules/messages.js";
import { ruleReportFacts, stagedEligibleRuleIds, type RuleReportFacts } from "../rules/registry.js";
import {
  applyBaseline,
  baselineFailureDiagnostic,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  isBaselineLocked,
  loadBaselineState,
  violationKey,
  writeBaseline,
} from "./baseline.js";
import type { CheckReport, RuleReport } from "./diagnostics.js";
import { validateCheckReport } from "./diagnostics.js";
import { validateScanRoots } from "./grit.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import {
  describeRuleSelectionFailure,
  type RuleSelection,
  type RuleSelectionResult,
  selectRules,
} from "./rule-selection.js";
import { run } from "./spawn.js";

export { describeRuleSelectionFailure } from "./rule-selection.js";

export interface CheckOptions extends RuleSelection {
  base?: string;
  commandArgs?: readonly string[];
  staged?: boolean;
  stagedPaths?: readonly string[];
}

export interface EmitCheckOptions {
  json?: boolean;
  output?: string;
}

export type BaselineExpansionResult =
  | { ok: true; messages: string[] }
  | Extract<RuleSelectionResult, { ok: false }>
  | {
      ok: false;
      requested: RuleSelection;
      reason: "baseline-contract";
      message: string;
    };

export function buildHabitatCommand(command: string, argv: readonly string[] = []): string {
  const tail = argv.length > 0 ? ` ${argv.join(" ")}` : "";
  return `habitat ${command}${tail}`;
}

export async function createCheckReport(options: CheckOptions = {}): Promise<CheckReport> {
  const selection = selectRules(options);
  if (!selection.ok) return createRuleSelectionFailureReport(selection, options);

  const selectedRules = rulesForExecution(selection.rules, options);
  const reportsByRuleId = factsByRuleId(ruleReportFacts(selectedRules));
  const reports: RuleReport[] = [];
  const ruleResults = await executeSelectedRules(selectedRules, options);
  for (const rule of selectedRules) {
    const reportFacts = reportsByRuleId.get(rule.id);
    if (!reportFacts) throw new Error(`habitat internal error: missing report facts for ${rule.id}`);
    const baseline = loadBaselineState(rule);
    const execution = ruleResults.get(rule.id);
    if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
    const { diagnostics } = execution.result;
    const baselineFailures = applyBaseline(diagnostics, baseline);
    diagnostics.push(
      ...baselineFailures.map((failure) => baselineFailureDiagnostic(rule.id, failure))
    );
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
      ownerTool: reportFacts.ownerTool,
      lane: reportFacts.lane,
      status,
      locked: isBaselineLocked(baseline),
      durationMs: execution.durationMs,
      diagnostics,
      detect: reportFacts.detect,
      message: reportFacts.message,
      remediate: reportFacts.remediate,
    });
  }

  const integrityStarted = Date.now();
  const integrity = checkBaselineIntegrity(options.base ?? "main", { registry: rules });
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

export async function expandBaselines(
  selection: RuleSelection = {},
  options: { base?: string } = {}
): Promise<BaselineExpansionResult> {
  const selected = selectRules(selection);
  if (!selected.ok) return selected;

  const messages: string[] = [];
  const ruleResults = await executeSelectedRules(selected.rules);
  for (const rule of selected.rules) {
    const baseline = loadBaselineState(rule);
    if (baseline.kind === "contract-failure") {
      return {
        ok: false,
        requested: selection,
        reason: "baseline-contract",
        message: baseline.message,
      };
    }
    const execution = ruleResults.get(rule.id);
    if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
    const { diagnostics } = execution.result;
    const baselineFailures = applyBaseline(diagnostics, baseline);
    if (baselineFailures.length > 0) {
      return {
        ok: false,
        requested: selection,
        reason: "baseline-contract",
        message: baselineFailures.map((failure) => failure.message).join(" "),
      };
    }
    const keys = diagnostics
      .filter((diagnostic) => diagnostic.severity === "error" && !diagnostic.baselined)
      .map(violationKey);
    if (keys.length > 0) {
      const guard = guardBaselineExpansion(rule.id, keys, options.base ?? "main", {
        registry: rules,
      });
      if (!guard.ok) {
        return {
          ok: false,
          requested: selection,
          reason: "baseline-contract",
          message: guard.message,
        };
      }
      writeBaseline(rule.id, keys);
      messages.push(`baseline written: ${rule.id} (${keys.length} entries)`);
    }
  }
  return { ok: true, messages };
}

export function rulesForExecution(
  selectedRules: readonly HarnessRule[],
  options: Pick<CheckOptions, "staged" | "stagedPaths"> = {}
): HarnessRule[] {
  if (!options.staged) return [...selectedRules];
  if (!selectedRules.some((rule) => rule.ownerTool === "grit-check")) return [...selectedRules];
  const hasStagedGritRoots =
    stagedGritScanRoots(options.stagedPaths ?? currentStagedPaths()).length > 0;
  const stagedEligible = stagedEligibleRuleIds(selectedRules);
  return selectedRules.filter(
    (rule) =>
      rule.ownerTool !== "grit-check" ||
      (stagedEligible.has(rule.id) && hasStagedGritRoots)
  );
}

export function stagedGritScanRoots(stagedPaths: readonly string[]): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(candidate))
      .filter((candidate) => gritCandidateExtensions.has(path.extname(candidate)))
  );
  return candidates.filter(
    (candidate) => validateScanRoots([candidate], { requireExisting: false }) === null
  );
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

async function executeSelectedRules(
  selectedRules: readonly HarnessRule[],
  options: Pick<CheckOptions, "staged" | "stagedPaths"> = {}
): Promise<Map<string, { result: Awaited<ReturnType<typeof executeRule>>; durationMs: number }>> {
  const results = new Map<
    string,
    { result: Awaited<ReturnType<typeof executeRule>>; durationMs: number }
  >();
  const gritRules = selectedRules.filter((rule) => rule.ownerTool === "grit-check");
  if (gritRules.length > 0) {
    const { runGritRules } = await import("./grit.js");
    const started = Date.now();
    const scanRoots = options.staged
      ? stagedGritScanRoots(options.stagedPaths ?? currentStagedPaths())
      : undefined;
    const gritResults = await runGritRules(gritRules, scanRoots ? { scanRoots } : {});
    const durationMs = Date.now() - started;
    for (const rule of gritRules) {
      const result = gritResults.get(rule.id);
      if (result) results.set(rule.id, { result, durationMs });
    }
  }

  for (const rule of selectedRules) {
    if (rule.ownerTool === "grit-check") continue;
    const started = Date.now();
    const result = await executeRule(rule, { staged: options.staged });
    results.set(rule.id, { result, durationMs: Date.now() - started });
  }

  return results;
}

function currentStagedPaths(): string[] {
  const result = run(["git", "diff", "--cached", "--name-only", "-z"], { cwd: repoRoot });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function createRuleSelectionFailureReport(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  options: CheckOptions
): CheckReport {
  const started = Date.now();
  return {
    schemaVersion: 1,
    command: buildHabitatCommand("check", options.commandArgs),
    startedAt: new Date().toISOString(),
    ok: false,
    rules: [
      {
        ruleId: "rule-selection-integrity",
        ownerTool: "habitat-native",
        lane: "enforced",
        status: "fail",
        locked: true,
        durationMs: Date.now() - started,
        diagnostics: [
          {
            ruleId: "rule-selection-integrity",
            path: ".",
            message: describeRuleSelectionFailure(failure),
            severity: "error",
            baselined: false,
          },
        ],
        detect: ["habitat", "check", "(selector-validation)"],
        message:
          "Requested Habitat selectors must match real rule owners, rule ids, tools, and non-empty intersections before rule execution.",
        remediate:
          "Use --owner for owner project ids, --rule for rule ids, --tool for enforcement tool ids, or omit selectors to run all rules.",
      },
    ],
  };
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function factsByRuleId(facts: readonly RuleReportFacts[]): Map<string, RuleReportFacts> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}

const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
