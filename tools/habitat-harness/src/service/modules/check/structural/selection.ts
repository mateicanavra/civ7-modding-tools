import {
  describeRuleSelectionFailure,
  type RuleSelectionResult,
} from "@internal/habitat-harness/service/modules/check/rules/selection/index";
import {
  currentTimeMillis,
  epochMillisToIsoString,
} from "@internal/habitat-harness/service/runtime/resources/index";
import { Clock, Effect } from "effect";
import type { CheckReport, RuleReport, StructuralCheckRequest } from "./schema.js";

export function selectorRefusalReport(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  request: StructuralCheckRequest
): CheckReport {
  const started = currentTimeMillis();
  return constructCheckReport({
    command: request.command.serialized,
    reports: [
      {
        ruleId: "rule-selection-integrity",
        ownerTool: "habitat-builtin",
        lane: "enforced",
        status: "fail",
        locked: true,
        durationMs: currentTimeMillis() - started,
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
  });
}

export function selectorRefusalReportEffect(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  request: StructuralCheckRequest
): Effect.Effect<CheckReport> {
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;
    const ended = yield* Clock.currentTimeMillis;
    return yield* constructCheckReportEffect({
      command: request.command.serialized,
      reports: [
        {
          ruleId: "rule-selection-integrity",
          ownerTool: "habitat-builtin",
          lane: "enforced",
          status: "fail",
          locked: true,
          durationMs: Math.max(0, ended - started),
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
    });
  });
}

export function constructCheckReport(input: {
  command: string;
  reports: readonly RuleReport[];
}): CheckReport {
  return {
    schemaVersion: 1,
    command: input.command,
    startedAt: epochMillisToIsoString(currentTimeMillis()),
    ok: input.reports.every((report) => report.status !== "fail"),
    rules: [...input.reports],
  };
}

export function constructCheckReportEffect(input: {
  command: string;
  reports: readonly RuleReport[];
}): Effect.Effect<CheckReport> {
  return Effect.gen(function* () {
    const startedMs = yield* Clock.currentTimeMillis;
    return {
      schemaVersion: 1,
      command: input.command,
      startedAt: epochMillisToIsoString(startedMs),
      ok: input.reports.every((report) => report.status !== "fail"),
      rules: [...input.reports],
    };
  });
}
