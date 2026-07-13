import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import type { HabitatDiagnostic } from "../dto/habitat-diagnostic.schema.js";

const DiagnosticProviderFailureKindLiteralSchemas = [
  Type.Literal("DiagnosticProviderUnavailable"),
  Type.Literal("DiagnosticProviderIdentityMismatch"),
  Type.Literal("DiagnosticScopePlanningFailed"),
  Type.Literal("DiagnosticRuleMaterializationFailed"),
  Type.Literal("DiagnosticProviderSetupFailed"),
  Type.Literal("DiagnosticCommandFailed"),
  Type.Literal("DiagnosticCommandInterrupted"),
  Type.Literal("DiagnosticOutputMissing"),
  Type.Literal("DiagnosticOutputChannelMismatch"),
  Type.Literal("DiagnosticOutputTruncated"),
  Type.Literal("DiagnosticOutputMalformed"),
  Type.Literal("DiagnosticOutputSchemaDrift"),
  Type.Literal("DiagnosticOutputIncomplete"),
  Type.Literal("DiagnosticUnexpectedIdentity"),
  Type.Literal("DiagnosticProviderContractViolation"),
] as const;

export const DiagnosticProviderFailureKindSchema = Type.Union([
  ...DiagnosticProviderFailureKindLiteralSchemas,
]);

export type DiagnosticProviderFailureKind = Static<typeof DiagnosticProviderFailureKindSchema>;

export const diagnosticProviderFailureKinds: readonly DiagnosticProviderFailureKind[] =
  DiagnosticProviderFailureKindLiteralSchemas.map((schema) => schema.const);

export function isDiagnosticProviderFailureKind(
  value: string
): value is DiagnosticProviderFailureKind {
  return Value.Check(DiagnosticProviderFailureKindSchema, value);
}

export function renderDiagnosticProviderFailure(
  kind: DiagnosticProviderFailureKind,
  detail = "Diagnostic provider failed before producing rule findings."
): string {
  return `--- diagnostic provider failure (${kind}) ---\n${detail}`;
}

export function diagnosticProviderFailureDiagnostic(
  rule: { readonly id: string; readonly lane: "enforced" | "advisory"; readonly message: string },
  kind: DiagnosticProviderFailureKind,
  detail?: string
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: `${rule.message}\n${renderDiagnosticProviderFailure(kind, detail)}`,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselined: false,
  };
}
