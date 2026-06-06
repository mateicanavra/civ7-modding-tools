import { ORPCError } from "@orpc/server";
import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

import { createCiv7ControlOrpcServerClient } from "../client";
import { Civ7ControlOrpcContract } from "../contract";
import type { Civ7ControlOrpcContext } from "../context";
import { Civ7ControlOrpcCorrelationIdSchema } from "../model/correlation";
import {
  typeboxInputSchemaFromContractProcedure,
  typeboxOutputSchemaFromContractProcedure,
} from "../typebox-standard-schema";

const Civ7ReadinessCurrentInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.readiness.current,
);
const Civ7ReadinessCurrentResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.readiness.current,
);
const Civ7AttentionCurrentInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.attention.current,
);
const Civ7AttentionCurrentResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.attention.current,
);
const Civ7StrategyFrontSummaryInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.strategy.frontSummary,
);
const Civ7StrategyFrontSummaryResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.strategy.frontSummary,
);
const Civ7WorldCurrentInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.world.current,
);
const Civ7WorldCurrentResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.world.current,
);
const Civ7NotificationDismissInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.notifications.dismiss.request,
);
const Civ7NotificationDismissalResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.notifications.dismiss.request,
  );
const Civ7TurnCompletionInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.turn.complete.request,
);
const Civ7TurnCompletionResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.turn.complete.request,
);
const Civ7CityProductionChoiceInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.production.choice.request,
  );
const Civ7CityProductionChoiceResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.production.choice.request,
  );
const Civ7CityPopulationPlacementInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.population.place.request,
  );
const Civ7CityPopulationPlacementResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.population.place.request,
  );
const Civ7CityTownFocusChangeInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.townFocus.change.request,
  );
const Civ7CityTownFocusChangeResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.townFocus.change.request,
  );
const Civ7CityTownFocusReviewInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.townFocus.review.request,
  );
const Civ7CityTownFocusReviewResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.townFocus.review.request,
  );
const Civ7NarrativeChoiceInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.narrative.choice.request,
);
const Civ7NarrativeChoiceResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.narrative.choice.request,
);
const Civ7DiplomacyResponseInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.diplomacy.response.request,
);
const Civ7DiplomacyResponseResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.diplomacy.response.request,
  );
const Civ7FirstMeetResponseInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.diplomacy.firstMeet.response.request,
  );
const Civ7FirstMeetResponseResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.diplomacy.firstMeet.response.request,
  );
const Civ7GovernmentChoiceInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.government.choice.request,
);
const Civ7GovernmentChoiceResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.government.choice.request,
  );
const Civ7GovernmentCelebrationChoiceInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.government.celebration.choice.request,
  );
const Civ7GovernmentCelebrationChoiceResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.government.celebration.choice.request,
  );
const Civ7UnitTargetActionInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.unit.target.action.request,
);
const Civ7UnitTargetActionResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.unit.target.action.request,
  );
const Civ7UnitUpgradeInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.unit.upgrade.request,
);
const Civ7UnitUpgradeResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.unit.upgrade.request,
);
const Civ7UnitResettleInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.unit.resettle.request,
);
const Civ7UnitResettleResultSchema = typeboxOutputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.unit.resettle.request,
);
const Civ7ProgressionChoiceInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.progression.technology.choice.request,
);
const Civ7ProgressionTargetInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.progression.technology.target.request,
);
const Civ7ProgressionTechnologyChoiceResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.technology.choice.request,
  );
const Civ7ProgressionCultureChoiceResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.culture.choice.request,
  );
const Civ7ProgressionTechnologyTargetResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.technology.target.request,
  );
const Civ7ProgressionCultureTargetResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.culture.target.request,
  );
const Civ7ProgressionAttributePurchaseInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.attribute.purchase.request,
  );
const Civ7ProgressionAttributePurchaseResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.attribute.purchase.request,
  );
const Civ7ProgressionPlayerReviewInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.attribute.review.request,
  );
const Civ7ProgressionAttributeReviewResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.attribute.review.request,
  );
const Civ7ProgressionTraditionChangeInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.tradition.change.request,
  );
const Civ7ProgressionTraditionChangeResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.tradition.change.request,
  );
const Civ7ProgressionTraditionReviewResultSchema =
  typeboxOutputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.progression.tradition.review.request,
  );

