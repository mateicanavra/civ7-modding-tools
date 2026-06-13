import type { ContractProcedure } from "@orpc/contract";
import { type Static, Type } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const NullableComponentIdSchema = Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]);

const Civ7AttentionCurrentInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  { additionalProperties: false }
);
export type Civ7AttentionCurrentInput = Static<typeof Civ7AttentionCurrentInputSchema>;

export const Civ7AttentionSourceReadStatusSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("skipped-not-playable"),
  Type.Literal("skipped-unsupported"),
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
  { additionalProperties: false }
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
  { additionalProperties: false }
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
  { additionalProperties: false }
);

export const Civ7AttentionReadyActorSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("unit"), Type.Literal("city")]),
    componentId: NullableComponentIdSchema,
    operationCount: Type.Integer({ minimum: 0 }),
    summary: Type.String(),
    evidence: Type.Array(Type.String()),
  },
  { additionalProperties: false }
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
  { additionalProperties: false }
);

const Civ7AttentionCurrentResultSchema = Type.Object(
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
      { additionalProperties: false }
    ),
    turnCompletion: Civ7AttentionTurnCompletionSchema,
    summary: Type.Object(
      {
        blockerCount: Type.Integer({ minimum: 0 }),
        decisionCount: Type.Integer({ minimum: 0 }),
        readyActorCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    blockers: Type.Array(Civ7AttentionBlockerSchema),
    decisions: Type.Array(Civ7AttentionDecisionSchema),
    readyActors: Type.Array(Civ7AttentionReadyActorSchema),
    nextSteps: Type.Array(Civ7AttentionNextStepSchema),
  },
  { additionalProperties: false }
);
export type Civ7AttentionCurrentResult = Static<typeof Civ7AttentionCurrentResultSchema>;

const Civ7AttentionPrioritiesInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
    includeBattlefield: Type.Optional(Type.Boolean()),
    battlefieldRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    maxBattlefieldUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    readyUnitRadius: Type.Optional(Type.Integer({ minimum: 0, maximum: 16 })),
    maxReadyUnitOperations: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
  },
  { additionalProperties: false }
);
export type Civ7AttentionPrioritiesInput = Static<typeof Civ7AttentionPrioritiesInputSchema>;

