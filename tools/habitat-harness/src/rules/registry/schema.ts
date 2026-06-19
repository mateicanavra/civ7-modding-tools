import { type Static, Type } from "typebox";

const RuleIdentitySchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    ownerTool: Type.Union([
      Type.Literal("format-check"),
      Type.Literal("file-layer"),
      Type.Literal("pattern-check"),
      Type.Literal("import-boundaries"),
      Type.Literal("command-check"),
      Type.Literal("target-check"),
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

const RuleExceptionMetadataSchema = Type.Object(
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
  [RuleIdentitySchema, RuleReportSchema, RuleExceptionMetadataSchema],
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

const DirectCommandOwnerToolSchema = Type.Union([
  Type.Literal("command-check"),
  Type.Literal("format-check"),
  Type.Literal("import-boundaries"),
]);
const CommandOwnerToolSchema = Type.Union([
  Type.Literal("command-check"),
  Type.Literal("format-check"),
  Type.Literal("import-boundaries"),
  Type.Literal("target-check"),
]);
const HookCheckSchema = Type.Literal(true);
const PatternScanRootSchema = Type.String({ minLength: 1 });
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
    ownerTool: Type.Literal("target-check"),
    graphTarget: GraphTargetSchema,
  },
  { additionalProperties: false }
);

export const PatternCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("pattern-check"),
    patternName: Type.String({ minLength: 1 }),
    scanRoots: Type.Array(PatternScanRootSchema, { minItems: 1 }),
    expandIgnoredTestDirectories: Type.Optional(Type.Literal(true)),
    hookCheck: Type.Optional(HookCheckSchema),
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

const HostSurfaceFileLayerRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("file-layer"),
    hostSurfaceGuard: Type.Literal(true),
  },
  { additionalProperties: false }
);

export const RuleRegistryRecordV1Schema = Type.Union([
  CommandRuleRegistryRecordV1Schema,
  WrappedTestRuleRegistryRecordV1Schema,
  PatternCheckRuleRegistryRecordV1Schema,
  GeneratedZoneFileLayerRuleRegistryRecordV1Schema,
  ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema,
  HostSurfaceFileLayerRuleRegistryRecordV1Schema,
]);

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

export const RuleRegistryIndexV1Schema = Type.Object(
  {
    $comment: Type.Optional(Type.String()),
    schemaVersion: Type.Literal(1),
    ownerRoots: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 }), {
      minProperties: 1,
    }),
  },
  { additionalProperties: false }
);

export const RuleSelectorFactsSchema = Type.Pick(RequiredRuleMetadataSchema, [
  "id",
  "ownerProject",
  "ownerTool",
]);

export const RuleReportFactsSchema = Type.Interface(
  [
    Type.Pick(RuleIdentitySchema, ["id", "ownerTool", "lane"]),
    Type.Pick(RuleReportSchema, ["detect", "message", "remediate"]),
  ],
  {},
  { additionalProperties: false }
);

export const RuleBaselineFactsSchema = Type.Pick(RequiredRuleMetadataSchema, [
  "id",
  "exceptionPath",
]);

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

export const RulePatternFactsSchema = Type.Pick(PatternCheckRuleRegistryRecordV1Schema, [
  "id",
  "lane",
  "message",
  "patternName",
  "scanRoots",
  "expandIgnoredTestDirectories",
]);

export const RuleManifestFactsSchema = Type.Interface(
  [Type.Pick(PatternCheckRuleRegistryRecordV1Schema, ["id", "lane", "patternName"])],
  {
    manifestPath: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

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
  Type.Pick(HostSurfaceFileLayerRuleRegistryRecordV1Schema, [
    "id",
    "ownerTool",
    "lane",
    "message",
    "hostSurfaceGuard",
  ]),
]);

export const RuleHookCheckFactsSchema = Type.Interface(
  [Type.Pick(PatternCheckRuleRegistryRecordV1Schema, ["id"])],
  {
    hookCheck: HookCheckSchema,
  },
  { additionalProperties: false }
);

export type RuleRegistryRecordV1 = Static<typeof RuleRegistryRecordV1Schema>;
export type RuleRegistryDocumentV1 = Static<typeof RuleRegistryDocumentV1Schema>;
export type RuleRegistryIndexV1 = Static<typeof RuleRegistryIndexV1Schema>;
export type RuleSelectorFacts = Static<typeof RuleSelectorFactsSchema>;
export type RuleReportFacts = Static<typeof RuleReportFactsSchema>;
export type RuleBaselineFacts = Static<typeof RuleBaselineFactsSchema>;
export type RuleRoutingFacts = Static<typeof RuleRoutingFactsSchema>;
export type RuleGraphFacts = Static<typeof RuleGraphFactsSchema>;
export type RuleCommandExecutionFacts = Static<typeof RuleCommandExecutionFactsSchema>;
export type RulePatternFacts = Static<typeof RulePatternFactsSchema>;
export type RuleManifestFacts = Static<typeof RuleManifestFactsSchema>;
export type RuleFileLayerFacts = Static<typeof RuleFileLayerFactsSchema>;
export type RuleHookCheckFacts = Static<typeof RuleHookCheckFactsSchema>;
