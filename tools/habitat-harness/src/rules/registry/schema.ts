import { type Static, Type } from "typebox";

const RuleIdentitySchema = Type.Object(
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
  },
  { additionalProperties: false }
);

const RuleReportSchema = Type.Object(
  {
    forbids: Type.String({ minLength: 1 }),
    why: Type.String({ minLength: 1 }),
    detect: Type.Array(Type.String(), { minItems: 1 }),
    remediate: Type.Union([Type.String(), Type.Null()]),
    message: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const LegacyRuleCompatibilitySchema = Type.Object(
  {
    scope: Type.String({ minLength: 1 }),
    exceptionPath: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const RulePathCoverageSchema = Type.Array(
  Type.Union([
    Type.Object(
      {
        kind: Type.Literal("exact-path"),
        patterns: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("project-owner"),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("workspace-gate"),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("unresolved-metadata"),
        reason: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  ]),
  { minItems: 1 }
);

const RequiredRuleMetadataSchema = Type.Interface(
  [RuleIdentitySchema, RuleReportSchema, LegacyRuleCompatibilitySchema],
  {
    pathCoverage: RulePathCoverageSchema,
  },
  { additionalProperties: false }
);

const RequiredCommandRuleMetadataSchema = Type.Omit(RequiredRuleMetadataSchema, ["ownerTool"]);
export const RuleRoutingFactsSchema = Type.Interface(
  [Type.Pick(RuleIdentitySchema, ["id", "ownerTool", "ownerProject"])],
  {
    pathCoverage: RulePathCoverageSchema,
  },
  { additionalProperties: false }
);
export type RuleRoutingFacts = Static<typeof RuleRoutingFactsSchema>;

const DirectCommandOwnerToolSchema = Type.Union([
  Type.Literal("habitat-native"),
  Type.Literal("wrapped-script"),
  Type.Literal("biome"),
  Type.Literal("nx-boundaries"),
]);
const CommandOwnerToolSchema = Type.Union([
  Type.Literal("habitat-native"),
  Type.Literal("wrapped-script"),
  Type.Literal("biome"),
  Type.Literal("nx-boundaries"),
  Type.Literal("wrapped-test"),
]);
const LocalFeedbackSchema = Type.Literal(true);
const GritScanRootSchema = Type.String({ minLength: 1 });
const GraphTargetSchema = Type.Object(
  {
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const CommandRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: DirectCommandOwnerToolSchema,
  },
  { additionalProperties: false }
);

const WrappedTestRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("wrapped-test"),
    graphTarget: GraphTargetSchema,
  },
  { additionalProperties: false }
);

export const GritCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("grit-check"),
    gritPattern: Type.String({ minLength: 1 }),
    scanRoots: Type.Array(GritScanRootSchema, { minItems: 1 }),
    expandIgnoredTestDirectories: Type.Optional(Type.Literal(true)),
    localFeedback: Type.Optional(LocalFeedbackSchema),
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
    ownerRoots: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 }), {
      minProperties: 1,
    }),
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

export const RuleReportFactsSchema = Type.Interface(
  [
    Type.Pick(RuleIdentitySchema, ["id", "ownerTool", "lane"]),
    Type.Pick(RuleReportSchema, ["detect", "message", "remediate"]),
  ],
  {},
  { additionalProperties: false }
);
export type RuleReportFacts = Static<typeof RuleReportFactsSchema>;

export const RuleBaselineFactsSchema = Type.Pick(RequiredRuleMetadataSchema, [
  "id",
  "exceptionPath",
]);
export type RuleBaselineFacts = Static<typeof RuleBaselineFactsSchema>;

const RuleGraphOwnerSchema = Type.Object(
  {
    ownerRoot: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);
export const RuleGraphFactsSchema = Type.Interface(
  [Type.Pick(RuleIdentitySchema, ["id", "ownerProject"]), RuleGraphOwnerSchema],
  {
    alias: Type.Union([
      Type.Object(
        {
          kind: Type.Literal("direct-rule-check"),
        },
        { additionalProperties: false }
      ),
      Type.Object(
        {
          kind: Type.Literal("depends-on"),
          target: GraphTargetSchema,
        },
        { additionalProperties: false }
      ),
    ]),
  },
  { additionalProperties: false }
);
export type RuleGraphFacts = Static<typeof RuleGraphFactsSchema>;

export const RuleCommandExecutionFactsSchema = Type.Interface(
  [
    Type.Pick(RuleIdentitySchema, ["id", "lane"]),
    Type.Pick(RuleReportSchema, ["detect", "message"]),
  ],
  {
    ownerTool: CommandOwnerToolSchema,
  },
  { additionalProperties: false }
);
export type RuleCommandExecutionFacts = Static<typeof RuleCommandExecutionFactsSchema>;

export const RuleGritFactsSchema = Type.Pick(GritCheckRuleRegistryRecordV1Schema, [
  "id",
  "lane",
  "message",
  "gritPattern",
  "scanRoots",
  "expandIgnoredTestDirectories",
]);
export type RuleGritFacts = Static<typeof RuleGritFactsSchema>;

export const RuleFileLayerFactsSchema = Type.Union([
  Type.Pick(GeneratedZoneFileLayerRuleRegistryRecordV1Schema, [
    "id",
    "ownerTool",
    "lane",
    "message",
    "generatedZone",
  ]),
  Type.Pick(ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema, [
    "id",
    "ownerTool",
    "lane",
    "message",
    "forbiddenFileNames",
  ]),
]);
export type RuleFileLayerFacts = Static<typeof RuleFileLayerFactsSchema>;

export const RuleLocalFeedbackFactsSchema = Type.Interface(
  [Type.Pick(GritCheckRuleRegistryRecordV1Schema, ["id"])],
  {
    localFeedback: LocalFeedbackSchema,
  },
  { additionalProperties: false }
);
export type RuleLocalFeedbackFacts = Static<typeof RuleLocalFeedbackFactsSchema>;
