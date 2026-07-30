import { Type } from "typebox";

import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const NullableComponentIdSchema = Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]);

const Civ7AttentionPrioritiesInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 100,
        description: "Maximum number of live notifications to inspect.",
      })
    ),
    includeBattlefield: Type.Optional(
      Type.Boolean({
        description: "Whether to include battlefield evidence around the ready unit.",
      })
    ),
    battlefieldRadius: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 16,
        description: "Plot radius for the optional battlefield scan.",
      })
    ),
    maxBattlefieldUnits: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 256,
        description: "Maximum number of units returned by the optional battlefield scan.",
      })
    ),
    readyUnitRadius: Type.Optional(
      Type.Integer({
        minimum: 0,
        maximum: 16,
        description: "Plot radius used while reading ready-unit context.",
      })
    ),
    maxReadyUnitOperations: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 256,
        description: "Maximum number of ready-unit operations to inspect.",
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

const Civ7AttentionPrioritySourceStatusSchema = Type.Object(
  {
    playableStatus: Type.Literal("read", {
      description: "Read status for the playable-state source.",
    }),
    notifications: Civ7AttentionSourceReadStatusSchema,
    turnCompletion: Civ7AttentionSourceReadStatusSchema,
    readyUnit: Civ7AttentionSourceReadStatusSchema,
    readyCity: Civ7AttentionSourceReadStatusSchema,
    battlefield: Type.Union(
      [
        Type.Literal("read"),
        Type.Literal("skipped-disabled"),
        Type.Literal("skipped-no-origin"),
        Type.Literal("skipped-not-playable"),
        Type.Literal("skipped-unsupported"),
      ],
      {
        description: "Read status for optional battlefield evidence.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityNextStepParametersSchema = Type.Object(
  {
    category: Type.Optional(
      Type.String({
        description: "Decision category relevant to the recommended action.",
      })
    ),
    operationFamily: Type.Optional(
      Type.String({
        description: "Validator operation family relevant to the recommended action.",
      })
    ),
    operationType: Type.Optional(
      Type.String({
        description: "Validator operation type relevant to the recommended action.",
      })
    ),
    componentId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    unitId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    location: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    hasSentTurnComplete: Type.Optional(
      Type.Boolean({
        description: "Whether turn completion was already sent when this action was derived.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
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
        Type.Literal("battlefield"),
        Type.Literal("attention.priorities"),
      ],
      {
        description: "Authority that supports the recommendation.",
      }
    ),
    label: Type.String({
      description: "Human-readable recommendation.",
    }),
    parameters: Civ7AttentionPriorityNextStepParametersSchema,
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityItemSchema = Type.Object(
  {
    priority: Type.Integer({
      minimum: 0,
      maximum: 100,
      description: "Relative urgency from zero to one hundred.",
    }),
    kind: Type.String({
      description: "Semantic priority category.",
    }),
    summary: Type.String({
      description: "Concise statement of the priority.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the assigned priority.",
    }),
    blocking: Type.Boolean({
      description: "Whether this priority blocks turn flow.",
    }),
    nextStep: Type.Union([Civ7AttentionPriorityNextStepSchema, Type.Null()], {
      description: "Recommended response, or null when observation alone is appropriate.",
    }),
    evidenceLabels: Type.Array(Type.String(), {
      description: "Evidence labels supporting the priority.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityReadyUnitSchema = Type.Object(
  {
    unitId: NullableComponentIdSchema,
    legalOperationCount: Type.Integer({
      minimum: 0,
      description: "Number of legal operations reported for the ready unit.",
    }),
    promotionReadinessAvailable: Type.Boolean({
      description: "Whether promotion readiness evidence is available for the unit.",
    }),
    summary: Type.String({
      description: "Human-readable ready-unit summary.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityReadyCitySchema = Type.Object(
  {
    cityId: NullableComponentIdSchema,
    legalOperationCount: Type.Integer({
      minimum: 0,
      description: "Number of legal operations reported for the ready city.",
    }),
    productionCandidateCount: Type.Integer({
      minimum: 0,
      description: "Number of available production candidates.",
    }),
    townFocusOptionCount: Type.Integer({
      minimum: 0,
      description: "Number of available town-focus options.",
    }),
    populationPlacementAvailable: Type.Boolean({
      description: "Whether a population-placement action is available.",
    }),
    summary: Type.String({
      description: "Human-readable ready-city summary.",
    }),
  },
  { additionalProperties: false }
);

const Civ7AttentionPriorityBattlefieldSchema = Type.Object(
  {
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema, {
      description: "Map origins covered by the battlefield scan.",
    }),
    radius: Type.Integer({
      minimum: 1,
      maximum: 64,
      description: "Plot radius covered around each battlefield origin.",
    }),
    hiddenInfoPolicy: Type.String({
      description: "Policy applied to hidden battlefield information.",
    }),
    pointOfInterestCount: Type.Integer({
      minimum: 0,
      description: "Number of battlefield points of interest.",
    }),
    observedOwnerCount: Type.Integer({
      minimum: 0,
      description: "Number of distinct owners observed in battlefield evidence.",
    }),
    pointsOfInterest: Type.Array(
      Type.Object(
        {
          kind: Type.String({
            description: "Semantic battlefield point category.",
          }),
          severity: Type.String({
            description: "Reported severity of the battlefield point.",
          }),
          summary: Type.String({
            description: "Human-readable battlefield observation.",
          }),
          location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
            description: "Map location of the observation, or null when not localized.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Battlefield observations relevant to current priorities.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7AttentionPrioritiesResultSchema = Type.Object(
  {
    playable: Type.Boolean({
      description: "Whether the game is currently playable through the control service.",
    }),
    readiness: Type.String({
      description: "Current control-runtime readiness classification.",
    }),
    localPlayerId: Type.Union([Type.Integer({ minimum: -1 }), Type.Null()], {
      description: "Local player identifier, or null when unavailable.",
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
    sourceStatus: Civ7AttentionPrioritySourceStatusSchema,
    turnCompletion: Civ7AttentionTurnCompletionSchema,
    readyUnit: Type.Union([Civ7AttentionPriorityReadyUnitSchema, Type.Null()], {
      description: "Ready-unit evidence, or null when no unit was resolved.",
    }),
    readyCity: Type.Union([Civ7AttentionPriorityReadyCitySchema, Type.Null()], {
      description: "Ready-city evidence, or null when no city was resolved.",
    }),
    battlefield: Type.Union([Civ7AttentionPriorityBattlefieldSchema, Type.Null()], {
      description: "Optional battlefield evidence, or null when the scan was skipped.",
    }),
    summary: Type.Object(
      {
        priorityCount: Type.Integer({
          minimum: 0,
          description: "Number of priorities in the result.",
        }),
        blockingPriorityCount: Type.Integer({
          minimum: 0,
          description: "Number of priorities that block turn flow.",
        }),
        decisionCount: Type.Integer({
          minimum: 0,
          description: "Number of live HUD decisions inspected.",
        }),
        nextStepCount: Type.Integer({
          minimum: 0,
          description: "Number of recommended next steps.",
        }),
      },
      {
        additionalProperties: false,
        description: "Counts summarizing the priority result.",
      }
    ),
    priorities: Type.Array(Civ7AttentionPriorityItemSchema, {
      description: "Prioritized current attention items.",
    }),
    nextSteps: Type.Array(Civ7AttentionPriorityNextStepSchema, {
      description: "Recommended next actions in priority order.",
    }),
    notes: Type.Array(Type.String(), {
      description: "Interpretation constraints for the priority evidence.",
    }),
  },
  { additionalProperties: false }
);

export const priorities = base
  .input(standard(Civ7AttentionPrioritiesInputSchema))
  .output(standard(Civ7AttentionPrioritiesResultSchema))
  .meta({
    family: "attention",
    procedureKey: "attention.priorities",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
