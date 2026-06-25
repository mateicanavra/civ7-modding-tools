import { type Static, Type } from "typebox";

export const HookNameSchema = Type.Union([Type.Literal("pre-commit"), Type.Literal("pre-push")]);
export type HookName = Static<typeof HookNameSchema>;

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
