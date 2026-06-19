import { type Static, Type } from "typebox";

const RequiredRuleMetadataSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    ownerTool: Type.Union([
      Type.Literal("biome"),
      Type.Literal("file-layer"),
      Type.Literal("grit-check"),
      Type.Literal("habitat-native"),
      Type.Literal("nx-boundaries"),
      Type.Literal("wrapped-script"),
      Type.Literal("wrapped-test"),
    ]),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    scope: Type.String({ minLength: 1 }),
    forbids: Type.String({ minLength: 1 }),
    why: Type.String({ minLength: 1 }),
    detect: Type.Array(Type.String(), { minItems: 1 }),
    remediate: Type.Union([Type.String(), Type.Null()]),
    message: Type.String({ minLength: 1 }),
    exceptionPath: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const RequiredCommandRuleMetadataSchema = Type.Omit(RequiredRuleMetadataSchema, ["ownerTool"]);

const CommandRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Union([
      Type.Literal("habitat-native"),
      Type.Literal("wrapped-script"),
      Type.Literal("biome"),
      Type.Literal("nx-boundaries"),
    ]),
  },
  { additionalProperties: false }
);

const WrappedTestRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("wrapped-test"),
    nxTarget: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const GritCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("grit-check"),
    gritPattern: Type.String({ minLength: 1 }),
    hookScope: Type.Optional(Type.Literal("pre-commit")),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const GeneratedZoneFileLayerRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("file-layer"),
    generatedZone: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("file-layer"),
    forbiddenFileNames: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  },
  { additionalProperties: false }
);

export const RuleRegistryRecordV1Schema = Type.Union([
  CommandRuleRegistryRecordV1Schema,
  WrappedTestRuleRegistryRecordV1Schema,
  GritCheckRuleRegistryRecordV1Schema,
  GeneratedZoneFileLayerRuleRegistryRecordV1Schema,
  ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema,
]);
export type RuleRegistryRecordV1 = Static<typeof RuleRegistryRecordV1Schema>;

export const RuleRegistryDocumentV1Schema = Type.Object(
  {
    $comment: Type.Optional(Type.String()),
    schemaVersion: Type.Literal(1),
    rules: Type.Array(RuleRegistryRecordV1Schema),
  },
  { additionalProperties: false }
);
export type RuleRegistryDocumentV1 = Static<typeof RuleRegistryDocumentV1Schema>;

export const RuleSelectorFactsSchema = Type.Pick(RequiredRuleMetadataSchema, [
  "id",
  "ownerProject",
  "ownerTool",
]);
export type RuleSelectorFacts = Static<typeof RuleSelectorFactsSchema>;

export const RuleReportFactsSchema = Type.Pick(RequiredRuleMetadataSchema, [
  "id",
  "ownerProject",
  "ownerTool",
  "lane",
  "detect",
  "message",
  "remediate",
]);
export type RuleReportFacts = Static<typeof RuleReportFactsSchema>;
