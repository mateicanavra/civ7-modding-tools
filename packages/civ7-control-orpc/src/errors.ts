import {
  ORPCTaggedError,
  type EffectErrorMap,
  type EffectErrorMapToErrorMap,
} from "effect-orpc";
import { Type, type Static } from "typebox";

import { Civ7ControlOrpcCorrelationIdSchema } from "./model/correlation";
import { toStandardSchema } from "./typebox-standard-schema";

const Civ7ControlOrpcErrorCorrelationProperties = {
  correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
};

export const Civ7ReadinessCurrentUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("readiness.current"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7ReadinessCurrentUnavailableErrorData = Static<
  typeof Civ7ReadinessCurrentUnavailableErrorDataSchema
>;

export class Civ7ReadinessCurrentUnavailableError extends ORPCTaggedError(
  "Civ7ReadinessCurrentUnavailableError",
  {
    code: "READINESS_CURRENT_UNAVAILABLE",
    message: "Current readiness view failed.",
    schema: toStandardSchema(Civ7ReadinessCurrentUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7AttentionCurrentUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("attention.current"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7AttentionCurrentUnavailableErrorData = Static<
  typeof Civ7AttentionCurrentUnavailableErrorDataSchema
>;

export class Civ7AttentionCurrentUnavailableError extends ORPCTaggedError(
  "Civ7AttentionCurrentUnavailableError",
  {
    code: "ATTENTION_CURRENT_UNAVAILABLE",
    message: "Current attention view failed.",
    schema: toStandardSchema(Civ7AttentionCurrentUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7StrategyFrontSummaryUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("strategy.frontSummary"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7StrategyFrontSummaryUnavailableErrorData = Static<
  typeof Civ7StrategyFrontSummaryUnavailableErrorDataSchema
>;

export class Civ7StrategyFrontSummaryUnavailableError extends ORPCTaggedError(
  "Civ7StrategyFrontSummaryUnavailableError",
  {
    code: "STRATEGY_FRONT_SUMMARY_UNAVAILABLE",
    message: "Strategy front summary failed.",
    schema: toStandardSchema(Civ7StrategyFrontSummaryUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7NotificationDismissalUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("notifications.dismiss.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7NotificationDismissalUnavailableErrorData = Static<
  typeof Civ7NotificationDismissalUnavailableErrorDataSchema
>;

export class Civ7NotificationDismissalUnavailableError extends ORPCTaggedError(
  "Civ7NotificationDismissalUnavailableError",
  {
    code: "NOTIFICATION_DISMISSAL_UNAVAILABLE",
    message: "Direct-control notification dismissal request failed.",
    schema: toStandardSchema(Civ7NotificationDismissalUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7UnitTargetActionUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.target.action.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7UnitTargetActionUnavailableErrorData = Static<
  typeof Civ7UnitTargetActionUnavailableErrorDataSchema
>;

export class Civ7UnitTargetActionUnavailableError extends ORPCTaggedError(
  "Civ7UnitTargetActionUnavailableError",
  {
    code: "UNIT_TARGET_ACTION_UNAVAILABLE",
    message: "Direct-control unit target action request failed.",
    schema: toStandardSchema(Civ7UnitTargetActionUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7NarrativeChoiceUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("narrative.choice.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7NarrativeChoiceUnavailableErrorData = Static<
  typeof Civ7NarrativeChoiceUnavailableErrorDataSchema
>;

export class Civ7NarrativeChoiceUnavailableError extends ORPCTaggedError(
  "Civ7NarrativeChoiceUnavailableError",
  {
    code: "NARRATIVE_CHOICE_UNAVAILABLE",
    message: "Direct-control narrative choice request failed.",
    schema: toStandardSchema(Civ7NarrativeChoiceUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7DiplomacyResponseUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("diplomacy.response.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7DiplomacyResponseUnavailableErrorData = Static<
  typeof Civ7DiplomacyResponseUnavailableErrorDataSchema
>;

export class Civ7DiplomacyResponseUnavailableError extends ORPCTaggedError(
  "Civ7DiplomacyResponseUnavailableError",
  {
    code: "DIPLOMACY_RESPONSE_UNAVAILABLE",
    message: "Direct-control diplomacy response request failed.",
    schema: toStandardSchema(Civ7DiplomacyResponseUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7ProgressionChoiceUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("progression.technology.choice.request"),
      Type.Literal("progression.culture.choice.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7ProgressionChoiceUnavailableErrorData = Static<
  typeof Civ7ProgressionChoiceUnavailableErrorDataSchema
>;

export class Civ7ProgressionChoiceUnavailableError extends ORPCTaggedError(
  "Civ7ProgressionChoiceUnavailableError",
  {
    code: "PROGRESSION_CHOICE_UNAVAILABLE",
    message: "Direct-control progression choice request failed.",
    schema: toStandardSchema(Civ7ProgressionChoiceUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7TurnCompletionUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("turn.complete.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7TurnCompletionUnavailableErrorData = Static<
  typeof Civ7TurnCompletionUnavailableErrorDataSchema
>;

export class Civ7TurnCompletionUnavailableError extends ORPCTaggedError(
  "Civ7TurnCompletionUnavailableError",
  {
    code: "TURN_COMPLETION_UNAVAILABLE",
    message: "Direct-control turn completion request failed.",
    schema: toStandardSchema(Civ7TurnCompletionUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7MutationReadinessRequiredErrorDataSchema = Type.Object(
  {
    procedureKey: Type.String(),
    source: Type.Literal("readiness.current"),
    risk: Type.Literal("mutation"),
    playable: Type.Literal(false),
    readiness: Type.String(),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7MutationReadinessRequiredErrorData = Static<
  typeof Civ7MutationReadinessRequiredErrorDataSchema
>;

export class Civ7MutationReadinessRequiredError extends ORPCTaggedError(
  "Civ7MutationReadinessRequiredError",
  {
    code: "MUTATION_READINESS_REQUIRED",
    message: "Playable Civ7 readiness is required before mutation.",
    schema: toStandardSchema(Civ7MutationReadinessRequiredErrorDataSchema),
    status: 409,
  },
) {}

export const Civ7MutationReadinessUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.String(),
    source: Type.Literal("direct-control-facade"),
    risk: Type.Literal("mutation"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7MutationReadinessUnavailableErrorData = Static<
  typeof Civ7MutationReadinessUnavailableErrorDataSchema
>;

export class Civ7MutationReadinessUnavailableError extends ORPCTaggedError(
  "Civ7MutationReadinessUnavailableError",
  {
    code: "MUTATION_READINESS_UNAVAILABLE",
    message: "Playable Civ7 readiness could not be verified before mutation.",
    schema: toStandardSchema(Civ7MutationReadinessUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7MutationProofBoundaryInvalidErrorDataSchema = Type.Object(
  {
    procedureKey: Type.String(),
    source: Type.Literal("mutation-proof-boundary"),
    risk: Type.Literal("mutation"),
    reason: Type.Union([
      Type.Literal("missing-postcondition"),
      Type.Literal("missing-no-repeat-boundary"),
      Type.Literal("unverified-repeat-safe"),
      Type.Literal("sent-unverified-without-do-not-repeat"),
      Type.Literal("sent-guarded-without-do-not-repeat"),
    ]),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7MutationProofBoundaryInvalidErrorData = Static<
  typeof Civ7MutationProofBoundaryInvalidErrorDataSchema
>;

export class Civ7MutationProofBoundaryInvalidError extends ORPCTaggedError(
  "Civ7MutationProofBoundaryInvalidError",
  {
    code: "MUTATION_PROOF_BOUNDARY_INVALID",
    message: "Mutation output violated the proof/no-repeat boundary.",
    schema: toStandardSchema(Civ7MutationProofBoundaryInvalidErrorDataSchema),
    status: 500,
  },
) {}

export const Civ7ProductionChoiceUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.production.choice.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7ProductionChoiceUnavailableErrorData = Static<
  typeof Civ7ProductionChoiceUnavailableErrorDataSchema
>;

export class Civ7ProductionChoiceUnavailableError extends ORPCTaggedError(
  "Civ7ProductionChoiceUnavailableError",
  {
    code: "PRODUCTION_CHOICE_UNAVAILABLE",
    message: "Direct-control production choice request failed.",
    schema: toStandardSchema(Civ7ProductionChoiceUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7PopulationPlacementUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.population.place.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7PopulationPlacementUnavailableErrorData = Static<
  typeof Civ7PopulationPlacementUnavailableErrorDataSchema
>;

export class Civ7PopulationPlacementUnavailableError extends ORPCTaggedError(
  "Civ7PopulationPlacementUnavailableError",
  {
    code: "POPULATION_PLACEMENT_UNAVAILABLE",
    message: "Direct-control population placement request failed.",
    schema: toStandardSchema(Civ7PopulationPlacementUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7CorrelationIdInvalidErrorDataSchema = Type.Object(
  {
    source: Type.Literal("context.correlation"),
    reason: Type.Literal("correlation-id-invalid"),
  },
  { additionalProperties: false },
);
export type Civ7CorrelationIdInvalidErrorData = Static<
  typeof Civ7CorrelationIdInvalidErrorDataSchema
>;

export class Civ7CorrelationIdInvalidError extends ORPCTaggedError(
  "Civ7CorrelationIdInvalidError",
  {
    code: "CORRELATION_ID_INVALID",
    message: "Civ7 control-oRPC correlation id is invalid.",
    schema: toStandardSchema(Civ7CorrelationIdInvalidErrorDataSchema),
    status: 400,
  },
) {}

export const civ7ControlOrpcErrorMap = {
  ATTENTION_CURRENT_UNAVAILABLE: Civ7AttentionCurrentUnavailableError,
  CORRELATION_ID_INVALID: Civ7CorrelationIdInvalidError,
  DIPLOMACY_RESPONSE_UNAVAILABLE: Civ7DiplomacyResponseUnavailableError,
  MUTATION_PROOF_BOUNDARY_INVALID: Civ7MutationProofBoundaryInvalidError,
  MUTATION_READINESS_REQUIRED: Civ7MutationReadinessRequiredError,
  MUTATION_READINESS_UNAVAILABLE: Civ7MutationReadinessUnavailableError,
  NARRATIVE_CHOICE_UNAVAILABLE: Civ7NarrativeChoiceUnavailableError,
  NOTIFICATION_DISMISSAL_UNAVAILABLE: Civ7NotificationDismissalUnavailableError,
  POPULATION_PLACEMENT_UNAVAILABLE: Civ7PopulationPlacementUnavailableError,
  PROGRESSION_CHOICE_UNAVAILABLE: Civ7ProgressionChoiceUnavailableError,
  PRODUCTION_CHOICE_UNAVAILABLE: Civ7ProductionChoiceUnavailableError,
  READINESS_CURRENT_UNAVAILABLE: Civ7ReadinessCurrentUnavailableError,
  STRATEGY_FRONT_SUMMARY_UNAVAILABLE: Civ7StrategyFrontSummaryUnavailableError,
  TURN_COMPLETION_UNAVAILABLE: Civ7TurnCompletionUnavailableError,
  UNIT_TARGET_ACTION_UNAVAILABLE: Civ7UnitTargetActionUnavailableError,
} satisfies EffectErrorMap;

export type Civ7ControlOrpcEffectErrorMap = typeof civ7ControlOrpcErrorMap;
export type Civ7ControlOrpcErrorMap =
  EffectErrorMapToErrorMap<Civ7ControlOrpcEffectErrorMap>;
