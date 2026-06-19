import { type Static, Type } from "typebox";
import { DiagnosticNonClaimSchema } from "./catalog.js";
import { DiagnosticAdapterFailureKindSchema } from "./failure.js";
import { GritDiagnosticIdentitySchema } from "./identity.js";
import { DiagnosticFindingProjectionSchema } from "./outcome.js";

export const InjectedProbeRefusalReasonSchema = Type.Union([
  Type.Literal("unregistered-rule"),
  Type.Literal("metadata-missing"),
  Type.Literal("metadata-mismatched"),
  Type.Literal("pattern-identity-mismatch"),
  Type.Literal("probe-path-outside-repo"),
  Type.Literal("probe-path-outside-scan-root"),
  Type.Literal("probe-path-generated"),
  Type.Literal("probe-path-protected"),
  Type.Literal("probe-path-ignored"),
  Type.Literal("probe-path-pre-existing"),
  Type.Literal("missing-habitat-ownership-segment"),
  Type.Literal("same-probe-and-control-path"),
]);

export const InjectedProbeOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("probe-diagnostic-observed"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: GritDiagnosticIdentitySchema,
      matchingProbePath: Type.String({ minLength: 1 }),
      outsideScopeControlPath: Type.String({ minLength: 1 }),
      observedFinding: DiagnosticFindingProjectionSchema,
      cleanup: Type.Literal("restored"),
      validationClass: Type.Literal("injected-violation-diagnostic"),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("probe-refused"),
      reason: InjectedProbeRefusalReasonSchema,
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("probe-adapter-failed"),
      failure: DiagnosticAdapterFailureKindSchema,
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("probe-projection-missed"),
      expectedIdentity: GritDiagnosticIdentitySchema,
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("probe-control-matched"),
      controlPath: Type.String({ minLength: 1 }),
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("probe-cleanup-failed"),
      observedFinding: Type.Optional(DiagnosticFindingProjectionSchema),
      finalStatus: Type.Union([Type.Literal("dirty"), Type.Literal("not-restored")]),
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export type InjectedProbeRefusalReason = Static<typeof InjectedProbeRefusalReasonSchema>;
export type InjectedProbeOutcome = Static<typeof InjectedProbeOutcomeSchema>;
