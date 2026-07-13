import type { HabitatDiagnostic } from "../dto/check.schema.js";

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
