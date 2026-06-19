import { describeRuleSelectionFailure, type RuleSelectionResult } from "../rule-selection.js";
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