export const Civ7ControllerBridgeMutationProofSchema = Type.Object(
  {
    lifecycle: Type.Object(
      {
        source: Type.Literal("controller-runtime"),
        status: Type.Literal("game-controller-ready"),
      },
      { additionalProperties: false },
    ),
    localPlayer: Type.Object(
      {
        source: Type.Literal("GameContext.localPlayerID"),
        playerId: Type.Integer({ minimum: 0, maximum: 255 }),
      },
      { additionalProperties: false },
    ),
    hotseat: Type.Object(
      {
        source: Type.Literal("controller-runtime"),
        status: Type.Literal("single-local-player"),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeMutationProof = Static<
  typeof Civ7ControllerBridgeMutationProofSchema
>;

export const Civ7ControllerBridgeReadinessCurrentRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("readiness.current"),
    input: Civ7ReadinessCurrentInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeReadinessCurrentRequest = Static<
  typeof Civ7ControllerBridgeReadinessCurrentRequestSchema
>;

export const Civ7ControllerBridgeAttentionCurrentRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("attention.current"),
    input: Civ7AttentionCurrentInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeAttentionCurrentRequest = Static<
  typeof Civ7ControllerBridgeAttentionCurrentRequestSchema
>;

export const Civ7ControllerBridgeStrategyFrontSummaryRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("strategy.frontSummary"),
      input: Civ7StrategyFrontSummaryInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeStrategyFrontSummaryRequest = Static<
  typeof Civ7ControllerBridgeStrategyFrontSummaryRequestSchema
>;

export const Civ7ControllerBridgeWorldCurrentRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("world.current"),
    input: Civ7WorldCurrentInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeWorldCurrentRequest = Static<
  typeof Civ7ControllerBridgeWorldCurrentRequestSchema
>;

export const Civ7ControllerBridgeNotificationDismissRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("notifications.dismiss.request"),
    input: Civ7NotificationDismissInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeNotificationDismissRequest = Static<
  typeof Civ7ControllerBridgeNotificationDismissRequestSchema
>;

export const Civ7ControllerBridgeTurnCompleteRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("turn.complete.request"),
    input: Civ7TurnCompletionInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeTurnCompleteRequest = Static<
  typeof Civ7ControllerBridgeTurnCompleteRequestSchema
>;

export const Civ7ControllerBridgeCityProductionChoiceRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.production.choice.request"),
    input: Civ7CityProductionChoiceInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeCityProductionChoiceRequest = Static<
  typeof Civ7ControllerBridgeCityProductionChoiceRequestSchema
>;

export const Civ7ControllerBridgeCityPopulationPlacementRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("city.population.place.request"),
      input: Civ7CityPopulationPlacementInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityPopulationPlacementRequest = Static<
  typeof Civ7ControllerBridgeCityPopulationPlacementRequestSchema
>;

export const Civ7ControllerBridgeCityTownFocusChangeRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.townFocus.change.request"),
    input: Civ7CityTownFocusChangeInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeCityTownFocusChangeRequest =
  Static<typeof Civ7ControllerBridgeCityTownFocusChangeRequestSchema>;

export const Civ7ControllerBridgeCityTownFocusReviewRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.townFocus.review.request"),
    input: Civ7CityTownFocusReviewInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeCityTownFocusReviewRequest =
  Static<typeof Civ7ControllerBridgeCityTownFocusReviewRequestSchema>;

export const Civ7ControllerBridgeNarrativeChoiceRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("narrative.choice.request"),
    input: Civ7NarrativeChoiceInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeNarrativeChoiceRequest = Static<
  typeof Civ7ControllerBridgeNarrativeChoiceRequestSchema
>;

export const Civ7ControllerBridgeDiplomacyResponseRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("diplomacy.response.request"),
    input: Civ7DiplomacyResponseInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeDiplomacyResponseRequest = Static<
  typeof Civ7ControllerBridgeDiplomacyResponseRequestSchema
>;

export const Civ7ControllerBridgeFirstMeetResponseRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("diplomacy.firstMeet.response.request"),
    input: Civ7FirstMeetResponseInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeFirstMeetResponseRequest = Static<
  typeof Civ7ControllerBridgeFirstMeetResponseRequestSchema
>;

export const Civ7ControllerBridgeGovernmentChoiceRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("government.choice.request"),
    input: Civ7GovernmentChoiceInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeGovernmentChoiceRequest = Static<
  typeof Civ7ControllerBridgeGovernmentChoiceRequestSchema
>;

export const Civ7ControllerBridgeGovernmentCelebrationChoiceRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("government.celebration.choice.request"),
      input: Civ7GovernmentCelebrationChoiceInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeGovernmentCelebrationChoiceRequest = Static<
  typeof Civ7ControllerBridgeGovernmentCelebrationChoiceRequestSchema
>;

export const Civ7ControllerBridgeUnitTargetActionRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.target.action.request"),
    input: Civ7UnitTargetActionInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitTargetActionRequest = Static<
  typeof Civ7ControllerBridgeUnitTargetActionRequestSchema
>;

export const Civ7ControllerBridgeUnitUpgradeRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.upgrade.request"),
    input: Civ7UnitUpgradeInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitUpgradeRequest = Static<
  typeof Civ7ControllerBridgeUnitUpgradeRequestSchema
>;

export const Civ7ControllerBridgeUnitResettleRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.resettle.request"),
    input: Civ7UnitResettleInputSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitResettleRequest = Static<
  typeof Civ7ControllerBridgeUnitResettleRequestSchema
>;

export const Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.technology.choice.request"),
      input: Civ7ProgressionChoiceInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTechnologyChoiceRequest = Static<
  typeof Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema
>;

export const Civ7ControllerBridgeProgressionCultureChoiceRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.culture.choice.request"),
      input: Civ7ProgressionChoiceInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionCultureChoiceRequest = Static<
  typeof Civ7ControllerBridgeProgressionCultureChoiceRequestSchema
>;

export const Civ7ControllerBridgeProgressionTechnologyTargetRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.technology.target.request"),
      input: Civ7ProgressionTargetInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTechnologyTargetRequest = Static<
  typeof Civ7ControllerBridgeProgressionTechnologyTargetRequestSchema
>;

export const Civ7ControllerBridgeProgressionCultureTargetRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.culture.target.request"),
      input: Civ7ProgressionTargetInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionCultureTargetRequest = Static<
  typeof Civ7ControllerBridgeProgressionCultureTargetRequestSchema
>;

export const Civ7ControllerBridgeProgressionAttributePurchaseRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.attribute.purchase.request"),
      input: Civ7ProgressionAttributePurchaseInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionAttributePurchaseRequest = Static<
  typeof Civ7ControllerBridgeProgressionAttributePurchaseRequestSchema
>;

export const Civ7ControllerBridgeProgressionAttributeReviewRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.attribute.review.request"),
      input: Civ7ProgressionPlayerReviewInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionAttributeReviewRequest = Static<
  typeof Civ7ControllerBridgeProgressionAttributeReviewRequestSchema
>;

export const Civ7ControllerBridgeProgressionTraditionChangeRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.tradition.change.request"),
      input: Civ7ProgressionTraditionChangeInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTraditionChangeRequest = Static<
  typeof Civ7ControllerBridgeProgressionTraditionChangeRequestSchema
>;

export const Civ7ControllerBridgeProgressionTraditionReviewRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.tradition.review.request"),
      input: Civ7ProgressionPlayerReviewInputSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTraditionReviewRequest = Static<
  typeof Civ7ControllerBridgeProgressionTraditionReviewRequestSchema
>;

export const Civ7ControllerBridgeRequestSchema = Type.Union([
  Civ7ControllerBridgeReadinessCurrentRequestSchema,
  Civ7ControllerBridgeAttentionCurrentRequestSchema,
  Civ7ControllerBridgeStrategyFrontSummaryRequestSchema,
  Civ7ControllerBridgeWorldCurrentRequestSchema,
  Civ7ControllerBridgeNotificationDismissRequestSchema,
  Civ7ControllerBridgeTurnCompleteRequestSchema,
  Civ7ControllerBridgeCityProductionChoiceRequestSchema,
  Civ7ControllerBridgeCityPopulationPlacementRequestSchema,
  Civ7ControllerBridgeCityTownFocusChangeRequestSchema,
  Civ7ControllerBridgeCityTownFocusReviewRequestSchema,
  Civ7ControllerBridgeNarrativeChoiceRequestSchema,
  Civ7ControllerBridgeDiplomacyResponseRequestSchema,
  Civ7ControllerBridgeFirstMeetResponseRequestSchema,
  Civ7ControllerBridgeGovernmentChoiceRequestSchema,
  Civ7ControllerBridgeGovernmentCelebrationChoiceRequestSchema,
  Civ7ControllerBridgeUnitTargetActionRequestSchema,
  Civ7ControllerBridgeUnitUpgradeRequestSchema,
  Civ7ControllerBridgeUnitResettleRequestSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema,
  Civ7ControllerBridgeProgressionCultureChoiceRequestSchema,
  Civ7ControllerBridgeProgressionTechnologyTargetRequestSchema,
  Civ7ControllerBridgeProgressionCultureTargetRequestSchema,
  Civ7ControllerBridgeProgressionAttributePurchaseRequestSchema,
  Civ7ControllerBridgeProgressionAttributeReviewRequestSchema,
  Civ7ControllerBridgeProgressionTraditionChangeRequestSchema,
  Civ7ControllerBridgeProgressionTraditionReviewRequestSchema,
]);
export type Civ7ControllerBridgeRequest =
  | Civ7ControllerBridgeReadinessCurrentRequest
  | Civ7ControllerBridgeAttentionCurrentRequest
  | Civ7ControllerBridgeStrategyFrontSummaryRequest
  | Civ7ControllerBridgeWorldCurrentRequest
  | Civ7ControllerBridgeNotificationDismissRequest
  | Civ7ControllerBridgeTurnCompleteRequest
  | Civ7ControllerBridgeCityProductionChoiceRequest
  | Civ7ControllerBridgeCityPopulationPlacementRequest
  | Civ7ControllerBridgeCityTownFocusChangeRequest
  | Civ7ControllerBridgeCityTownFocusReviewRequest
  | Civ7ControllerBridgeNarrativeChoiceRequest
  | Civ7ControllerBridgeDiplomacyResponseRequest
  | Civ7ControllerBridgeFirstMeetResponseRequest
  | Civ7ControllerBridgeGovernmentChoiceRequest
  | Civ7ControllerBridgeGovernmentCelebrationChoiceRequest
  | Civ7ControllerBridgeUnitTargetActionRequest
  | Civ7ControllerBridgeUnitUpgradeRequest
  | Civ7ControllerBridgeUnitResettleRequest
  | Civ7ControllerBridgeProgressionTechnologyChoiceRequest
  | Civ7ControllerBridgeProgressionCultureChoiceRequest
  | Civ7ControllerBridgeProgressionTechnologyTargetRequest
  | Civ7ControllerBridgeProgressionCultureTargetRequest
  | Civ7ControllerBridgeProgressionAttributePurchaseRequest
  | Civ7ControllerBridgeProgressionAttributeReviewRequest
  | Civ7ControllerBridgeProgressionTraditionChangeRequest
  | Civ7ControllerBridgeProgressionTraditionReviewRequest;

export const Civ7ControllerBridgeErrorSchema = Type.Object(
  {
    code: Type.String({ minLength: 1 }),
    message: Type.String({ minLength: 1 }),
    reason: Type.Union([
      Type.Literal("invalid-envelope"),
      Type.Literal("procedure-not-allowed"),
      Type.Literal("procedure-not-supported"),
      Type.Literal("procedure-failed"),
    ]),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeError = Static<
  typeof Civ7ControllerBridgeErrorSchema
>;

export const Civ7ControllerBridgeReadinessCurrentSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("readiness.current"),
      output: Civ7ReadinessCurrentResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeReadinessCurrentSuccessResponse = Static<
  typeof Civ7ControllerBridgeReadinessCurrentSuccessResponseSchema
>;

export const Civ7ControllerBridgeAttentionCurrentSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("attention.current"),
      output: Civ7AttentionCurrentResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeAttentionCurrentSuccessResponse = Static<
  typeof Civ7ControllerBridgeAttentionCurrentSuccessResponseSchema
>;

export const Civ7ControllerBridgeStrategyFrontSummarySuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("strategy.frontSummary"),
      output: Civ7StrategyFrontSummaryResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeStrategyFrontSummarySuccessResponse = Static<
  typeof Civ7ControllerBridgeStrategyFrontSummarySuccessResponseSchema
>;

export const Civ7ControllerBridgeWorldCurrentSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("world.current"),
      output: Civ7WorldCurrentResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeWorldCurrentSuccessResponse = Static<
  typeof Civ7ControllerBridgeWorldCurrentSuccessResponseSchema
>;

export const Civ7ControllerBridgeNotificationDismissSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("notifications.dismiss.request"),
      output: Civ7NotificationDismissalResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeNotificationDismissSuccessResponse = Static<
  typeof Civ7ControllerBridgeNotificationDismissSuccessResponseSchema
>;

export const Civ7ControllerBridgeTurnCompleteSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("turn.complete.request"),
      output: Civ7TurnCompletionResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeTurnCompleteSuccessResponse = Static<
  typeof Civ7ControllerBridgeTurnCompleteSuccessResponseSchema
>;

export const Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("city.production.choice.request"),
      output: Civ7CityProductionChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityProductionChoiceSuccessResponse = Static<
  typeof Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema
>;

export const Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("city.population.place.request"),
      output: Civ7CityPopulationPlacementResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityPopulationPlacementSuccessResponse = Static<
  typeof Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema
>;

export const Civ7ControllerBridgeCityTownFocusChangeSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("city.townFocus.change.request"),
      output: Civ7CityTownFocusChangeResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityTownFocusChangeSuccessResponse = Static<
  typeof Civ7ControllerBridgeCityTownFocusChangeSuccessResponseSchema
>;

export const Civ7ControllerBridgeCityTownFocusReviewSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("city.townFocus.review.request"),
      output: Civ7CityTownFocusReviewResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityTownFocusReviewSuccessResponse = Static<
  typeof Civ7ControllerBridgeCityTownFocusReviewSuccessResponseSchema
>;

export const Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("narrative.choice.request"),
      output: Civ7NarrativeChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeNarrativeChoiceSuccessResponse = Static<
  typeof Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema
>;

export const Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("diplomacy.response.request"),
      output: Civ7DiplomacyResponseResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeDiplomacyResponseSuccessResponse = Static<
  typeof Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema
>;

export const Civ7ControllerBridgeFirstMeetResponseSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("diplomacy.firstMeet.response.request"),
      output: Civ7FirstMeetResponseResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeFirstMeetResponseSuccessResponse = Static<
  typeof Civ7ControllerBridgeFirstMeetResponseSuccessResponseSchema
>;

export const Civ7ControllerBridgeGovernmentChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("government.choice.request"),
      output: Civ7GovernmentChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeGovernmentChoiceSuccessResponse = Static<
  typeof Civ7ControllerBridgeGovernmentChoiceSuccessResponseSchema
>;

export const Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("government.celebration.choice.request"),
      output: Civ7GovernmentCelebrationChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponseSchema
  >;

export const Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("unit.target.action.request"),
      output: Civ7UnitTargetActionResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeUnitTargetActionSuccessResponse = Static<
  typeof Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema
>;

export const Civ7ControllerBridgeUnitUpgradeSuccessResponseSchema = Type.Object(
  {
    ok: Type.Literal(true),
    procedureKey: Type.Literal("unit.upgrade.request"),
    output: Civ7UnitUpgradeResultSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitUpgradeSuccessResponse = Static<
  typeof Civ7ControllerBridgeUnitUpgradeSuccessResponseSchema
>;

export const Civ7ControllerBridgeUnitResettleSuccessResponseSchema = Type.Object(
  {
    ok: Type.Literal(true),
    procedureKey: Type.Literal("unit.resettle.request"),
    output: Civ7UnitResettleResultSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitResettleSuccessResponse = Static<
  typeof Civ7ControllerBridgeUnitResettleSuccessResponseSchema
>;

export const Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.technology.choice.request"),
      output: Civ7ProgressionTechnologyChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.culture.choice.request"),
      output: Civ7ProgressionCultureChoiceResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionCultureChoiceSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.technology.target.request"),
      output: Civ7ProgressionTechnologyTargetResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionCultureTargetSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.culture.target.request"),
      output: Civ7ProgressionCultureTargetResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionCultureTargetSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionCultureTargetSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.attribute.purchase.request"),
      output: Civ7ProgressionAttributePurchaseResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionAttributeReviewSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.attribute.review.request"),
      output: Civ7ProgressionAttributeReviewResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionAttributeReviewSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionAttributeReviewSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionTraditionChangeSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.tradition.change.request"),
      output: Civ7ProgressionTraditionChangeResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTraditionChangeSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionTraditionChangeSuccessResponseSchema
  >;

export const Civ7ControllerBridgeProgressionTraditionReviewSuccessResponseSchema =
  Type.Object(
    {
      ok: Type.Literal(true),
      procedureKey: Type.Literal("progression.tradition.review.request"),
      output: Civ7ProgressionTraditionReviewResultSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionTraditionReviewSuccessResponse =
  Static<
    typeof Civ7ControllerBridgeProgressionTraditionReviewSuccessResponseSchema
  >;

export const Civ7ControllerBridgeSuccessResponseSchema = Type.Union([
  Civ7ControllerBridgeReadinessCurrentSuccessResponseSchema,
  Civ7ControllerBridgeAttentionCurrentSuccessResponseSchema,
  Civ7ControllerBridgeStrategyFrontSummarySuccessResponseSchema,
  Civ7ControllerBridgeWorldCurrentSuccessResponseSchema,
  Civ7ControllerBridgeNotificationDismissSuccessResponseSchema,
  Civ7ControllerBridgeTurnCompleteSuccessResponseSchema,
  Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema,
  Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema,
  Civ7ControllerBridgeCityTownFocusChangeSuccessResponseSchema,
  Civ7ControllerBridgeCityTownFocusReviewSuccessResponseSchema,
  Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema,
  Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema,
  Civ7ControllerBridgeFirstMeetResponseSuccessResponseSchema,
  Civ7ControllerBridgeGovernmentChoiceSuccessResponseSchema,
  Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponseSchema,
  Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema,
  Civ7ControllerBridgeUnitUpgradeSuccessResponseSchema,
  Civ7ControllerBridgeUnitResettleSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponseSchema,
  Civ7ControllerBridgeProgressionCultureTargetSuccessResponseSchema,
  Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponseSchema,
  Civ7ControllerBridgeProgressionAttributeReviewSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTraditionChangeSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTraditionReviewSuccessResponseSchema,
]);
export type Civ7ControllerBridgeSuccessResponse =
  | Civ7ControllerBridgeReadinessCurrentSuccessResponse
  | Civ7ControllerBridgeAttentionCurrentSuccessResponse
  | Civ7ControllerBridgeStrategyFrontSummarySuccessResponse
  | Civ7ControllerBridgeWorldCurrentSuccessResponse
  | Civ7ControllerBridgeNotificationDismissSuccessResponse
  | Civ7ControllerBridgeTurnCompleteSuccessResponse
  | Civ7ControllerBridgeCityProductionChoiceSuccessResponse
  | Civ7ControllerBridgeCityPopulationPlacementSuccessResponse
  | Civ7ControllerBridgeCityTownFocusChangeSuccessResponse
  | Civ7ControllerBridgeCityTownFocusReviewSuccessResponse
  | Civ7ControllerBridgeNarrativeChoiceSuccessResponse
  | Civ7ControllerBridgeDiplomacyResponseSuccessResponse
  | Civ7ControllerBridgeFirstMeetResponseSuccessResponse
  | Civ7ControllerBridgeGovernmentChoiceSuccessResponse
  | Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponse
  | Civ7ControllerBridgeUnitTargetActionSuccessResponse
  | Civ7ControllerBridgeUnitUpgradeSuccessResponse
  | Civ7ControllerBridgeUnitResettleSuccessResponse
  | Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponse
  | Civ7ControllerBridgeProgressionCultureChoiceSuccessResponse
  | Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponse
  | Civ7ControllerBridgeProgressionCultureTargetSuccessResponse
  | Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponse
  | Civ7ControllerBridgeProgressionAttributeReviewSuccessResponse
  | Civ7ControllerBridgeProgressionTraditionChangeSuccessResponse
  | Civ7ControllerBridgeProgressionTraditionReviewSuccessResponse;

export const Civ7ControllerBridgeFailureResponseSchema = Type.Object(
  {
    ok: Type.Literal(false),
    error: Civ7ControllerBridgeErrorSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeFailureResponse = Static<
  typeof Civ7ControllerBridgeFailureResponseSchema
>;

export const Civ7ControllerBridgeResponseSchema = Type.Union([
  Civ7ControllerBridgeSuccessResponseSchema,
  Civ7ControllerBridgeFailureResponseSchema,
]);
export type Civ7ControllerBridgeResponse = Static<
  typeof Civ7ControllerBridgeResponseSchema
>;

export type Civ7ControllerBridgeContext = Civ7ControlOrpcContext & Readonly<{
  controllerProof?: unknown;
}>;

export type Civ7ControllerBridgeContextFactory = (
  request: Civ7ControllerBridgeRequest,
) => Civ7ControllerBridgeContext | Promise<Civ7ControllerBridgeContext>;

export type Civ7ControllerBridgeIngress = Readonly<{
  invoke(request: unknown): Promise<Civ7ControllerBridgeResponse>;
}>;

export function createCiv7ControllerBridgeIngress(
  options: Readonly<{
    createContext: Civ7ControllerBridgeContextFactory;
  }>,
): Civ7ControllerBridgeIngress {
  return {
    invoke: (request) => invokeCiv7ControllerBridgeRequest(request, options),
  };
}

export async function invokeCiv7ControllerBridgeRequest(
  request: unknown,
  options: Readonly<{
    createContext: Civ7ControllerBridgeContextFactory;
  }>,
): Promise<Civ7ControllerBridgeResponse> {
  if (isUnsupportedProcedureRequest(request)) {
    return bridgeFailure({
      code: "BRIDGE_PROCEDURE_NOT_ALLOWED",
      message: "Civ7 controller bridge procedure is not allowlisted.",
      reason: "procedure-not-allowed",
    });
  }

  if (!Value.Check(Civ7ControllerBridgeRequestSchema, request)) {
    return bridgeFailure({
      code: "BRIDGE_BAD_REQUEST",
      message: "Civ7 controller bridge request envelope is invalid.",
      reason: "invalid-envelope",
    });
  }

  try {
    const context = await options.createContext(request);
    const controllerProof = isControllerBridgeMutationRequest(request)
      ? controllerProofFromContext(context)
      : undefined;
    if (isControllerBridgeMutationRequest(request) && controllerProof == null) {
      return bridgeFailure({
        code: "BRIDGE_CONTROLLER_PROOF_REQUIRED",
        message:
          "Civ7 controller bridge mutation proof is required before dispatch.",
        reason: "invalid-envelope",
      }, request);
    }
    if (!controllerSupportsRequest(context, request)) {
      return bridgeFailure({
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      }, request);
    }
    const client = createCiv7ControlOrpcServerClient({
      ...context,
      correlation: request.correlationId == null
        ? context.correlation
        : {
            ...context.correlation,
            correlationId: request.correlationId,
          },
    });
    const validatedInput = request.input as never;
    if (request.procedureKey === "readiness.current") {
      const output = await client.readiness.current(validatedInput);
      return {
        ok: true,
        procedureKey: "readiness.current",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "strategy.frontSummary") {
      const output = await client.strategy.frontSummary(validatedInput);
      return {
        ok: true,
        procedureKey: "strategy.frontSummary",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "world.current") {
      const output = await client.world.current(validatedInput);
      return {
        ok: true,
        procedureKey: "world.current",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "notifications.dismiss.request") {
      const output = await client.notifications.dismiss.request(validatedInput);
      return {
        ok: true,
        procedureKey: "notifications.dismiss.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "turn.complete.request") {
      const output = await client.turn.complete.request(validatedInput);
      return {
        ok: true,
        procedureKey: "turn.complete.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "city.production.choice.request") {
      const output = await client.city.production.choice.request(validatedInput);
      return {
        ok: true,
        procedureKey: "city.production.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "city.population.place.request") {
      const output = await client.city.population.place.request(validatedInput);
      return {
        ok: true,
        procedureKey: "city.population.place.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "city.townFocus.change.request") {
      const output = await client.city.townFocus.change.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "city.townFocus.change.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "city.townFocus.review.request") {
      const output = await client.city.townFocus.review.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "city.townFocus.review.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "narrative.choice.request") {
      const output = await client.narrative.choice.request(validatedInput);
      return {
        ok: true,
        procedureKey: "narrative.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "diplomacy.response.request") {
      const output = await client.diplomacy.response.request(validatedInput);
      return {
        ok: true,
        procedureKey: "diplomacy.response.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "diplomacy.firstMeet.response.request") {
      const output = await client.diplomacy.firstMeet.response.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "diplomacy.firstMeet.response.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "government.choice.request") {
      const output = await client.government.choice.request(validatedInput);
      return {
        ok: true,
        procedureKey: "government.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "government.celebration.choice.request") {
      const output = await client.government.celebration.choice.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "government.celebration.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "unit.target.action.request") {
      const output = await client.unit.target.action.request(validatedInput);
      return {
        ok: true,
        procedureKey: "unit.target.action.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "unit.upgrade.request") {
      const output = await client.unit.upgrade.request(validatedInput);
      return {
        ok: true,
        procedureKey: "unit.upgrade.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "unit.resettle.request") {
      const output = await client.unit.resettle.request(validatedInput);
      return {
        ok: true,
        procedureKey: "unit.resettle.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.technology.choice.request") {
      const output = await client.progression.technology.choice.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.technology.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.culture.choice.request") {
      const output = await client.progression.culture.choice.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.culture.choice.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.technology.target.request") {
      const output = await client.progression.technology.target.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.technology.target.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.culture.target.request") {
      const output = await client.progression.culture.target.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.culture.target.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.attribute.purchase.request") {
      const output = await client.progression.attribute.purchase.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.attribute.purchase.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.attribute.review.request") {
      const output = await client.progression.attribute.review.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.attribute.review.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.tradition.change.request") {
      const output = await client.progression.tradition.change.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.tradition.change.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.tradition.review.request") {
      const output = await client.progression.tradition.review.request(
        validatedInput,
      );
      return {
        ok: true,
        procedureKey: "progression.tradition.review.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    const output = await client.attention.current(validatedInput);
    return {
      ok: true,
      procedureKey: "attention.current",
      output,
      ...(request.correlationId == null
        ? {}
        : { correlationId: request.correlationId }),
    };
  } catch (err) {
    return bridgeFailure(safeBridgeProcedureError(err), request);
  }
}

function controllerProofFromContext(
  context: Civ7ControllerBridgeContext,
): Civ7ControllerBridgeMutationProof | null {
  if (!Value.Check(Civ7ControllerBridgeMutationProofSchema, context.controllerProof)) {
    return null;
  }
  return context.controllerProof;
}

function isUnsupportedProcedureRequest(
  request: unknown,
): request is Readonly<{ procedureKey: string }> {
  if (request == null || typeof request !== "object") return false;
  if (!("procedureKey" in request)) return false;
  return typeof request.procedureKey === "string"
    && request.procedureKey !== "readiness.current"
    && request.procedureKey !== "attention.current"
    && request.procedureKey !== "strategy.frontSummary"
    && request.procedureKey !== "world.current"
    && request.procedureKey !== "notifications.dismiss.request"
    && request.procedureKey !== "turn.complete.request"
    && request.procedureKey !== "city.production.choice.request"
    && request.procedureKey !== "city.population.place.request"
    && request.procedureKey !== "city.townFocus.change.request"
    && request.procedureKey !== "city.townFocus.review.request"
    && request.procedureKey !== "narrative.choice.request"
    && request.procedureKey !== "diplomacy.response.request"
    && request.procedureKey !== "diplomacy.firstMeet.response.request"
    && request.procedureKey !== "government.choice.request"
    && request.procedureKey !== "government.celebration.choice.request"
    && request.procedureKey !== "unit.target.action.request"
    && request.procedureKey !== "unit.upgrade.request"
    && request.procedureKey !== "unit.resettle.request"
    && request.procedureKey !== "progression.technology.choice.request"
    && request.procedureKey !== "progression.culture.choice.request"
    && request.procedureKey !== "progression.technology.target.request"
    && request.procedureKey !== "progression.culture.target.request"
    && request.procedureKey !== "progression.attribute.purchase.request"
    && request.procedureKey !== "progression.attribute.review.request"
    && request.procedureKey !== "progression.tradition.change.request"
    && request.procedureKey !== "progression.tradition.review.request";
}

function isControllerBridgeMutationRequest(
  request: Civ7ControllerBridgeRequest,
): request is
  | Civ7ControllerBridgeNotificationDismissRequest
  | Civ7ControllerBridgeTurnCompleteRequest
  | Civ7ControllerBridgeCityProductionChoiceRequest
  | Civ7ControllerBridgeCityPopulationPlacementRequest
  | Civ7ControllerBridgeCityTownFocusChangeRequest
  | Civ7ControllerBridgeCityTownFocusReviewRequest
  | Civ7ControllerBridgeNarrativeChoiceRequest
  | Civ7ControllerBridgeDiplomacyResponseRequest
  | Civ7ControllerBridgeFirstMeetResponseRequest
  | Civ7ControllerBridgeGovernmentChoiceRequest
  | Civ7ControllerBridgeGovernmentCelebrationChoiceRequest
  | Civ7ControllerBridgeUnitTargetActionRequest
  | Civ7ControllerBridgeUnitUpgradeRequest
  | Civ7ControllerBridgeUnitResettleRequest
  | Civ7ControllerBridgeProgressionTechnologyChoiceRequest
  | Civ7ControllerBridgeProgressionCultureChoiceRequest
  | Civ7ControllerBridgeProgressionTechnologyTargetRequest
  | Civ7ControllerBridgeProgressionCultureTargetRequest
  | Civ7ControllerBridgeProgressionAttributePurchaseRequest
  | Civ7ControllerBridgeProgressionAttributeReviewRequest
  | Civ7ControllerBridgeProgressionTraditionChangeRequest
  | Civ7ControllerBridgeProgressionTraditionReviewRequest {
  return request.procedureKey === "notifications.dismiss.request"
    || request.procedureKey === "turn.complete.request"
    || request.procedureKey === "city.production.choice.request"
    || request.procedureKey === "city.population.place.request"
    || request.procedureKey === "city.townFocus.change.request"
    || request.procedureKey === "city.townFocus.review.request"
    || request.procedureKey === "narrative.choice.request"
    || request.procedureKey === "diplomacy.response.request"
    || request.procedureKey === "diplomacy.firstMeet.response.request"
    || request.procedureKey === "government.choice.request"
    || request.procedureKey === "government.celebration.choice.request"
    || request.procedureKey === "unit.target.action.request"
    || request.procedureKey === "unit.upgrade.request"
    || request.procedureKey === "unit.resettle.request"
    || request.procedureKey === "progression.technology.choice.request"
    || request.procedureKey === "progression.culture.choice.request"
    || request.procedureKey === "progression.technology.target.request"
    || request.procedureKey === "progression.culture.target.request"
    || request.procedureKey === "progression.attribute.purchase.request"
    || request.procedureKey === "progression.attribute.review.request"
    || request.procedureKey === "progression.tradition.change.request"
    || request.procedureKey === "progression.tradition.review.request";
}

function controllerSupportsRequest(
  context: Civ7ControllerBridgeContext,
  request: Civ7ControllerBridgeRequest,
): boolean {
  if (request.procedureKey === "readiness.current") return true;
  if (isControllerBridgeMutationRequest(request)) {
    return context.controller?.supportedMutationProcedures?.includes(
      request.procedureKey,
    ) === true;
  }
  return context.controller?.supportedReadProcedures?.includes(
    request.procedureKey,
  ) === true;
}

function safeBridgeProcedureError(err: unknown): Civ7ControllerBridgeError {
  if (err instanceof ORPCError && typeof err.code === "string") {
    return {
      code: err.code,
      message: err.message || "Civ7 controller bridge procedure failed.",
      reason: "procedure-failed",
    };
  }
  return {
    code: "BRIDGE_PROCEDURE_FAILED",
    message: "Civ7 controller bridge procedure failed.",
    reason: "procedure-failed",
  };
}

function bridgeFailure(
  error: Civ7ControllerBridgeError,
  request?: Civ7ControllerBridgeRequest,
): Civ7ControllerBridgeFailureResponse {
  return {
    ok: false,
    error,
    ...(request?.correlationId == null
      ? {}
      : { correlationId: request.correlationId }),
  };
}
