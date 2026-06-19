import { type Static, Type } from "typebox";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import {
  GritDiagnosticIdentitySchema,
  gritDiagnosticIdentity,
  NativeDiagnosticIdentitySchema,
  type NativeDiagnosticIdentityValue,
  nativeDiagnosticIdentity,
} from "./identity.js";

export const DiagnosticNonClaimSchema = Type.Union([
  Type.Literal("not-pattern-governance-admission"),
  Type.Literal("not-baseline-authority"),
  Type.Literal("not-apply-safety"),
  Type.Literal("not-hook-sequencing"),
  Type.Literal("not-full-current-tree-cleanliness"),
  Type.Literal("native-fixture-not-current-tree-outcome"),
  Type.Literal("workspace-cache-not-fresh-observation"),
]);

export const GritDiagnosticScanContractSchema = Type.Object(
  {
    kind: Type.Literal("d2-grit-scan-roots"),
    requiredFacet: Type.Literal("ruleGritFacts"),
  },
  { additionalProperties: false }
);

export const NativeDiagnosticScanContractSchema = Type.Object(
  {
    kind: Type.Literal("native-docs-scan-roots"),
    requiredScope: Type.Literal("docs-markdown"),
  },
  { additionalProperties: false }
);

export const DiagnosticScanContractSchema = Type.Union([
  GritDiagnosticScanContractSchema,
  NativeDiagnosticScanContractSchema,
]);

export const GritDiagnosticProjectionContractSchema = Type.Object(
  {
    kind: Type.Literal("grit-pattern-projection"),
    identity: GritDiagnosticIdentitySchema,
  },
  { additionalProperties: false }
);

export const NativeDiagnosticProjectionContractSchema = Type.Object(
  {
    kind: Type.Literal("native-rule-projection"),
    identity: NativeDiagnosticIdentitySchema,
  },
  { additionalProperties: false }
);

export const DiagnosticProjectionContractSchema = Type.Union([
  GritDiagnosticProjectionContractSchema,
  NativeDiagnosticProjectionContractSchema,
]);

export const NativeDiagnosticAcquisitionContractSchema = Type.Object(
  {
    kind: Type.Literal("docs-text-diagnostic"),
    outputContract: Type.Literal("standard-text-report"),
  },
  { additionalProperties: false }
);

export const GritDiagnosticCatalogEntrySchema = Type.Object(
  {
    kind: Type.Literal("grit-diagnostic"),
    diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    diagnosticIdentity: GritDiagnosticIdentitySchema,
    source: Type.Literal("d2-rule-grit-facts"),
    scanContract: GritDiagnosticScanContractSchema,
    projectionContract: GritDiagnosticProjectionContractSchema,
    limitations: Type.Array(DiagnosticNonClaimSchema),
  },
  { additionalProperties: false }
);

export const NativeDiagnosticCatalogEntrySchema = Type.Object(
  {
    kind: Type.Literal("native-diagnostic"),
    diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    diagnosticIdentity: NativeDiagnosticIdentitySchema,
    source: Type.Literal("native-habitat-rule"),
    scanContract: NativeDiagnosticScanContractSchema,
    acquisitionContract: NativeDiagnosticAcquisitionContractSchema,
    projectionContract: NativeDiagnosticProjectionContractSchema,
    limitations: Type.Array(DiagnosticNonClaimSchema),
  },
  { additionalProperties: false }
);

export const DiagnosticCatalogEntrySchema = Type.Union([
  GritDiagnosticCatalogEntrySchema,
  NativeDiagnosticCatalogEntrySchema,
]);

export type DiagnosticNonClaim = Static<typeof DiagnosticNonClaimSchema>;
export type GritDiagnosticScanContract = Static<typeof GritDiagnosticScanContractSchema>;
export type NativeDiagnosticScanContract = Static<typeof NativeDiagnosticScanContractSchema>;
export type DiagnosticScanContract = Static<typeof DiagnosticScanContractSchema>;
export type GritDiagnosticProjectionContract = Static<
  typeof GritDiagnosticProjectionContractSchema
>;
export type NativeDiagnosticProjectionContract = Static<
  typeof NativeDiagnosticProjectionContractSchema
>;
export type DiagnosticProjectionContract = Static<typeof DiagnosticProjectionContractSchema>;
export type NativeDiagnosticAcquisitionContract = Static<
  typeof NativeDiagnosticAcquisitionContractSchema
>;
export type GritDiagnosticCatalogEntry = Static<typeof GritDiagnosticCatalogEntrySchema>;
export type NativeDiagnosticCatalogEntry = Static<typeof NativeDiagnosticCatalogEntrySchema>;
export type DiagnosticCatalogEntry = Static<typeof DiagnosticCatalogEntrySchema>;

export function diagnosticCatalogEntryFromRuleGritFacts(
  rule: Pick<RuleGritFacts, "id" | "gritPattern">
): GritDiagnosticCatalogEntry {
  const diagnosticIdentity = gritDiagnosticIdentity(rule.gritPattern);
  return {
    kind: "grit-diagnostic",
    diagnosticCatalogEntryId: `${rule.id}:${rule.gritPattern}`,
    ruleId: rule.id,
    diagnosticIdentity,
    source: "d2-rule-grit-facts",
    scanContract: { kind: "d2-grit-scan-roots", requiredFacet: "ruleGritFacts" },
    projectionContract: { kind: "grit-pattern-projection", identity: diagnosticIdentity },
    limitations: [
      "not-pattern-governance-admission",
      "not-baseline-authority",
      "not-apply-safety",
      "not-hook-sequencing",
      "workspace-cache-not-fresh-observation",
    ],
  };
}

export function diagnosticCatalogEntryFromNativeRule(input: {
  ruleId: string;
  nativeDiagnosticIdentity: NativeDiagnosticIdentityValue;
}): NativeDiagnosticCatalogEntry {
  const diagnosticIdentity = nativeDiagnosticIdentity(input.nativeDiagnosticIdentity);
  return {
    kind: "native-diagnostic",
    diagnosticCatalogEntryId: `${input.ruleId}:${input.nativeDiagnosticIdentity}`,
    ruleId: input.ruleId,
    diagnosticIdentity,
    source: "native-habitat-rule",
    scanContract: { kind: "native-docs-scan-roots", requiredScope: "docs-markdown" },
    acquisitionContract: {
      kind: "docs-text-diagnostic",
      outputContract: "standard-text-report",
    },
    projectionContract: { kind: "native-rule-projection", identity: diagnosticIdentity },
    limitations: [
      "not-pattern-governance-admission",
      "not-baseline-authority",
      "not-apply-safety",
      "not-hook-sequencing",
      "not-full-current-tree-cleanliness",
      "native-fixture-not-current-tree-outcome",
    ],
  };
}
