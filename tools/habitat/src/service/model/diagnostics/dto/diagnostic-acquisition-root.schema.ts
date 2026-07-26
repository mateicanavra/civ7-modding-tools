import {
  ProtectedZoneOwnerSchema,
  ProtectedZoneRecoveryInstructionSchema,
} from "@habitat/cli/service/model/host/dto/protected-zone.schema";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const DiagnosticSelectedAcquisitionRootsSchema = Type.Array(Type.String({ minLength: 1 }), {
  minItems: 1,
});
export type DiagnosticSelectedAcquisitionRoots = [string, ...string[]];

export const DiagnosticAcquisitionRootRefusalReasonSchema = Type.Union([
  Type.Literal("empty"),
  Type.Literal("outside-repo"),
  Type.Literal("missing"),
  Type.Literal("generated-output"),
  Type.Literal("protected-root"),
  Type.Literal("not-approved"),
]);

const DiagnosticEmptyAcquisitionRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Literal("empty"),
  },
  { additionalProperties: false }
);

const DiagnosticUnownedAcquisitionRootRefusalSchema = Type.Object(
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

const DiagnosticProtectedAcquisitionRootRefusalSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    reason: Type.Union([Type.Literal("generated-output"), Type.Literal("protected-root")]),
    root: Type.String({ minLength: 1 }),
    owner: ProtectedZoneOwnerSchema,
    recovery: ProtectedZoneRecoveryInstructionSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticAcquisitionRootRefusalSchema = Type.Union([
  DiagnosticEmptyAcquisitionRootRefusalSchema,
  DiagnosticUnownedAcquisitionRootRefusalSchema,
  DiagnosticProtectedAcquisitionRootRefusalSchema,
]);

export const DiagnosticAcquisitionRootDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("accepted"),
      roots: DiagnosticSelectedAcquisitionRootsSchema,
      source: Type.Literal("rule-registry-facts"),
    },
    { additionalProperties: false }
  ),
  DiagnosticAcquisitionRootRefusalSchema,
]);

export type DiagnosticAcquisitionRootRefusalReason = Static<
  typeof DiagnosticAcquisitionRootRefusalReasonSchema
>;
export type DiagnosticAcquisitionRootRefusal = Static<
  typeof DiagnosticAcquisitionRootRefusalSchema
>;
export type DiagnosticAcquisitionRootDecision =
  | {
      readonly kind: "accepted";
      readonly roots: DiagnosticSelectedAcquisitionRoots;
      readonly source: "rule-registry-facts";
    }
  | DiagnosticAcquisitionRootRefusal;

export function parseDiagnosticSelectedAcquisitionRoots(
  value: unknown
): DiagnosticSelectedAcquisitionRoots {
  const [first, ...rest] = Value.Parse(DiagnosticSelectedAcquisitionRootsSchema, value);
  if (first === undefined)
    throw new Error("Selected diagnostic acquisition roots must be nonempty.");
  return [first, ...rest];
}

export function isDiagnosticAcquisitionRootDecision(
  value: unknown
): value is DiagnosticAcquisitionRootDecision {
  return Value.Check(DiagnosticAcquisitionRootDecisionSchema, value);
}

export function renderDiagnosticAcquisitionRootRefusal(
  decision: Extract<DiagnosticAcquisitionRootDecision, { kind: "refused" }>
): string {
  switch (decision.reason) {
    case "empty":
      return "Diagnostic acquisition roots are empty.";
    case "outside-repo":
      return `Diagnostic acquisition root is outside the repo: ${decision.root}.`;
    case "missing":
      return `Diagnostic acquisition root does not exist: ${decision.root}.`;
    case "generated-output":
      return `Diagnostic acquisition root is generated output: ${decision.root}.`;
    case "protected-root":
      return `Diagnostic acquisition root is protected: ${decision.root}.`;
    case "not-approved":
      return `Diagnostic acquisition root is not approved: ${decision.root}.`;
  }
}
