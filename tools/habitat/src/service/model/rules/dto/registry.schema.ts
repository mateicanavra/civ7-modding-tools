import { type Static, Type } from "typebox";

const RuleIdentitySchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    title: Type.Optional(Type.String({ minLength: 1 })),
    ownerProject: Type.String({ minLength: 1 }),
    ownerTool: Type.Union([
      Type.Literal("format-check"),
      Type.Literal("file-layer"),
      Type.Literal("grit-check"),
      Type.Literal("habitat"),
      Type.Literal("source-check"),
      Type.Literal("command-check"),
      Type.Literal("structure-check"),
      Type.Literal("nx"),
    ]),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
  },
  { additionalProperties: false }
);

const RuleIdentityInputSchema = Type.Omit(RuleIdentitySchema, ["id", "title"]);

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

const RuleExceptionMetadataInputSchema = Type.Object(
  {
    scope: Type.String({ minLength: 1 }),
    exceptionPath: Type.Optional(Type.String({ minLength: 1 })),
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

const RequiredRuleMetadataInputSchema = Type.Interface(
  [RuleIdentityInputSchema, RuleReportSchema, RuleExceptionMetadataInputSchema],
  {
    pathCoverage: RulePathCoverageSchema,
  },
  { additionalProperties: false }
);

const RequiredCommandRuleMetadataSchema = Type.Omit(RequiredRuleMetadataSchema, ["ownerTool"]);
const RequiredCommandRuleMetadataInputSchema = Type.Omit(RequiredRuleMetadataInputSchema, [
  "ownerTool",
]);
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
  Type.Literal("habitat"),
]);
const CommandOwnerToolSchema = Type.Union([
  Type.Literal("command-check"),
  Type.Literal("format-check"),
  Type.Literal("habitat"),
  Type.Literal("nx"),
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

const CommandRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: DirectCommandOwnerToolSchema,
  },
  { additionalProperties: false }
);

const StructureCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("structure-check"),
    structureFile: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const StructureCheckRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: Type.Literal("structure-check"),
  },
  { additionalProperties: false }
);

const NxRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("nx"),
    graphTarget: GraphTargetSchema,
  },
  { additionalProperties: false }
);

const NxRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: Type.Literal("nx"),
    graphTarget: GraphTargetSchema,
  },
  { additionalProperties: false }
);

export const SourceCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("source-check"),
    patternName: Type.String({ minLength: 1 }),
    scanRoots: Type.Array(PatternScanRootSchema, { minItems: 1 }),
    hookCheck: Type.Optional(HookCheckSchema),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const SourceCheckRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: Type.Literal("source-check"),
    patternName: Type.Optional(Type.String({ minLength: 1 })),
    scanRoots: Type.Array(PatternScanRootSchema, { minItems: 1 }),
    hookCheck: Type.Optional(HookCheckSchema),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const GritCheckRuleRegistryRecordV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataSchema],
  {
    ownerTool: Type.Literal("grit-check"),
    patternName: Type.String({ minLength: 1 }),
    scanRoots: Type.Array(PatternScanRootSchema, { minItems: 1 }),
    hookCheck: Type.Optional(HookCheckSchema),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const GritCheckRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: Type.Literal("grit-check"),
    patternName: Type.Optional(Type.String({ minLength: 1 })),
    scanRoots: Type.Array(PatternScanRootSchema, { minItems: 1 }),
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

const GeneratedZoneFileLayerRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
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

const ForbiddenFileNameFileLayerRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
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

const HostSurfaceFileLayerRuleRegistryRecordInputV1Schema = Type.Interface(
  [RequiredCommandRuleMetadataInputSchema],
  {
    ownerTool: Type.Literal("file-layer"),
    hostSurfaceGuard: Type.Literal(true),
  },
  { additionalProperties: false }
);

export const RuleRegistryRecordV1Schema = Type.Union([
  CommandRuleRegistryRecordV1Schema,
  StructureCheckRuleRegistryRecordV1Schema,
  NxRuleRegistryRecordV1Schema,
  GritCheckRuleRegistryRecordV1Schema,
  SourceCheckRuleRegistryRecordV1Schema,
  GeneratedZoneFileLayerRuleRegistryRecordV1Schema,
  ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema,
  HostSurfaceFileLayerRuleRegistryRecordV1Schema,
]);

export const RuleRegistryRecordInputV1Schema = Type.Union([
  CommandRuleRegistryRecordInputV1Schema,
  StructureCheckRuleRegistryRecordInputV1Schema,
  NxRuleRegistryRecordInputV1Schema,
  GritCheckRuleRegistryRecordInputV1Schema,
  SourceCheckRuleRegistryRecordInputV1Schema,
  GeneratedZoneFileLayerRuleRegistryRecordInputV1Schema,
  ForbiddenFileNameFileLayerRuleRegistryRecordInputV1Schema,
  HostSurfaceFileLayerRuleRegistryRecordInputV1Schema,
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

export const RuleSourceFactsSchema = Type.Pick(SourceCheckRuleRegistryRecordV1Schema, [
  "id",
  "lane",
  "message",
  "patternName",
  "pathCoverage",
  "scanRoots",
]);

export const RuleGritFactsSchema = Type.Pick(GritCheckRuleRegistryRecordV1Schema, [
  "id",
  "lane",
  "message",
  "patternName",
  "pathCoverage",
  "scanRoots",
]);

export const RuleManifestFactsSchema = Type.Interface(
  [Type.Pick(SourceCheckRuleRegistryRecordV1Schema, ["id", "lane", "patternName"])],
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

export const RuleStructureFactsSchema = Type.Pick(StructureCheckRuleRegistryRecordV1Schema, [
  "id",
  "lane",
  "message",
  "pathCoverage",
  "structureFile",
]);

export const RuleHookCheckFactsSchema = Type.Interface(
  [
    Type.Union([
      Type.Pick(SourceCheckRuleRegistryRecordV1Schema, ["id"]),
      Type.Pick(GritCheckRuleRegistryRecordV1Schema, ["id"]),
    ]),
  ],
  {
    hookCheck: HookCheckSchema,
  },
  { additionalProperties: false }
);

export type RuleRegistryRecordV1 = Static<typeof RuleRegistryRecordV1Schema>;
export type RuleRegistryRecordInputV1 = Static<typeof RuleRegistryRecordInputV1Schema>;
export type RuleRegistryDocumentV1 = Static<typeof RuleRegistryDocumentV1Schema>;
export type RuleRegistryIndexV1 = Static<typeof RuleRegistryIndexV1Schema>;
export type RuleSelectorFacts = Static<typeof RuleSelectorFactsSchema>;
export type RuleReportFacts = Static<typeof RuleReportFactsSchema>;
export type RuleBaselineFacts = Static<typeof RuleBaselineFactsSchema>;
export type RuleRoutingFacts = Static<typeof RuleRoutingFactsSchema>;
export type RuleGraphFacts = Static<typeof RuleGraphFactsSchema>;
export type RuleCommandExecutionFacts = Static<typeof RuleCommandExecutionFactsSchema>;
export type RuleSourceFacts = Static<typeof RuleSourceFactsSchema>;
export type RuleGritFacts = Static<typeof RuleGritFactsSchema>;
export type RuleManifestFacts = Static<typeof RuleManifestFactsSchema>;
export type RuleFileLayerFacts = Static<typeof RuleFileLayerFactsSchema>;
export type RuleStructureFacts = Static<typeof RuleStructureFactsSchema>;
export type RuleHookCheckFacts = Static<typeof RuleHookCheckFactsSchema>;
