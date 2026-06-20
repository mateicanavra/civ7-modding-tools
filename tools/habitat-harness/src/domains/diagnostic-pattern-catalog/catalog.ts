import { type Static, Type } from "typebox";
import type { RulePatternFacts } from "../../domains/rule-registry/index.js";
import {
  GritDiagnosticIdentitySchema,
  gritDiagnosticIdentity,
  NativeDiagnosticIdentitySchema,
  type NativeDiagnosticIdentityValue,
  nativeDiagnosticIdentity,
} from "./identity.js";

export const GritDiagnosticScanContractSchema = Type.Object(
  {
    kind: Type.Literal("rule-registry-scan-roots"),
    requiredFacet: Type.Literal("rulePatternFacts"),
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

export const GritDiagnosticMatchContractSchema = Type.Object(
  {
    kind: Type.Literal("pattern-match"),
    identity: GritDiagnosticIdentitySchema,
  },
  { additionalProperties: false }
);

export const NativeDiagnosticMatchContractSchema = Type.Object(
  {
    kind: Type.Literal("native-rule-match"),
    identity: NativeDiagnosticIdentitySchema,
  },
  { additionalProperties: false }
);

export const DiagnosticMatchContractSchema = Type.Union([
  GritDiagnosticMatchContractSchema,
  NativeDiagnosticMatchContractSchema,
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
    kind: Type.Literal("diagnostic"),
    diagnosticCatalogEntryId: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    diagnosticIdentity: GritDiagnosticIdentitySchema,
    source: Type.Literal("rule-registry-facts"),
    scanContract: GritDiagnosticScanContractSchema,
    matchContract: GritDiagnosticMatchContractSchema,
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
    matchContract: NativeDiagnosticMatchContractSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticCatalogEntrySchema = Type.Union([
  GritDiagnosticCatalogEntrySchema,
  NativeDiagnosticCatalogEntrySchema,
]);

export type GritDiagnosticScanContract = Static<typeof GritDiagnosticScanContractSchema>;
export type NativeDiagnosticScanContract = Static<typeof NativeDiagnosticScanContractSchema>;
export type DiagnosticScanContract = Static<typeof DiagnosticScanContractSchema>;
export type GritDiagnosticMatchContract = Static<typeof GritDiagnosticMatchContractSchema>;
export type NativeDiagnosticMatchContract = Static<typeof NativeDiagnosticMatchContractSchema>;
export type DiagnosticMatchContract = Static<typeof DiagnosticMatchContractSchema>;
export type NativeDiagnosticAcquisitionContract = Static<
  typeof NativeDiagnosticAcquisitionContractSchema
>;
export type GritDiagnosticCatalogEntry = Static<typeof GritDiagnosticCatalogEntrySchema>;
export type NativeDiagnosticCatalogEntry = Static<typeof NativeDiagnosticCatalogEntrySchema>;
export type DiagnosticCatalogEntry = Static<typeof DiagnosticCatalogEntrySchema>;

export function diagnosticCatalogEntryFromRulePatternFacts(
  rule: Pick<RulePatternFacts, "id" | "patternName">
): GritDiagnosticCatalogEntry {
  const diagnosticIdentity = gritDiagnosticIdentity(rule.patternName);
  return {
    kind: "diagnostic",
    diagnosticCatalogEntryId: `${rule.id}:${rule.patternName}`,
    ruleId: rule.id,
    diagnosticIdentity,
    source: "rule-registry-facts",
    scanContract: { kind: "rule-registry-scan-roots", requiredFacet: "rulePatternFacts" },
    matchContract: { kind: "pattern-match", identity: diagnosticIdentity },
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
    matchContract: { kind: "native-rule-match", identity: diagnosticIdentity },
  };
}
