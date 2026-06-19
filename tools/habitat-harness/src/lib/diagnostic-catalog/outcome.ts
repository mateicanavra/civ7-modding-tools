import { type Static, Type } from "typebox";
import { DiagnosticAdapterFailureKindSchema } from "./failure.js";
import {
  DiagnosticCatalogEntrySchema,
  DiagnosticNonClaimSchema,
} from "./catalog.js";
import {
  ObservedGritDiagnosticIdentitySchema,
  GritDiagnosticIdentitySchema,
} from "./identity.js";

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
    diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
    diagnosticIdentity: GritDiagnosticIdentitySchema,
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
      kind: Type.Literal("projection-missed"),
      entry: DiagnosticCatalogEntrySchema,
      expectedIdentity: GritDiagnosticIdentitySchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("unexpected-diagnostic-identity"),
      entry: DiagnosticCatalogEntrySchema,
      unexpectedIdentity: ObservedGritDiagnosticIdentitySchema,
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
      diagnosticIdentity: GritDiagnosticIdentitySchema,
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
      diagnosticIdentity: GritDiagnosticIdentitySchema,
      diagnostics: Type.Array(DiagnosticFindingProjectionSchema, { minItems: 1 }),
      limitations: Type.Array(DiagnosticNonClaimSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Union([
        Type.Literal("adapter-failed"),
        Type.Literal("projection-missed"),
        Type.Literal("unexpected-diagnostic-identity"),
      ]),
      ruleId: Type.String({ minLength: 1 }),
      diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
      diagnosticIdentity: GritDiagnosticIdentitySchema,
      limitation: DiagnosticNonClaimSchema,
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
  return {
    kind: outcome.kind,
    ...base,
    limitation: "not-full-current-tree-cleanliness",
  };
}
