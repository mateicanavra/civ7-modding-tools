import type { HabitatDiagnostic, RuleExecutionDisposition } from "../dto/check.schema.js";

export const dependencyRefusalMessagePrefix = "Dependency refused: ";

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

export function isNonBaselinableDisposition(
  disposition: Pick<RuleExecutionDisposition, "kind">
): boolean {
  return disposition.kind === "dependency-refused" || disposition.kind === "execution-failed";
}
