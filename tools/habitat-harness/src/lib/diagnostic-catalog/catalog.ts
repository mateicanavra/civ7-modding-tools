import { type Static, Type } from "typebox";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { GritDiagnosticIdentitySchema, gritDiagnosticIdentity } from "./identity.js";

export const DiagnosticNonClaimSchema = Type.Union([
  Type.Literal("not-pattern-governance-admission"),
  Type.Literal("not-baseline-authority"),
  Type.Literal("not-apply-safety"),
  Type.Literal("not-hook-sequencing"),
  Type.Literal("not-full-current-tree-cleanliness"),
  Type.Literal("workspace-cache-not-fresh-observation"),
]);

export const DiagnosticScanContractSchema = Type.Object(
  {
    kind: Type.Literal("d2-grit-scan-roots"),
    requiredFacet: Type.Literal("ruleGritFacts"),
  },
  { additionalProperties: false }
);

export const DiagnosticProjectionContractSchema = Type.Object(
  {
    kind: Type.Literal("grit-pattern-projection"),
    identity: GritDiagnosticIdentitySchema,
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
    scanContract: DiagnosticScanContractSchema,
    projectionContract: DiagnosticProjectionContractSchema,
    limitations: Type.Array(DiagnosticNonClaimSchema),
  },
  { additionalProperties: false }
);

export const DiagnosticCatalogEntrySchema = Type.Union([GritDiagnosticCatalogEntrySchema]);

export type DiagnosticNonClaim = Static<typeof DiagnosticNonClaimSchema>;
export type DiagnosticScanContract = Static<typeof DiagnosticScanContractSchema>;
export type DiagnosticProjectionContract = Static<typeof DiagnosticProjectionContractSchema>;
export type GritDiagnosticCatalogEntry = Static<typeof GritDiagnosticCatalogEntrySchema>;
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

