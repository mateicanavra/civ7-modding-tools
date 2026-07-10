import type {
  CheckReport,
  RuleReport,
  StructuralCheckRequest,
} from "@habitat/cli/service/model/check/index";
import {
  describeRuleSelectionFailure,
  type RuleSelectionResult,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Clock, Effect } from "effect";

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
          runner: "habitat",
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
          message:
            "Requested Habitat selectors must match real rule owners, rule ids, runners, and non-empty intersections before rule execution.",
          remediate:
            "Use --owner for owner project ids, --rule for rule ids, --runner for top-level runner names: grit, habitat, or nx; or omit selectors to run all rules.",
        },
      ],
    });
  });
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
      startedAt: new Date(startedMs).toISOString(),
      ok: input.reports.every((report) => report.status !== "fail"),
      rules: [...input.reports],
    };
  });
}
