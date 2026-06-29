import { type Static, Type } from "typebox";

const GraphTargetSchema = Type.Object(
  {
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const RulePlacementV1Schema = Type.Object(
  {
    niche: Type.String({ minLength: 1 }),
    blueprint: Type.String({ minLength: 1 }),
    category: Type.String({ minLength: 1 }),
    artifactKind: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const GritRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("grit"),
    files: Type.Object(
      {
        pattern: Type.String({ minLength: 1 }),
        applyPattern: Type.Optional(Type.String({ minLength: 1 })),
      },
      { additionalProperties: false }
    ),
    patternName: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const HabitatStructureRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("habitat"),
    mode: Type.Literal("structure"),
    files: Type.Object(
      {
        structure: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

const HabitatScriptRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("habitat"),
    mode: Type.Literal("script"),
    files: Type.Object(
      {
        script: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
    runtime: Type.Union([Type.Literal("bun"), Type.Literal("node"), Type.Literal("bash")]),
  },
  { additionalProperties: false }
);

const HabitatFileLayerRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("habitat"),
    mode: Type.Literal("file-layer"),
    guard: Type.Union([
      Type.Literal("generated-zone"),
      Type.Literal("forbidden-file-name"),
      Type.Literal("host-surface"),
    ]),
  },
  { additionalProperties: false }
);

const NxRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("nx"),
    target: GraphTargetSchema,
  },
  { additionalProperties: false }
);

const RuleRunnerSchema = Type.Union([
  GritRuleRunnerSchema,
  HabitatStructureRuleRunnerSchema,
  HabitatScriptRuleRunnerSchema,
  HabitatFileLayerRuleRunnerSchema,
  NxRuleRunnerSchema,
]);

const RulePathCoverageSchema = Type.Array(
  Type.Union([
    Type.Object(
      {
        kind: Type.Literal("exact-path"),
        patterns: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
      },
      { additionalProperties: false }
    ),
    Type.Object({ kind: Type.Literal("project-owner") }, { additionalProperties: false }),
    Type.Object({ kind: Type.Literal("workspace-gate") }, { additionalProperties: false }),
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

const RuleArtifactRefsV1Schema = Type.Object(
  {
    baseline: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const RuleManifestShape = {
  schemaVersion: Type.Literal(1),
  id: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  placement: RulePlacementV1Schema,
  ownerProject: Type.String({ minLength: 1 }),
  lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
  forbids: Type.String({ minLength: 1 }),
  why: Type.String({ minLength: 1 }),
  remediate: Type.Union([Type.String(), Type.Null()]),
  message: Type.String({ minLength: 1 }),
  exceptionPath: Type.Optional(Type.String({ minLength: 1 })),
  pathCoverage: RulePathCoverageSchema,
  scanRoots: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  hookCheck: Type.Optional(Type.Literal(true)),
  manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  patternName: Type.Optional(Type.String({ minLength: 1 })),
  graphTarget: Type.Optional(GraphTargetSchema),
  generatedZone: Type.Optional(Type.String({ minLength: 1 })),
  forbiddenFileNames: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  hostSurfaceGuard: Type.Optional(Type.Literal(true)),
  artifacts: Type.Optional(RuleArtifactRefsV1Schema),
  runner: RuleRunnerSchema,
};

export const RuleRegistryRecordInputV1Schema = Type.Object(RuleManifestShape, {
  additionalProperties: false,
});

export const RuleRegistryRecordV1Schema = Type.Object(
  {
    ...RuleManifestShape,
    manifestFilePath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

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

export const RuleSelectorFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    runner: RuleRunnerSchema,
  },
  { additionalProperties: false }
);

export const RuleReportFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    runner: RuleRunnerSchema,
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    remediate: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false }
);

export const RuleBaselineFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    exceptionPath: Type.Optional(Type.String({ minLength: 1 })),
    baselinePath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const RuleRoutingFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    runner: RuleRunnerSchema,
    ownerProject: Type.String({ minLength: 1 }),
    pathCoverage: RulePathCoverageSchema,
  },
  { additionalProperties: false }
);

export const RuleGraphFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    ownerRoot: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    alias: Type.Union([
      Type.Object({ kind: Type.Literal("direct-rule-check") }, { additionalProperties: false }),
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

export const RuleCommandExecutionFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    runner: HabitatScriptRuleRunnerSchema,
  },
  { additionalProperties: false }
);

export const RuleSourceFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    runner: GritRuleRunnerSchema,
    patternName: Type.String({ minLength: 1 }),
    pathCoverage: RulePathCoverageSchema,
    scanRoots: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  },
  { additionalProperties: false }
);

export const RuleGritFactsSchema = RuleSourceFactsSchema;

export const RuleManifestFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    patternName: Type.String({ minLength: 1 }),
    manifestPath: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const RuleFileLayerFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    runner: HabitatFileLayerRuleRunnerSchema,
    generatedZone: Type.Optional(Type.String({ minLength: 1 })),
    forbiddenFileNames: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
    hostSurfaceGuard: Type.Optional(Type.Literal(true)),
  },
  { additionalProperties: false }
);

export const RuleStructureFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    runner: HabitatStructureRuleRunnerSchema,
    pathCoverage: RulePathCoverageSchema,
  },
  { additionalProperties: false }
);

export const RuleHookCheckFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    hookCheck: Type.Literal(true),
  },
  { additionalProperties: false }
);

export type RuleRunner = Static<typeof RuleRunnerSchema>;
export type RuleRunnerName = RuleRunner["name"];
export type RulePlacementV1 = Static<typeof RulePlacementV1Schema>;
export type RuleArtifactRefsV1 = Static<typeof RuleArtifactRefsV1Schema>;
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
