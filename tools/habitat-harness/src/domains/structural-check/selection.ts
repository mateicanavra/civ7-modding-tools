import { Effect } from "effect";
import {
  describeRuleSelectionFailure,
  type RuleSelectionResult,
} from "../../domains/rule-selection/index.js";
import { HabitatClock } from "../../resources/index.js";
import type { CheckReport, RuleReport, StructuralCheckRequest } from "./schema.js";

export function selectorRefusalReport(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  request: StructuralCheckRequest
): CheckReport {
  const started = Date.now();
  return constructCheckReport({
    command: request.command.serialized,
    reports: [
      {
        ruleId: "rule-selection-integrity",
        ownerTool: "habitat-builtin",
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
  });
}

export function selectorRefusalReportEffect(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  request: StructuralCheckRequest
): Effect.Effect<CheckReport, never, HabitatClock> {
  return Effect.gen(function* () {
    const clock = yield* HabitatClock;
    const started = yield* clock.currentTimeMillis;
    const ended = yield* clock.currentTimeMillis;
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
    startedAt: new Date().toISOString(),
    ok: input.reports.every((report) => report.status !== "fail"),
    rules: [...input.reports],
  };
}

export function constructCheckReportEffect(input: {
  command: string;
  reports: readonly RuleReport[];
}): Effect.Effect<CheckReport, never, HabitatClock> {
  return Effect.gen(function* () {
    const clock = yield* HabitatClock;
    return {
      schemaVersion: 1,
      command: input.command,
      startedAt: (yield* clock.currentDate).toISOString(),
      ok: input.reports.every((report) => report.status !== "fail"),
      rules: [...input.reports],
    };
  });
}
