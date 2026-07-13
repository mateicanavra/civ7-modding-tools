import { type Static, Type } from "typebox";

const GraphTargetSchema = Type.Object(
  {
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const RulePlacementSchema = Type.Object(
  {
    niche: Type.String({ minLength: 1 }),
    blueprint: Type.String({ minLength: 1 }),
    category: Type.Union([
      Type.Literal("boundary"),
      Type.Literal("contract"),
      Type.Literal("execution"),
      Type.Literal("output"),
      Type.Literal("policy"),
      Type.Literal("quality"),
      Type.Literal("structure"),
    ]),
  },
  { additionalProperties: false }
);

const RuleOperationSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("check"),
      Type.Literal("fix"),
      Type.Literal("generate"),
      Type.Literal("migrate"),
    ]),
  },
  { additionalProperties: false }
);

export const GritDiagnosticAcquisitionPolicySchema = Type.Union([
  Type.Object({ kind: Type.Literal("check") }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("apply-dry-run") }, { additionalProperties: false }),
]);

const RuleFixAdmissionSchema = Type.Object(
  {
    kind: Type.Literal("preview-only"),
    pattern: Type.String({ minLength: 1 }),
    effects: Type.Array(
      Type.Union([
        Type.Literal("modify"),
        Type.Literal("create"),
        Type.Literal("rename"),
        Type.Literal("delete"),
      ]),
      { minItems: 1, maxItems: 4, uniqueItems: true }
    ),
  },
  { additionalProperties: false }
);

const GritRuleRunnerSchema = Type.Object(
  {
    name: Type.Literal("grit"),
    files: Type.Object(
      {
        pattern: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
    patternName: Type.String({ minLength: 1 }),
    diagnosticAcquisition: Type.Optional(GritDiagnosticAcquisitionPolicySchema),
    fix: Type.Optional(RuleFixAdmissionSchema),
  },
  { additionalProperties: false }
);

const GritProjectedRuleRunnerSchema = Type.Omit(GritRuleRunnerSchema, [
  "diagnosticAcquisition",
  "fix",
]);

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

const RuleProjectedRunnerSchema = Type.Union([
  GritProjectedRuleRunnerSchema,
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

const RuleSupportFilesSchema = Type.Object(
  {
    baseline: Type.Optional(Type.String({ minLength: 1 })),
    ruleIntroductionManifest: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const RuleManifestShape = {
  schemaVersion: Type.Literal(2),
  id: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  placement: RulePlacementSchema,
  operation: RuleOperationSchema,
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
  patternName: Type.Optional(Type.String({ minLength: 1 })),
  graphTarget: Type.Optional(GraphTargetSchema),
  generatedZone: Type.Optional(Type.String({ minLength: 1 })),
  forbiddenFileNames: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  hostSurfaceGuard: Type.Optional(Type.Literal(true)),
  supportFiles: Type.Optional(RuleSupportFilesSchema),
  runner: RuleRunnerSchema,
};

export const RuleRegistryRecordInputSchema = Type.Object(RuleManifestShape, {
  additionalProperties: false,
});

export const RuleRegistryRecordSchema = Type.Object(
  {
    ...RuleManifestShape,
    manifestFilePath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const RuleRegistryDocumentSchema = Type.Object(
  {
    $comment: Type.Optional(Type.String()),
    schemaVersion: Type.Literal(2),
    ownerRoots: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 }), {
      minProperties: 1,
    }),
    rules: Type.Array(RuleRegistryRecordSchema),
  },
  { additionalProperties: false }
);

export const RuleRegistryIndexSchema = Type.Object(
  {
    $comment: Type.Optional(Type.String()),
    schemaVersion: Type.Literal(2),
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
    runner: RuleProjectedRunnerSchema,
  },
  { additionalProperties: false }
);

export const RuleReportFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    runner: RuleProjectedRunnerSchema,
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
    ruleIntroductionManifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const RuleRoutingFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    runner: RuleProjectedRunnerSchema,
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

export const RuleDiagnosticFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    pathCoverage: RulePathCoverageSchema,
    scanRoots: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  },
  { additionalProperties: false }
);

export const RuleGritFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    pathCoverage: RulePathCoverageSchema,
    scanRoots: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
    runner: GritProjectedRuleRunnerSchema,
    patternName: Type.String({ minLength: 1 }),
    diagnosticAcquisition: GritDiagnosticAcquisitionPolicySchema,
  },
  { additionalProperties: false }
);

export const RuleFixFactsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
    message: Type.String({ minLength: 1 }),
    pathCoverage: RulePathCoverageSchema,
    scanRoots: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
    patternName: Type.String({ minLength: 1 }),
    fix: RuleFixAdmissionSchema,
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
export type RuleProjectedRunner = Static<typeof RuleProjectedRunnerSchema>;
export type GritDiagnosticAcquisitionPolicy = Static<typeof GritDiagnosticAcquisitionPolicySchema>;
export type RuleRunnerName = RuleRunner["name"];
export type RulePlacement = Static<typeof RulePlacementSchema>;
export type RuleSupportFiles = Static<typeof RuleSupportFilesSchema>;
export type RuleRegistryRecord = Static<typeof RuleRegistryRecordSchema>;
export type RuleRegistryRecordInput = Static<typeof RuleRegistryRecordInputSchema>;
export type RuleRegistryDocument = Static<typeof RuleRegistryDocumentSchema>;
export type RuleRegistryIndex = Static<typeof RuleRegistryIndexSchema>;
export type RuleSelectorFacts = Static<typeof RuleSelectorFactsSchema>;
export type RuleReportFacts = Static<typeof RuleReportFactsSchema>;
export type RuleBaselineFacts = Static<typeof RuleBaselineFactsSchema>;
export type RuleRoutingFacts = Static<typeof RuleRoutingFactsSchema>;
export type RuleGraphFacts = Static<typeof RuleGraphFactsSchema>;
export type RuleCommandExecutionFacts = Static<typeof RuleCommandExecutionFactsSchema>;
export type RuleDiagnosticFacts = Static<typeof RuleDiagnosticFactsSchema>;
export type RuleGritFacts = Static<typeof RuleGritFactsSchema>;
export type RuleFixFacts = Static<typeof RuleFixFactsSchema>;
export type RuleFileLayerFacts = Static<typeof RuleFileLayerFactsSchema>;
export type RuleStructureFacts = Static<typeof RuleStructureFactsSchema>;
export type RuleHookCheckFacts = Static<typeof RuleHookCheckFactsSchema>;
