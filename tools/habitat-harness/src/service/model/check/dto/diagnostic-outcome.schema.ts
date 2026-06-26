import { type Static, Type } from "typebox";
import { DiagnosticProviderFailureKindSchema } from "../errors/diagnostic-provider.errors.js";
import { DiagnosticCatalogEntrySchema } from "./diagnostic-catalog.schema.js";
import { DiagnosticCacheObservationSchema } from "./diagnostic-command.schema.js";
import {
  DiagnosticIdentitySchema,
  ObservedDiagnosticIdentitySchema,
} from "./diagnostic-identity.schema.js";
import { DiagnosticScanRootRefusalSchema } from "./diagnostic-scan-root.schema.js";

const DiagnosticSeveritySchema = Type.Union([Type.Literal("error"), Type.Literal("advisory")]);
const BaselineStateSchema = Type.Union([
  Type.Literal("unbaselined"),
  Type.Literal("baseline-covered"),
  Type.Literal("baseline-owned-by-d5"),
]);

export const DiagnosticFindingSchema = Type.Object(
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
      diagnostics: Type.Array(DiagnosticFindingSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("provider-failed"),
      entry: DiagnosticCatalogEntrySchema,
      failure: DiagnosticProviderFailureKindSchema,
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
      kind: Type.Literal("identity-missing"),
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

export const DiagnosticConsumerResultSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("clean"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      diagnostics: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("findings"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      diagnostics: Type.Array(DiagnosticFindingSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("provider-failed"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      failure: DiagnosticProviderFailureKindSchema,
      detail: Type.String({ minLength: 1 }),
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
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("identity-missing"),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: DiagnosticIdentitySchema,
      expectedIdentity: DiagnosticIdentitySchema,
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
    },
    { additionalProperties: false }
  ),
]);

export type DiagnosticFinding = Static<typeof DiagnosticFindingSchema>;
export type DiagnosticRunOutcome = Static<typeof DiagnosticRunOutcomeSchema>;
export type DiagnosticConsumerResult = Static<typeof DiagnosticConsumerResultSchema>;

export function diagnosticConsumerResultFromOutcome(
  outcome: DiagnosticRunOutcome
): DiagnosticConsumerResult {
  const base = {
    ruleId: outcome.entry.ruleId,
    diagnosticCatalogEntryId: outcome.entry.diagnosticCatalogEntryId,
    diagnosticIdentity: outcome.entry.diagnosticIdentity,
  };
  if (outcome.kind === "clean") {
    return { kind: "clean", ...base, diagnostics: [] };
  }
  if (outcome.kind === "findings") {
    return {
      kind: "findings",
      ...base,
      diagnostics: outcome.diagnostics,
    };
  }
  switch (outcome.kind) {
    case "provider-failed":
      return {
        kind: "provider-failed",
        ...base,
        failure: outcome.failure,
        detail: outcome.detail,
      };
    case "scan-root-refused":
      return {
        kind: "scan-root-refused",
        ...base,
        decision: outcome.decision,
        detail: outcome.detail,
      };
    case "cache-observation-missing":
      return {
        kind: "cache-observation-missing",
        ...base,
        cache: outcome.cache,
        failure: outcome.failure,
        detail: outcome.detail,
      };
    case "identity-missing":
      return {
        kind: "identity-missing",
        ...base,
        expectedIdentity: outcome.expectedIdentity,
      };
    case "unexpected-diagnostic-identity":
      return {
        kind: "unexpected-diagnostic-identity",
        ...base,
        unexpectedIdentity: outcome.unexpectedIdentity,
      };
  }
}
