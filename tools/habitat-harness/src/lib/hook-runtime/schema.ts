import { type Static, Type } from "typebox";

export const HookNameSchema = Type.Union([
  Type.Literal("pre-commit"),
  Type.Literal("pre-push"),
]);
export type HookName = Static<typeof HookNameSchema>;

export const HookReportChannelSchema = Type.Union([
  Type.Literal("stdout"),
  Type.Literal("stderr"),
]);
export type HookReportChannel = Static<typeof HookReportChannelSchema>;

export const HookCommandPhaseSchema = Type.Union([
  Type.Literal("repo-state"),
  Type.Literal("resource-state"),
  Type.Literal("staged-paths"),
  Type.Literal("file-layer"),
  Type.Literal("partial-staging"),
  Type.Literal("biome-format"),
  Type.Literal("formatter-restage"),
  Type.Literal("biome-check"),
  Type.Literal("pattern-check"),
  Type.Literal("pre-push-base"),
  Type.Literal("pre-push-affected"),
]);
export type HookCommandPhase = Static<typeof HookCommandPhaseSchema>;

export const ResourceStateKindSchema = Type.Union([
  Type.Literal("clean"),
  Type.Literal("not-configured"),
  Type.Literal("uninitialized"),
  Type.Literal("locked"),
  Type.Literal("dirty-submodule"),
  Type.Literal("unstaged-gitlink"),
  Type.Literal("staged-gitlink"),
  Type.Literal("inspection-failed"),
]);
export type ResourceStateKind = Static<typeof ResourceStateKindSchema>;

const ResourceAllowedKindSchema = Type.Union([
  Type.Literal("clean"),
  Type.Literal("not-configured"),
  Type.Literal("staged-gitlink"),
]);

const ResourceRefusedKindSchema = Type.Union([
  Type.Literal("uninitialized"),
  Type.Literal("locked"),
  Type.Literal("dirty-submodule"),
  Type.Literal("unstaged-gitlink"),
  Type.Literal("inspection-failed"),
]);

export const ResourcePreCommitDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: ResourceAllowedKindSchema,
      commit: Type.Literal("allowed"),
      detail: Type.String({ minLength: 1 }),
      recovery: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: ResourceRefusedKindSchema,
      commit: Type.Literal("refused"),
      detail: Type.String({ minLength: 1 }),
      recovery: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);
export type ResourcePreCommitDecision = Static<typeof ResourcePreCommitDecisionSchema>;

export const ResourceStateFacadeSchema = Type.Object(
  {
    kind: ResourceStateKindSchema,
    allowPreCommit: Type.Boolean(),
    detail: Type.String({ minLength: 1 }),
    remediation: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type ResourceStateFacade = Static<typeof ResourceStateFacadeSchema>;

export const PreCommitOutcomeSchema = Type.Union([
  Type.Literal("started"),
  Type.Literal("resource-blocked"),
  Type.Literal("file-layer-failed"),
  Type.Literal("partial-staging-refused"),
  Type.Literal("biome-format-failed"),
  Type.Literal("formatter-restage-failed"),
  Type.Literal("biome-check-failed"),
  Type.Literal("command-failed"),
  Type.Literal("parse-failed"),
  Type.Literal("finding"),
  Type.Literal("pass"),
]);
export type PreCommitOutcome = Static<typeof PreCommitOutcomeSchema>;

export const PrePushOutcomeSchema = Type.Union([
  Type.Literal("started"),
  Type.Literal("base-refused"),
  Type.Literal("affected-failed"),
  Type.Literal("pass"),
]);
export type PrePushOutcome = Static<typeof PrePushOutcomeSchema>;

export const HookCommandRecordSchema = Type.Object(
  {
    phase: HookCommandPhaseSchema,
    argv: Type.Array(Type.String()),
    cwd: Type.String({ minLength: 1 }),
    env: Type.Optional(Type.Record(Type.String(), Type.String())),
    exitCode: Type.Number(),
    startedAtMs: Type.Number(),
    endedAtMs: Type.Number(),
    durationMs: Type.Number({ minimum: 0 }),
  },
  { additionalProperties: false }
);
export type HookCommandRecord = Static<typeof HookCommandRecordSchema>;

export const HookRepoSnapshotSchema = Type.Object(
  {
    branch: Type.Union([Type.String(), Type.Null()]),
    head: Type.Union([Type.String(), Type.Null()]),
    stagedPaths: Type.Array(Type.String()),
    unstagedPaths: Type.Array(Type.String()),
    resourceState: ResourceStateKindSchema,
  },
  { additionalProperties: false }
);
export type HookRepoSnapshot = Static<typeof HookRepoSnapshotSchema>;

const PreCommitTraceSchema = Type.Object(
  {
    startedAtMs: Type.Number(),
    endedAtMs: Type.Optional(Type.Number()),
    durationMs: Type.Optional(Type.Number({ minimum: 0 })),
    preState: Type.Optional(HookRepoSnapshotSchema),
    postState: Type.Optional(HookRepoSnapshotSchema),
    resourceState: ResourceStateKindSchema,
    stagedPaths: Type.Array(Type.String()),
    biomePaths: Type.Array(Type.String()),
    gritPaths: Type.Array(Type.String()),
    partialPaths: Type.Array(Type.String()),
    formatterTouchedPaths: Type.Array(Type.String()),
    restagedPaths: Type.Array(Type.String()),
    outcome: PreCommitOutcomeSchema,
    exitCode: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);
export type PreCommitTrace = Static<typeof PreCommitTraceSchema>;

const PrePushTraceSchema = Type.Object(
  {
    startedAtMs: Type.Number(),
    endedAtMs: Type.Optional(Type.Number()),
    durationMs: Type.Optional(Type.Number({ minimum: 0 })),
    preState: Type.Optional(HookRepoSnapshotSchema),
    postState: Type.Optional(HookRepoSnapshotSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
    baseSource: Type.Optional(
      Type.Union([
        Type.Literal("explicit"),
        Type.Literal("graphite-parent"),
        Type.Literal("merge-base"),
      ])
    ),
    outcome: PrePushOutcomeSchema,
    exitCode: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);
export type PrePushTrace = Static<typeof PrePushTraceSchema>;

export const HookTraceSchema = Type.Object(
  {
    commands: Type.Array(HookCommandRecordSchema),
    preCommit: Type.Optional(PreCommitTraceSchema),
    prePush: Type.Optional(PrePushTraceSchema),
  },
  { additionalProperties: false }
);
export type HookTrace = Static<typeof HookTraceSchema>;
