import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const DiagnosticAdapterFailureKindLiteralSchemas = [
  Type.Literal("GritToolUnavailable"),
  Type.Literal("GritCommandFailed"),
  Type.Literal("GritNoJson"),
  Type.Literal("GritMalformedJson"),
  Type.Literal("GritSchemaDrift"),
  Type.Literal("GritUnexpectedResultShape"),
  Type.Literal("GritEmptyScanRoots"),
  Type.Literal("GritPatternProjectionMiss"),
  Type.Literal("GritUnexpectedDiagnosticIdentity"),
  Type.Literal("GritCacheProvenanceMissing"),
  Type.Literal("GritAdapterInternalContractViolation"),
] as const;

export const DiagnosticAdapterFailureKindSchema = Type.Union(
  [...DiagnosticAdapterFailureKindLiteralSchemas]
);

export type DiagnosticAdapterFailureKind = Static<typeof DiagnosticAdapterFailureKindSchema>;

export const diagnosticAdapterFailureKinds: readonly DiagnosticAdapterFailureKind[] =
  DiagnosticAdapterFailureKindLiteralSchemas.map(
    (schema) => schema.const as DiagnosticAdapterFailureKind
  );

export function isDiagnosticAdapterFailureKind(
  value: unknown
): value is DiagnosticAdapterFailureKind {
  return Value.Check(DiagnosticAdapterFailureKindSchema, value);
}

export function renderDiagnosticAdapterFailure(
  kind: DiagnosticAdapterFailureKind,
  detail = "Grit adapter failed before producing rule findings."
): string {
  return `--- grit adapter failure (${kind}) ---\n${detail}`;
}

export function diagnosticAdapterFailureFromText(
  text: string
): DiagnosticAdapterFailureKind | null {
  const match = text.match(/grit adapter failure \(([^)]+)\)/);
  if (!match) return null;
  return isDiagnosticAdapterFailureKind(match[1]) ? match[1] : null;
}
