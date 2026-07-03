import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  ProtectedZoneOwnerSchema,
  ProtectedZoneRecoveryInstructionSchema,
} from "../../lib/protected-zones/schema.js";

export const DiagnosticScanRootRefusalReasonSchema = Type.Union([
  Type.Literal("empty"),
  Type.Literal("outside-repo"),
  Type.Literal("missing"),
  Type.Literal("generated-output"),
  Type.Literal("protected-root"),
  Type.Literal("not-approved"),
]);

const DiagnosticUnownedScanRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Union([
      Type.Literal("empty"),
      Type.Literal("outside-repo"),
      Type.Literal("missing"),
      Type.Literal("not-approved"),
    ]),
    root: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const DiagnosticProtectedScanRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Union([Type.Literal("generated-output"), Type.Literal("protected-root")]),
    root: Type.String({ minLength: 1 }),
    owner: ProtectedZoneOwnerSchema,
    recovery: ProtectedZoneRecoveryInstructionSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticScanRootRefusalSchema = Type.Union([
  DiagnosticUnownedScanRootRefusalSchema,
  DiagnosticProtectedScanRootRefusalSchema,
]);

export const DiagnosticScanRootDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("accepted"),
      roots: Type.Array(Type.String({ minLength: 1 })),
      source: Type.Literal("rule-registry-facts"),
    },
    { additionalProperties: false }
  ),
  DiagnosticScanRootRefusalSchema,
]);

export type DiagnosticScanRootRefusalReason = Static<typeof DiagnosticScanRootRefusalReasonSchema>;
export type DiagnosticScanRootDecision = Static<typeof DiagnosticScanRootDecisionSchema>;
export type DiagnosticScanRootRefusal = Static<typeof DiagnosticScanRootRefusalSchema>;

export function isDiagnosticScanRootDecision(value: unknown): value is DiagnosticScanRootDecision {
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
  }
}
