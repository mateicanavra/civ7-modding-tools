import { type Static, Type } from "typebox";
import { DiagnosticCatalogEntrySchema, DiagnosticNonClaimSchema } from "./catalog.js";
import { DiagnosticCacheObservationSchema } from "./command.js";
import { DiagnosticAdapterFailureKindSchema } from "./failure.js";
import { DiagnosticIdentitySchema, ObservedDiagnosticIdentitySchema } from "./identity.js";
import { DiagnosticScanRootRefusalSchema } from "./scan-root.js";

const DiagnosticSeveritySchema = Type.Union([Type.Literal("error"), Type.Literal("advisory")]);
const BaselineStateSchema = Type.Union([
  Type.Literal("unbaselined"),
  Type.Literal("baseline-covered"),
  Type.Literal("baseline-owned-by-d5"),
]);

export const DiagnosticFindingProjectionSchema = Type.Object(
  {
    kind: Type.Literal("diagnostic-finding"),
    ruleId: Type.String({ minLength: 1 }),
    path: Type.String({ minLength: 1 }),
    line: Type.Optional(Type.Number()),
    message: Type.String({ minLength: 1 }),
    severity: DiagnosticSeveritySchema,
    baselineState: BaselineStateSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticRunOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("clean"),
      entry: DiagnosticCatalogEntrySchema,
      diagnostics: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("findings"),
      entry: DiagnosticCatalogEntrySchema,
      diagnostics: Type.Array(DiagnosticFindingProjectionSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("adapter-failed"),
      entry: DiagnosticCatalogEntrySchema,
      failure: DiagnosticAdapterFailureKindSchema,
      detail: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("scan-root-refused"),
      entry: DiagnosticCatalogEntrySchema,
      decision: DiagnosticScanRootRefusalSchema,
      detail: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("cache-observation-missing"),
      entry: DiagnosticCatalogEntrySchema,
      cache: DiagnosticCacheObservationSchema,
      failure: Type.Literal("GritCacheProvenanceMissing"),
      detail: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("projection-missed"),
      entry: DiagnosticCatalogEntrySchema,
      expectedIdentity: DiagnosticIdentitySchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("unexpected-diagnostic-identity"),
      entry: DiagnosticCatalogEntrySchema,
      unexpectedIdentity: ObservedDiagnosticIdentitySchema,
    },
    { additionalProperties: false }
  ),
]);

export const DiagnosticConsumerProjectionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("clean"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      diagnostics: Type.Tuple([]),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("findings"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      diagnostics: Type.Array(DiagnosticFindingProjectionSchema, { minItems: 1 }),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("adapter-failed"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      failure: DiagnosticAdapterFailureKindSchema,
      detail: Type.String({ minLength: 1 }),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("scan-root-refused"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      decision: DiagnosticScanRootRefusalSchema,
      detail: Type.String({ minLength: 1 }),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("cache-observation-missing"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      cache: DiagnosticCacheObservationSchema,
      failure: Type.Literal("GritCacheProvenanceMissing"),
      detail: Type.String({ minLength: 1 }),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("projection-missed"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      expectedIdentity: DiagnosticIdentitySchema,
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("unexpected-diagnostic-identity"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      unexpectedIdentity: ObservedDiagnosticIdentitySchema,
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
]);

export type DiagnosticFindingProjection = Static<typeof DiagnosticFindingProjectionSchema>;
export type DiagnosticRunOutcome = Static<typeof DiagnosticRunOutcomeSchema>;
export type DiagnosticConsumerProjection = Static<typeof DiagnosticConsumerProjectionSchema>;

export function diagnosticConsumerProjectionFromOutcome(
  outcome: DiagnosticRunOutcome
): DiagnosticConsumerProjection {
  const base = {
    ruleId: outcome.entry.ruleId,
    diagnosticCatalogEntryId: outcome.entry.diagnosticCatalogEntryId,
    diagnosticIdentity: outcome.entry.diagnosticIdentity,
  };
  if (outcome.kind === "clean") {
    return { kind: "clean", ...base, diagnostics: [], limitations: outcome.entry.limitations };
  }
  if (outcome.kind === "findings") {
    return {
      kind: "findings",
      ...base,
      diagnostics: outcome.diagnostics,
      limitations: outcome.entry.limitations,
    };
  }
  switch (outcome.kind) {
    case "adapter-failed":
      return {
        kind: "adapter-failed",
        ...base,
        failure: outcome.failure,
        detail: outcome.detail,
        limitations: outcome.entry.limitations,
      };
    case "scan-root-refused":
      return {
        kind: "scan-root-refused",
        ...base,
        decision: outcome.decision,
        detail: outcome.detail,
        limitations: outcome.entry.limitations,
      };
    case "cache-observation-missing":
      return {
        kind: "cache-observation-missing",
        ...base,
        cache: outcome.cache,
        failure: outcome.failure,
        detail: outcome.detail,
        limitations: outcome.entry.limitations,
      };
    case "projection-missed":
      return {
        kind: "projection-missed",
        ...base,
        expectedIdentity: outcome.expectedIdentity,
        limitations: outcome.entry.limitations,
      };
    case "unexpected-diagnostic-identity":
      return {
        kind: "unexpected-diagnostic-identity",
        ...base,
        unexpectedIdentity: outcome.unexpectedIdentity,
        limitations: outcome.entry.limitations,
      };
  }
}
