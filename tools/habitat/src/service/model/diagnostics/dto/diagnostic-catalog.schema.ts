import {
  GritDiagnosticAcquisitionPolicySchema,
  type RuleSourceFacts,
} from "@habitat/cli/service/model/rules/index";
import { type Static, Type } from "typebox";
import {
  GritDiagnosticIdentitySchema,
  gritDiagnosticIdentity,
} from "./diagnostic-identity.schema.js";

export const GritDiagnosticScanContractSchema = Type.Object(
  {
    kind: Type.Literal("rule-registry-scan-roots"),
    requiredFacet: Type.Literal("ruleSourceFacts"),
  },
  { additionalProperties: false }
);

export const DiagnosticScanContractSchema = GritDiagnosticScanContractSchema;

export const GritDiagnosticMatchContractSchema = Type.Object(
  {
    kind: Type.Literal("pattern-match"),
    identity: GritDiagnosticIdentitySchema,
  },
  { additionalProperties: false }
);

export const DiagnosticMatchContractSchema = GritDiagnosticMatchContractSchema;

export const GritDiagnosticAcquisitionContractSchema = GritDiagnosticAcquisitionPolicySchema;

export const GritDiagnosticCatalogEntrySchema = Type.Object(
  {
    kind: Type.Literal("diagnostic"),
    diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    diagnosticIdentity: GritDiagnosticIdentitySchema,
    source: Type.Literal("rule-registry-facts"),
    scanContract: GritDiagnosticScanContractSchema,
    acquisitionContract: GritDiagnosticAcquisitionContractSchema,
    matchContract: GritDiagnosticMatchContractSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticCatalogEntrySchema = GritDiagnosticCatalogEntrySchema;

export type GritDiagnosticScanContract = Static<typeof GritDiagnosticScanContractSchema>;
export type DiagnosticScanContract = GritDiagnosticScanContract;
export type GritDiagnosticMatchContract = Static<typeof GritDiagnosticMatchContractSchema>;
export type DiagnosticMatchContract = GritDiagnosticMatchContract;
export type GritDiagnosticAcquisitionContract = Static<
  typeof GritDiagnosticAcquisitionContractSchema
>;
export type GritDiagnosticCatalogEntry = Static<typeof GritDiagnosticCatalogEntrySchema>;
export type DiagnosticCatalogEntry = GritDiagnosticCatalogEntry;

export function diagnosticCatalogEntryFromRuleSourceFacts(
  rule: Pick<RuleSourceFacts, "id" | "patternName" | "diagnosticAcquisition">
): GritDiagnosticCatalogEntry {
  const diagnosticIdentity = gritDiagnosticIdentity(rule.patternName);
  return {
    kind: "diagnostic",
    diagnosticCatalogEntryId: `${rule.id}:${rule.patternName}`,
    ruleId: rule.id,
    diagnosticIdentity,
    source: "rule-registry-facts",
    scanContract: { kind: "rule-registry-scan-roots", requiredFacet: "ruleSourceFacts" },
    acquisitionContract: rule.diagnosticAcquisition,
    matchContract: { kind: "pattern-match", identity: diagnosticIdentity },
  };
}
