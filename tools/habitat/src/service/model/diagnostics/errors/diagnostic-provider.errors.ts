import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const DiagnosticProviderFailureKindLiteralSchemas = [
  Type.Literal("GritToolUnavailable"),
  Type.Literal("GritNativeIdentityMismatch"),
  Type.Literal("GritRootCanonicalizationFailed"),
  Type.Literal("GritPatternAssetFailed"),
  Type.Literal("GritScopedConfigFailed"),
  Type.Literal("GritCommandFailed"),
  Type.Literal("GritCommandInterrupted"),
  Type.Literal("GritOutputMissing"),
  Type.Literal("GritWrongOutputStream"),
  Type.Literal("GritOutputTruncated"),
  Type.Literal("GritMalformedOutput"),
  Type.Literal("GritSchemaDrift"),
  Type.Literal("GritObservationIncomplete"),
  Type.Literal("GritUnexpectedDiagnosticIdentity"),
  Type.Literal("GritProviderInternalContractViolation"),
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
  return `--- grit provider failure (${kind}) ---\n${detail}`;
}
