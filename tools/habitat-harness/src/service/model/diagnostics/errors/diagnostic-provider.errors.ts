import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const DiagnosticProviderFailureKindLiteralSchemas = [
  Type.Literal("GritToolUnavailable"),
  Type.Literal("GritCommandFailed"),
  Type.Literal("GritNoJson"),
  Type.Literal("GritMalformedJson"),
  Type.Literal("GritSchemaDrift"),
  Type.Literal("GritUnexpectedResultShape"),
  Type.Literal("GritEmptyScanRoots"),
  Type.Literal("GritPatternMatchMissing"),
  Type.Literal("GritUnexpectedDiagnosticIdentity"),
  Type.Literal("GritCacheProvenanceMissing"),
  Type.Literal("GritProviderInternalContractViolation"),
] as const;

export const DiagnosticProviderFailureKindSchema = Type.Union([
  ...DiagnosticProviderFailureKindLiteralSchemas,
]);

export type DiagnosticProviderFailureKind = Static<typeof DiagnosticProviderFailureKindSchema>;

export const diagnosticProviderFailureKinds: readonly DiagnosticProviderFailureKind[] =
  DiagnosticProviderFailureKindLiteralSchemas.map(
    (schema) => schema.const as DiagnosticProviderFailureKind
  );

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