const Civ7AttentionPrioritySourceStatusSchema = Type.Object(
  {
    playableStatus: Type.Literal("read"),
    notifications: Civ7AttentionSourceReadStatusSchema,
    turnCompletion: Civ7AttentionSourceReadStatusSchema,
    readyUnit: Civ7AttentionSourceReadStatusSchema,
    readyCity: Civ7AttentionSourceReadStatusSchema,
    battlefield: Type.Union([
      Type.Literal("read"),
      Type.Literal("skipped-disabled"),
      Type.Literal("skipped-no-origin"),
      Type.Literal("skipped-not-playable"),
      Type.Literal("skipped-unsupported"),
    ]),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityNextStepParametersSchema = Type.Object(
  {
    category: Type.Optional(Type.String()),
    operationFamily: Type.Optional(Type.String()),
    operationType: Type.Optional(Type.String()),
    componentId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    unitId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    location: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    hasSentTurnComplete: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("restore-readiness"),
      Type.Literal("inspect-decision"),
      Type.Literal("inspect-notification"),
      Type.Literal("inspect-progression"),
      Type.Literal("inspect-ready-unit"),
      Type.Literal("inspect-ready-city"),
      Type.Literal("inspect-battlefield-point"),
      Type.Literal("validate-unit-command"),
      Type.Literal("validate-unit-target"),
      Type.Literal("send-turn-complete"),
      Type.Literal("observe-turn-advance"),
      Type.Literal("end-turn"),
      Type.Literal("observe"),
    ]),
    source: Type.Union([
      Type.Literal("readiness"),
      Type.Literal("notification"),
      Type.Literal("ready-unit"),
      Type.Literal("ready-city"),
      Type.Literal("battlefield"),
      Type.Literal("attention.priorities"),
    ]),
    label: Type.String(),
    parameters: Civ7AttentionPriorityNextStepParametersSchema,
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityItemSchema = Type.Object(
  {
    priority: Type.Integer({ minimum: 0, maximum: 100 }),
    kind: Type.String(),
    summary: Type.String(),
    reason: Type.String(),
    blocking: Type.Boolean(),
    nextStep: Type.Union([Civ7AttentionPriorityNextStepSchema, Type.Null()]),
    evidenceLabels: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityReadyUnitSchema = Type.Object(
  {
    unitId: NullableComponentIdSchema,
    legalOperationCount: Type.Integer({ minimum: 0 }),
    promotionReadinessAvailable: Type.Boolean(),
    summary: Type.String(),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityReadyCitySchema = Type.Object(
  {
    cityId: NullableComponentIdSchema,
    legalOperationCount: Type.Integer({ minimum: 0 }),
    productionCandidateCount: Type.Integer({ minimum: 0 }),
    townFocusOptionCount: Type.Integer({ minimum: 0 }),
    populationPlacementAvailable: Type.Boolean(),
    summary: Type.String(),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityBattlefieldSchema = Type.Object(
  {
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema),
    radius: Type.Integer({ minimum: 1, maximum: 64 }),
    hiddenInfoPolicy: Type.String(),
    pointOfInterestCount: Type.Integer({ minimum: 0 }),
    observedOwnerCount: Type.Integer({ minimum: 0 }),
    pointsOfInterest: Type.Array(
      Type.Object(
        {
          kind: Type.String(),
          severity: Type.String(),
          summary: Type.String(),
          location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionPrioritiesResultSchema = Type.Object(
  {
    playable: Type.Boolean(),
    readiness: Type.String(),
    localPlayerId: Type.Union([Type.Integer({ minimum: -1 }), Type.Null()]),
    turn: Type.Union([Type.Number(), Type.Null()]),
    turnDate: Type.Union([Type.String(), Type.Null()]),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()]),
    sourceStatus: Civ7AttentionPrioritySourceStatusSchema,
    turnCompletion: Civ7AttentionTurnCompletionSchema,
    readyUnit: Type.Union([Civ7AttentionPriorityReadyUnitSchema, Type.Null()]),
    readyCity: Type.Union([Civ7AttentionPriorityReadyCitySchema, Type.Null()]),
    battlefield: Type.Union([Civ7AttentionPriorityBattlefieldSchema, Type.Null()]),
    summary: Type.Object(
      {
        priorityCount: Type.Integer({ minimum: 0 }),
        blockingPriorityCount: Type.Integer({ minimum: 0 }),
        decisionCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    priorities: Type.Array(Civ7AttentionPriorityItemSchema),
    nextSteps: Type.Array(Civ7AttentionPriorityNextStepSchema),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type Civ7AttentionPrioritiesResult = Static<typeof Civ7AttentionPrioritiesResultSchema>;

const Civ7AttentionCurrentInputStandardSchema = toStandardSchema(Civ7AttentionCurrentInputSchema);
const Civ7AttentionCurrentResultStandardSchema = toStandardSchema(Civ7AttentionCurrentResultSchema);
const Civ7AttentionPrioritiesInputStandardSchema = toStandardSchema(
  Civ7AttentionPrioritiesInputSchema
);
const Civ7AttentionPrioritiesResultStandardSchema = toStandardSchema(
  Civ7AttentionPrioritiesResultSchema
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

export type Civ7AttentionPrioritiesContract = ContractProcedure<
  typeof Civ7AttentionPrioritiesInputStandardSchema,
  typeof Civ7AttentionPrioritiesResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7AttentionPrioritiesContract: Civ7AttentionPrioritiesContract =
  civ7ControlOrpcContractBase
    .input(Civ7AttentionPrioritiesInputStandardSchema)
    .output(Civ7AttentionPrioritiesResultStandardSchema)
    .meta({
      family: "attention",
      procedureKey: "attention.priorities",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7AttentionContract = Readonly<{
  current: Civ7AttentionCurrentContract;
  priorities: Civ7AttentionPrioritiesContract;
}>;

export const Civ7AttentionContract: Civ7AttentionContract = {
  current: Civ7AttentionCurrentContract,
  priorities: Civ7AttentionPrioritiesContract,
};
