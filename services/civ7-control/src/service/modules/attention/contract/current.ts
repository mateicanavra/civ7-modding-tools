import { Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const NullableComponentIdSchema = Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]);

const Civ7AttentionCurrentInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 100,
        description: "Maximum number of live notifications to inspect.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionSourceReadStatusSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("skipped-not-playable"),
  Type.Literal("skipped-unsupported"),
]);

const Civ7AttentionTurnCompletionSchema = Type.Object(
  {
    hasSentTurnComplete: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether turn completion has already been sent, or null when unreadable.",
    }),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the current turn can end, or null when unreadable.",
    }),
    firstReadyUnitId: NullableComponentIdSchema,
    blockerStatus: Type.Union(
      [Type.Literal("none"), Type.Literal("blocked"), Type.Literal("unknown")],
      {
        description: "Resolved status of the engine turn-completion blocker.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionBlockerSchema = Type.Object(
  {
    source: Type.Union(
      [
        Type.Literal("notification"),
        Type.Literal("ready-unit"),
        Type.Literal("ready-city"),
        Type.Literal("readiness"),
      ],
      {
        description: "Runtime authority that reported the blocker.",
      }
    ),
    kind: Type.String({
      description: "Semantic blocker category.",
    }),
    label: Type.String({
      description: "Human-readable blocker label.",
    }),
    summary: Type.Union([Type.String(), Type.Null()], {
      description: "Available blocker detail, or null when the source provided none.",
    }),
    componentId: NullableComponentIdSchema,
    evidence: Type.Array(Type.String(), {
      description: "Evidence labels supporting the blocker.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionDecisionSchema = Type.Object(
  {
    source: Type.Literal("notification", {
      description: "Runtime authority that reported the decision.",
    }),
    category: Type.String({
      description: "Semantic decision category.",
    }),
    summary: Type.Union([Type.String(), Type.Null()], {
      description: "Available decision summary, or null when the source provided none.",
    }),
    isEndTurnBlocking: Type.Boolean({
      description: "Whether this decision currently blocks turn completion.",
    }),
    operationFamily: Type.Optional(
      Type.String({
        description: "Validator operation family when exposed by the notification.",
      })
    ),
    operationType: Type.Optional(
      Type.String({
        description: "Validator operation type when exposed by the notification.",
      })
    ),
    requiredInputs: Type.Array(Type.String(), {
      description: "Names of inputs required to resolve the decision.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionReadyActorSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("unit"), Type.Literal("city")], {
      description: "Kind of actor awaiting a decision.",
    }),
    componentId: NullableComponentIdSchema,
    operationCount: Type.Integer({
      minimum: 0,
      description: "Number of legal operations reported for the actor.",
    }),
    summary: Type.String({
      description: "Human-readable actor summary.",
    }),
    evidence: Type.Array(Type.String(), {
      description: "Evidence labels supporting the ready-actor report.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("restore-readiness"),
        Type.Literal("resolve-blocker"),
        Type.Literal("act-ready-unit"),
        Type.Literal("act-ready-city"),
        Type.Literal("end-turn"),
        Type.Literal("observe"),
      ],
      {
        description: "Recommended semantic action.",
      }
    ),
    source: Type.Union(
      [
        Type.Literal("readiness"),
        Type.Literal("notification"),
        Type.Literal("ready-unit"),
        Type.Literal("ready-city"),
        Type.Literal("attention"),
      ],
      {
        description: "Authority that supports the recommendation.",
      }
    ),
    label: Type.String({
      description: "Human-readable recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean({
      description: "Whether the game is currently playable through the control service.",
    }),
    readiness: Type.String({
      description: "Current control-runtime readiness classification.",
    }),
    turn: Type.Union([Type.Number(), Type.Null()], {
      description: "Current turn number, or null when unreadable.",
    }),
    turnDate: Type.Union([Type.String(), Type.Null()], {
      description: "Current in-game date, or null when unreadable.",
    }),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the current turn can end, or null when unreadable.",
    }),
    sourceStatus: Type.Object(
      {
        playableStatus: Type.Literal("read", {
          description: "Read status for the playable-state source.",
        }),
        notifications: Civ7AttentionSourceReadStatusSchema,
        turnCompletion: Civ7AttentionSourceReadStatusSchema,
        readyUnit: Civ7AttentionSourceReadStatusSchema,
        readyCity: Civ7AttentionSourceReadStatusSchema,
      },
      {
        additionalProperties: false,
        description: "Per-source read coverage for the attention snapshot.",
      }
    ),
    turnCompletion: Civ7AttentionTurnCompletionSchema,
    summary: Type.Object(
      {
        blockerCount: Type.Integer({
          minimum: 0,
          description: "Number of blockers in the snapshot.",
        }),
        decisionCount: Type.Integer({
          minimum: 0,
          description: "Number of decisions in the snapshot.",
        }),
        readyActorCount: Type.Integer({
          minimum: 0,
          description: "Number of ready actors in the snapshot.",
        }),
        nextStepCount: Type.Integer({
          minimum: 0,
          description: "Number of recommended next steps.",
        }),
      },
      {
        additionalProperties: false,
        description: "Counts summarizing the attention snapshot.",
      }
    ),
    blockers: Type.Array(Civ7AttentionBlockerSchema, {
      description: "Current turn-flow blockers.",
    }),
    decisions: Type.Array(Civ7AttentionDecisionSchema, {
      description: "Current decisions requiring attention.",
    }),
    readyActors: Type.Array(Civ7AttentionReadyActorSchema, {
      description: "Units and cities currently awaiting action.",
    }),
    nextSteps: Type.Array(Civ7AttentionNextStepSchema, {
      description: "Recommended next actions derived from current evidence.",
    }),
  },
  { additionalProperties: false }
);

export const current = base
  .input(standard(Civ7AttentionCurrentInputSchema))
  .output(standard(Civ7AttentionCurrentResultSchema))
  .meta({
    family: "attention",
    procedureKey: "attention.current",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
