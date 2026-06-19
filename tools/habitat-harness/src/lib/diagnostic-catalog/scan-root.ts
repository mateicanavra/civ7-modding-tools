import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const DiagnosticScanRootRefusalReasonSchema = Type.Union([
  Type.Literal("empty"),
  Type.Literal("outside-repo"),
  Type.Literal("missing"),
  Type.Literal("generated-output"),
  Type.Literal("protected-root"),
  Type.Literal("not-approved"),
  Type.Literal("injected-probe-root-without-probe-mode"),
]);

export const DiagnosticScanRootDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("accepted"),
      roots: Type.Array(Type.String({ minLength: 1 })),
      source: Type.Literal("d2-rule-grit-facts"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("expanded-test-files"),
      requestedRoots: Type.Array(Type.String({ minLength: 1 })),
      effectiveRoots: Type.Array(Type.String({ minLength: 1 })),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("accepted-injected-probe-root"),
      roots: Type.Array(Type.String({ minLength: 1 })),
      probeOnly: Type.Literal(true),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused"),
      reason: DiagnosticScanRootRefusalReasonSchema,
      root: Type.Optional(Type.String({ minLength: 1 })),
    },
    { additionalProperties: false }
  ),
]);

export type DiagnosticScanRootRefusalReason = Static<
  typeof DiagnosticScanRootRefusalReasonSchema
>;
export type DiagnosticScanRootDecision = Static<typeof DiagnosticScanRootDecisionSchema>;

export function isDiagnosticScanRootDecision(
  value: unknown
): value is DiagnosticScanRootDecision {
  return Value.Check(DiagnosticScanRootDecisionSchema, value);
}

export function renderDiagnosticScanRootRefusal(
  decision: Extract<DiagnosticScanRootDecision, { kind: "refused" }>
): string {
  switch (decision.reason) {
    case "empty":
      return "Grit scan roots are empty.";
    case "outside-repo":
      return `Grit scan root is outside the repo: ${decision.root}.`;
    case "missing":
      return `Grit scan root does not exist: ${decision.root}.`;
    case "generated-output":
      return `Grit scan root is generated output: ${decision.root}.`;
    case "protected-root":
      return `Grit scan root is protected: ${decision.root}.`;
    case "not-approved":
      return `Grit scan root is not approved: ${decision.root}.`;
    case "injected-probe-root-without-probe-mode":
      return `Grit scan root is an injected probe root outside probe mode: ${decision.root}.`;
  }
}

