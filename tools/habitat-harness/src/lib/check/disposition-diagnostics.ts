import type { HabitatDiagnostic, RuleExecutionDisposition } from "./schema.js";

export const notApplicableDiagnosticMessages = {
  "staged-scope-no-approved-roots":
    "Rule not applicable: staged scope contains no approved roots for this rule.",
  "rule-not-in-requested-scope": "Rule not applicable: rule is not in the requested scope.",
} as const satisfies Record<
  Extract<RuleExecutionDisposition, { kind: "not-applicable" }>["reason"],
  string
>;

export const dependencyRefusalMessagePrefix = "Dependency refused: ";

export function notApplicableDiagnostic(
  rule: { id: string },
  reason: keyof typeof notApplicableDiagnosticMessages
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: notApplicableDiagnosticMessages[reason],
    severity: "error",
    baselined: false,
  };
}

export function dependencyRefusalDiagnostic(
  rule: { id: string },
  message: string
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: `${dependencyRefusalMessagePrefix}${message}`,
    severity: "error",
    baselined: false,
  };
}

export function isNotApplicableDiagnostic(diagnostic: HabitatDiagnostic): boolean {
  return Object.values(notApplicableDiagnosticMessages).includes(
    diagnostic.message as (typeof notApplicableDiagnosticMessages)[keyof typeof notApplicableDiagnosticMessages]
  );
}

export function isDependencyRefusalDiagnostic(diagnostic: HabitatDiagnostic): boolean {
  return diagnostic.message.startsWith(dependencyRefusalMessagePrefix);
}
