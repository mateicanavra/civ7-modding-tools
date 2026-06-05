import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const NullableComponentIdSchema = Type.Union([
  Civ7ControlOrpcComponentIdSchema,
  Type.Null(),
]);

export const Civ7AttentionCurrentInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  { additionalProperties: false },
);
export type Civ7AttentionCurrentInput = Static<
  typeof Civ7AttentionCurrentInputSchema
>;

export const Civ7AttentionSourceReadStatusSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("skipped-not-playable"),
]);

export const Civ7AttentionTurnCompletionSchema = Type.Object(
  {
    hasSentTurnComplete: Type.Union([Type.Boolean(), Type.Null()]),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()]),
    firstReadyUnitId: NullableComponentIdSchema,
    blockerStatus: Type.Union([
      Type.Literal("none"),
      Type.Literal("blocked"),
      Type.Literal("unknown"),
    ]),
  },
  { additionalProperties: false },
);

export const Civ7AttentionBlockerSchema = Type.Object(
  {
    source: Type.Union([
      Type.Literal("notification"),
      Type.Literal("ready-unit"),
      Type.Literal("ready-city"),
      Type.Literal("readiness"),
    ]),
    kind: Type.String(),
    label: Type.String(),
    summary: Type.Union([Type.String(), Type.Null()]),
    componentId: NullableComponentIdSchema,
    evidence: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export const Civ7AttentionDecisionSchema = Type.Object(
  {
    source: Type.Literal("notification"),
    category: Type.String(),
    summary: Type.Union([Type.String(), Type.Null()]),
    isEndTurnBlocking: Type.Boolean(),
    operationFamily: Type.Optional(Type.String()),
    operationType: Type.Optional(Type.String()),
    requiredInputs: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export const Civ7AttentionReadyActorSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("unit"), Type.Literal("city")]),
    componentId: NullableComponentIdSchema,
    operationCount: Type.Integer({ minimum: 0 }),
    summary: Type.String(),
    evidence: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export const Civ7AttentionNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("restore-readiness"),
      Type.Literal("resolve-blocker"),
      Type.Literal("act-ready-unit"),
      Type.Literal("act-ready-city"),
      Type.Literal("end-turn"),
      Type.Literal("observe"),
    ]),
    source: Type.Union([
      Type.Literal("readiness"),
      Type.Literal("notification"),
      Type.Literal("ready-unit"),
      Type.Literal("ready-city"),
      Type.Literal("attention"),
    ]),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7AttentionCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean(),
    readiness: Type.String(),
    turn: Type.Union([Type.Number(), Type.Null()]),
    turnDate: Type.Union([Type.String(), Type.Null()]),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()]),
    sourceStatus: Type.Object(
      {
        playableStatus: Type.Literal("read"),
        notifications: Civ7AttentionSourceReadStatusSchema,
        turnCompletion: Civ7AttentionSourceReadStatusSchema,
        readyUnit: Civ7AttentionSourceReadStatusSchema,
        readyCity: Civ7AttentionSourceReadStatusSchema,
      },
      { additionalProperties: false },
    ),
    turnCompletion: Civ7AttentionTurnCompletionSchema,
    summary: Type.Object(
      {
        blockerCount: Type.Integer({ minimum: 0 }),
        decisionCount: Type.Integer({ minimum: 0 }),
        readyActorCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    blockers: Type.Array(Civ7AttentionBlockerSchema),
    decisions: Type.Array(Civ7AttentionDecisionSchema),
    readyActors: Type.Array(Civ7AttentionReadyActorSchema),
    nextSteps: Type.Array(Civ7AttentionNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7AttentionCurrentResult = Static<
  typeof Civ7AttentionCurrentResultSchema
>;

export const Civ7AttentionCurrentInputStandardSchema = toStandardSchema(
  Civ7AttentionCurrentInputSchema,
);
export const Civ7AttentionCurrentResultStandardSchema = toStandardSchema(
  Civ7AttentionCurrentResultSchema,
);

export type Civ7AttentionCurrentContract = ContractProcedure<
  typeof Civ7AttentionCurrentInputStandardSchema,
  typeof Civ7AttentionCurrentResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7AttentionCurrentContract: Civ7AttentionCurrentContract =
  civ7ControlOrpcContractBase
    .input(Civ7AttentionCurrentInputStandardSchema)
    .output(Civ7AttentionCurrentResultStandardSchema)
    .meta({
      family: "attention",
      procedureKey: "attention.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7AttentionContract = Readonly<{
  current: Civ7AttentionCurrentContract;
}>;

export const Civ7AttentionContract: Civ7AttentionContract = {
  current: Civ7AttentionCurrentContract,
};
