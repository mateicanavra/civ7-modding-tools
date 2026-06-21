import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Clock, Effect } from "effect";
import { Value } from "typebox/value";
import type { HabitatConfig } from "../../config/index.js";
import { selectRules } from "../../domains/rule-selection/index.js";
import { CommandRunner } from "../../providers/command/index.js";
import type { GitProvider, GitProviderRequirements } from "../../providers/git/index.js";
import type { NxProvider } from "../../providers/nx/index.js";
import { type BaselineApplicationResult, BaselineAuthority } from "../baseline-authority/index.js";
import { activeRuleReportFacts, factsForRuleIds } from "../rule-registry/active-facts.js";
import type { RuleReportFacts } from "../rule-registry/index.js";
import { SourceCheck } from "../source-check/index.js";
import { baselineContractInputs } from "./baseline-expansion.js";
import {
  executeSelectedRulesEffect,
  type RuleExecutionRecord,
  rulesForExecution,
} from "./execution.js";
import { type CheckOptions, structuralCheckRequest } from "./request.js";
import type { CheckReport, RuleExecutionDisposition, RuleReport } from "./schema.js";
import { constructCheckReportEffect, selectorRefusalReportEffect } from "./selection.js";
import {
  BaselineApplicationOutcomeSchema,
  DiagnosticConsumptionOutcomeSchema,
  RuleExecutionPlanSchema,
  RuleSelectionOutcomeSchema,
  StructuralRuleOutcomeSchema,
} from "./state.js";

export function createCheckReportEffect(
  options: CheckOptions = {}
): Effect.Effect<
  CheckReport,
  never,
  | BaselineAuthority
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProvider
  | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const baselineAuthority = yield* BaselineAuthority;
    const request = structuralCheckRequest(options);
    const selection = selectRules(request.selectors);
    if (!selection.ok) return yield* selectorRefusalReportEffect(selection, request);
    Value.Parse(RuleSelectionOutcomeSchema, {
      kind: "selected",
      selector: request.selectors,
      selectedRuleIds: selection.rules.map((rule) => rule.id),
    });

    const selectedRules = rulesForExecution(selection.rules, options);
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const reportsByRuleId = factsByRuleId(factsForRuleIds(activeRuleReportFacts, selectedRuleIds));
    const baselineInputsByRuleId = factsByRuleId(baselineContractInputs(selectedRuleIds));
    const reports: RuleReport[] = [];
    const ruleResults = yield* executeSelectedRulesEffect(selectedRules, options);
    for (const rule of selectedRules) {
      const reportFacts = reportsByRuleId.get(rule.id);
      if (!reportFacts)
        throw new Error(`habitat internal error: missing report facts for ${rule.id}`);
      const baselineFacts = baselineInputsByRuleId.get(rule.id);
      if (!baselineFacts)
        throw new Error(`habitat internal error: missing baseline facts for ${rule.id}`);
      const baseline = yield* baselineAuthority.loadState(baselineFacts);
      const execution = ruleResults.get(rule.id);
      if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
      Value.Parse(RuleExecutionPlanSchema, {
        ruleId: rule.id,
        ownerTool: rule.ownerTool,
        lane: reportFacts.lane,
        disposition: execution.disposition,
      });
      const executionDiagnostics = execution.result.diagnostics;
      diagnosticConsumptionOutcome(execution.disposition, executionDiagnostics);
      const baselineResult = yield* baselineAuthority.apply(executionDiagnostics, baseline);
      const locked = yield* baselineAuthority.isLocked(baseline);
      baselineApplicationOutcome(rule.id, baselineResult, locked, executionDiagnostics);
      const diagnostics = [
        ...executionDiagnostics,
        ...(yield* Effect.all(
          baselineResult.refusals.map((failure) =>
            baselineAuthority.failureDiagnostic(rule.id, failure)
          )
        )),
      ];
      const report = ruleReportFromDiagnostics({
        ruleId: rule.id,
        reportFacts,
        locked,
        durationMs: execution.durationMs,
        diagnostics,
      });
      structuralRuleOutcome(report, execution.disposition);
      reports.push(report);
    }

    if (options.baselineIntegrity)
      reports.push(yield* baselineIntegrityReportEffect(options.base ?? "main"));
    return yield* constructCheckReportEffect({ command: request.command.serialized, reports });
  });
}

