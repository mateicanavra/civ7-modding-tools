import {
  ProtectedZoneOwnerSchema,
  ProtectedZoneRecoveryInstructionSchema,
} from "@habitat/cli/service/model/host/dto/protected-zone.schema";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const DiagnosticSelectedScanRootsSchema = Type.Array(Type.String({ minLength: 1 }), {
  minItems: 1,
});
export type DiagnosticSelectedScanRoots = [string, ...string[]];

export const DiagnosticScanRootRefusalReasonSchema = Type.Union([
  Type.Literal("empty"),
  Type.Literal("outside-repo"),
  Type.Literal("missing"),
  Type.Literal("generated-output"),
  Type.Literal("protected-root"),
  Type.Literal("not-approved"),
]);

const DiagnosticEmptyScanRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Literal("empty"),
  },
  { additionalProperties: false }
);

const DiagnosticUnownedScanRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Union([
      Type.Literal("outside-repo"),
      Type.Literal("missing"),
      Type.Literal("not-approved"),
    ]),
    root: Type.String({ minLength: 1 }),
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
  DiagnosticEmptyScanRootRefusalSchema,
  DiagnosticUnownedScanRootRefusalSchema,
  DiagnosticProtectedScanRootRefusalSchema,
]);

export const DiagnosticScanRootDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("accepted"),
      roots: DiagnosticSelectedScanRootsSchema,
      source: Type.Literal("rule-registry-facts"),
    },
    { additionalProperties: false }
  ),
  DiagnosticScanRootRefusalSchema,
]);

export type DiagnosticScanRootRefusalReason = Static<typeof DiagnosticScanRootRefusalReasonSchema>;
export type DiagnosticScanRootRefusal = Static<typeof DiagnosticScanRootRefusalSchema>;
export type DiagnosticScanRootDecision =
  | {
      readonly kind: "accepted";
      readonly roots: DiagnosticSelectedScanRoots;
      readonly source: "rule-registry-facts";
    }
  | DiagnosticScanRootRefusal;

export function parseDiagnosticSelectedScanRoots(value: unknown): DiagnosticSelectedScanRoots {
  const [first, ...rest] = Value.Parse(DiagnosticSelectedScanRootsSchema, value);
  if (first === undefined) throw new Error("Selected diagnostic scan roots must be nonempty.");
  return [first, ...rest];
}

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