function diagnosticConsumptionOutcome(
  disposition: RuleExecutionDisposition,
  diagnostics: RuleReport["diagnostics"]
) {
  return Value.Parse(
    DiagnosticConsumptionOutcomeSchema,
    disposition.kind === "dependency-refused" || disposition.kind === "execution-failed"
      ? { kind: "diagnostic-refused", diagnostic: diagnostics[0] }
      : diagnostics.length === 0
        ? { kind: "clean", diagnostics: [] }
        : { kind: "findings", diagnostics }
  );
}

function baselineApplicationOutcome(
  ruleId: string,
  baselineResult: BaselineApplicationResult,
  locked: boolean,
  diagnostics: RuleReport["diagnostics"]
) {
  return Value.Parse(
    BaselineApplicationOutcomeSchema,
    baselineResult.refusals.length > 0
      ? {
          kind: "baseline-refused",
          diagnostic: {
            ruleId,
            path: ".",
            message: baselineResult.refusals[0]?.message ?? "Baseline application refused.",
            severity: "error",
            baselined: false,
          },
        }
      : {
          kind: "baseline-applied",
          locked,
          diagnostics,
        }
  );
}

function structuralRuleOutcome(report: RuleReport, disposition: RuleExecutionDisposition) {
  return Value.Parse(
    StructuralRuleOutcomeSchema,
    disposition.kind === "not-applicable"
      ? { kind: "rule-not-applicable", lane: report.lane, report }
      : disposition.kind === "dependency-refused" || disposition.kind === "execution-failed"
        ? { kind: "rule-refused", lane: report.lane, report }
        : report.status === "advisory-findings"
          ? { kind: "rule-advisory-findings", lane: "advisory", report }
          : report.status === "fail"
            ? { kind: "rule-failed", lane: report.lane, report }
            : { kind: "rule-passed", lane: report.lane, report }
  );
}

function ruleReportFromDiagnostics(input: {
  ruleId: string;
  reportFacts: RuleReportFacts;
  locked: boolean;
  durationMs: number;
  diagnostics: RuleReport["diagnostics"];
}): RuleReport {
  const newViolations = input.diagnostics.filter(
    (diagnostic) => !diagnostic.baselined && diagnostic.severity === "error"
  );
  const status: RuleReport["status"] =
    input.reportFacts.lane === "advisory"
      ? input.diagnostics.length > 0
        ? "advisory-findings"
        : "pass"
      : newViolations.length > 0
        ? "fail"
        : "pass";
  return {
    ruleId: input.ruleId,
    ownerTool: input.reportFacts.ownerTool,
    lane: input.reportFacts.lane,
    status,
    locked: input.locked,
    durationMs: input.durationMs,
    diagnostics: input.diagnostics,
    detect: input.reportFacts.detect,
    message: input.reportFacts.message,
    remediate: input.reportFacts.remediate,
  };
}

function baselineIntegrityReportEffect(
  base: string
): Effect.Effect<
  RuleReport,
  never,
  BaselineAuthority | FileSystem.FileSystem | GitProvider | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const baselineAuthority = yield* BaselineAuthority;
    const integrityStarted = yield* Clock.currentTimeMillis;
    const integrity = yield* baselineAuthority.checkIntegrity(base, {
      registry: baselineContractInputs(),
    });
    const integrityFindings = yield* baselineAuthority.integrityFindings(integrity);
    return {
      ruleId: "baseline-integrity",
      ownerTool: "habitat-builtin",
      lane: "enforced",
      status: integrity.status === "refused" ? "fail" : "pass",
      locked: true,
      durationMs: Math.max(0, (yield* Clock.currentTimeMillis) - integrityStarted),
      diagnostics: integrityFindings.map((finding) => ({
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
    };
  });
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
