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

export const Civ7AttentionPrioritiesUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("attention.priorities"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7AttentionPrioritiesUnavailableErrorData = Static<
  typeof Civ7AttentionPrioritiesUnavailableErrorDataSchema
>;

export class Civ7AttentionPrioritiesUnavailableError extends ORPCTaggedError(
  "Civ7AttentionPrioritiesUnavailableError",
  {
    code: "ATTENTION_PRIORITIES_UNAVAILABLE",
    message: "Attention priorities view failed.",
    schema: toStandardSchema(Civ7AttentionPrioritiesUnavailableErrorDataSchema),
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

export const Civ7StrategyCivilianRouteTriageUnavailableErrorDataSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("strategy.civilianRouteTriage"),
      source: Type.Literal("direct-control-facade"),
      ...Civ7ControlOrpcErrorCorrelationProperties,
    },
    { additionalProperties: false },
  );
export type Civ7StrategyCivilianRouteTriageUnavailableErrorData = Static<
  typeof Civ7StrategyCivilianRouteTriageUnavailableErrorDataSchema
>;

export class Civ7StrategyCivilianRouteTriageUnavailableError extends ORPCTaggedError(
  "Civ7StrategyCivilianRouteTriageUnavailableError",
  {
    code: "STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE",
    message: "Strategy civilian route triage failed.",
    schema: toStandardSchema(
      Civ7StrategyCivilianRouteTriageUnavailableErrorDataSchema,
    ),
    status: 503,
  },
) {}

export const Civ7StrategyFormationSnapshotUnavailableErrorDataSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("strategy.formationSnapshot"),
      source: Type.Literal("direct-control-facade"),
      ...Civ7ControlOrpcErrorCorrelationProperties,
    },
    { additionalProperties: false },
  );
export type Civ7StrategyFormationSnapshotUnavailableErrorData = Static<
  typeof Civ7StrategyFormationSnapshotUnavailableErrorDataSchema
>;

export class Civ7StrategyFormationSnapshotUnavailableError extends ORPCTaggedError(
  "Civ7StrategyFormationSnapshotUnavailableError",
  {
    code: "STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE",
    message: "Strategy formation snapshot failed.",
    schema: toStandardSchema(
      Civ7StrategyFormationSnapshotUnavailableErrorDataSchema,
    ),
    status: 503,
  },
) {}

export const Civ7WorldCurrentUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("world.current"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7WorldCurrentUnavailableErrorData = Static<
  typeof Civ7WorldCurrentUnavailableErrorDataSchema
>;

export class Civ7WorldCurrentUnavailableError extends ORPCTaggedError(
  "Civ7WorldCurrentUnavailableError",
  {
    code: "WORLD_CURRENT_UNAVAILABLE",
    message: "Current world view failed.",
    schema: toStandardSchema(Civ7WorldCurrentUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7WorldReadUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("world.plot.read"),
      Type.Literal("world.grid.read"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7WorldReadUnavailableErrorData = Static<
  typeof Civ7WorldReadUnavailableErrorDataSchema
>;

export class Civ7WorldReadUnavailableError extends ORPCTaggedError(
  "Civ7WorldReadUnavailableError",
  {
    code: "WORLD_READ_UNAVAILABLE",
    message: "World map read failed.",
    schema: toStandardSchema(Civ7WorldReadUnavailableErrorDataSchema),
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

export const Civ7NotificationAdvisorWarningUnavailableErrorDataSchema =
  Type.Object(
    {
      procedureKey: Type.Literal(
        "notifications.advisorWarning.viewed.request",
      ),
      source: Type.Literal("direct-control-facade"),
      ...Civ7ControlOrpcErrorCorrelationProperties,
    },
    { additionalProperties: false },
  );
export type Civ7NotificationAdvisorWarningUnavailableErrorData = Static<
  typeof Civ7NotificationAdvisorWarningUnavailableErrorDataSchema
>;

export class Civ7NotificationAdvisorWarningUnavailableError extends ORPCTaggedError(
  "Civ7NotificationAdvisorWarningUnavailableError",
  {
    code: "NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE",
    message: "Advisor warning viewed request failed.",
    schema: toStandardSchema(
      Civ7NotificationAdvisorWarningUnavailableErrorDataSchema,
    ),
    status: 503,
  },
) {}

export const Civ7NotificationQueueUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("notifications.queue.current"),
      Type.Literal("notifications.queue.dismiss.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7NotificationQueueUnavailableErrorData = Static<
  typeof Civ7NotificationQueueUnavailableErrorDataSchema
>;

export class Civ7NotificationQueueUnavailableError extends ORPCTaggedError(
  "Civ7NotificationQueueUnavailableError",
  {
    code: "NOTIFICATION_QUEUE_UNAVAILABLE",
    message: "Notification queue service failed.",
    schema: toStandardSchema(Civ7NotificationQueueUnavailableErrorDataSchema),
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

export const Civ7UnitRequestUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("unit.upgrade.request"),
      Type.Literal("unit.resettle.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7UnitRequestUnavailableErrorData = Static<
  typeof Civ7UnitRequestUnavailableErrorDataSchema
>;

export class Civ7UnitRequestUnavailableError extends ORPCTaggedError(
  "Civ7UnitRequestUnavailableError",
  {
    code: "UNIT_REQUEST_UNAVAILABLE",
    message: "Direct-control unit request failed.",
    schema: toStandardSchema(Civ7UnitRequestUnavailableErrorDataSchema),
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

export const Civ7FirstMeetResponseUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("diplomacy.firstMeet.response.request"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7FirstMeetResponseUnavailableErrorData = Static<
  typeof Civ7FirstMeetResponseUnavailableErrorDataSchema
>;

export class Civ7FirstMeetResponseUnavailableError extends ORPCTaggedError(
  "Civ7FirstMeetResponseUnavailableError",
  {
    code: "FIRST_MEET_RESPONSE_UNAVAILABLE",
    message: "Direct-control first-meet response request failed.",
    schema: toStandardSchema(Civ7FirstMeetResponseUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7GovernmentChoiceUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("government.choice.request"),
      Type.Literal("government.celebration.choice.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7GovernmentChoiceUnavailableErrorData = Static<
  typeof Civ7GovernmentChoiceUnavailableErrorDataSchema
>;

export class Civ7GovernmentChoiceUnavailableError extends ORPCTaggedError(
  "Civ7GovernmentChoiceUnavailableError",
  {
    code: "GOVERNMENT_CHOICE_UNAVAILABLE",
    message: "Direct-control government-domain choice request failed.",
    schema: toStandardSchema(Civ7GovernmentChoiceUnavailableErrorDataSchema),
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

export const Civ7ProgressionDashboardUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("progression.dashboard.current"),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7ProgressionDashboardUnavailableErrorData = Static<
  typeof Civ7ProgressionDashboardUnavailableErrorDataSchema
>;

export class Civ7ProgressionDashboardUnavailableError extends ORPCTaggedError(
  "Civ7ProgressionDashboardUnavailableError",
  {
    code: "PROGRESSION_DASHBOARD_UNAVAILABLE",
    message: "Direct-control progression dashboard read failed.",
    schema: toStandardSchema(
      Civ7ProgressionDashboardUnavailableErrorDataSchema,
    ),
    status: 503,
  },
) {}

export const Civ7ProgressionPlayerChoiceUnavailableErrorDataSchema =
  Type.Object(
    {
      procedureKey: Type.Union([
        Type.Literal("progression.attribute.purchase.request"),
        Type.Literal("progression.attribute.review.request"),
        Type.Literal("progression.tradition.change.request"),
        Type.Literal("progression.tradition.review.request"),
      ]),
      source: Type.Literal("direct-control-facade"),
      ...Civ7ControlOrpcErrorCorrelationProperties,
    },
    { additionalProperties: false },
  );
export type Civ7ProgressionPlayerChoiceUnavailableErrorData = Static<
  typeof Civ7ProgressionPlayerChoiceUnavailableErrorDataSchema
>;

export class Civ7ProgressionPlayerChoiceUnavailableError extends ORPCTaggedError(
  "Civ7ProgressionPlayerChoiceUnavailableError",
  {
    code: "PROGRESSION_PLAYER_CHOICE_UNAVAILABLE",
    message: "Direct-control progression player-choice request failed.",
    schema: toStandardSchema(
      Civ7ProgressionPlayerChoiceUnavailableErrorDataSchema,
    ),
    status: 503,
  },
) {}

export const Civ7ProgressionTargetUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("progression.technology.target.request"),
      Type.Literal("progression.culture.target.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTargetUnavailableErrorData = Static<
  typeof Civ7ProgressionTargetUnavailableErrorDataSchema
>;

export class Civ7ProgressionTargetUnavailableError extends ORPCTaggedError(
  "Civ7ProgressionTargetUnavailableError",
  {
    code: "PROGRESSION_TARGET_UNAVAILABLE",
    message: "Direct-control progression target request failed.",
    schema: toStandardSchema(Civ7ProgressionTargetUnavailableErrorDataSchema),
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

export const Civ7TownFocusUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Union([
      Type.Literal("city.townFocus.change.request"),
      Type.Literal("city.townFocus.review.request"),
    ]),
    source: Type.Literal("direct-control-facade"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7TownFocusUnavailableErrorData = Static<
  typeof Civ7TownFocusUnavailableErrorDataSchema
>;

export class Civ7TownFocusUnavailableError extends ORPCTaggedError(
  "Civ7TownFocusUnavailableError",
  {
    code: "TOWN_FOCUS_UNAVAILABLE",
    message: "Direct-control town focus request failed.",
    schema: toStandardSchema(Civ7TownFocusUnavailableErrorDataSchema),
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
  ATTENTION_PRIORITIES_UNAVAILABLE: Civ7AttentionPrioritiesUnavailableError,
  CORRELATION_ID_INVALID: Civ7CorrelationIdInvalidError,
  DIPLOMACY_RESPONSE_UNAVAILABLE: Civ7DiplomacyResponseUnavailableError,
  FIRST_MEET_RESPONSE_UNAVAILABLE: Civ7FirstMeetResponseUnavailableError,
  GOVERNMENT_CHOICE_UNAVAILABLE: Civ7GovernmentChoiceUnavailableError,
  MUTATION_PROOF_BOUNDARY_INVALID: Civ7MutationProofBoundaryInvalidError,
  MUTATION_READINESS_REQUIRED: Civ7MutationReadinessRequiredError,
  MUTATION_READINESS_UNAVAILABLE: Civ7MutationReadinessUnavailableError,
  NARRATIVE_CHOICE_UNAVAILABLE: Civ7NarrativeChoiceUnavailableError,
  NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE:
    Civ7NotificationAdvisorWarningUnavailableError,
  NOTIFICATION_DISMISSAL_UNAVAILABLE: Civ7NotificationDismissalUnavailableError,
  NOTIFICATION_QUEUE_UNAVAILABLE: Civ7NotificationQueueUnavailableError,
  POPULATION_PLACEMENT_UNAVAILABLE: Civ7PopulationPlacementUnavailableError,
  PROGRESSION_CHOICE_UNAVAILABLE: Civ7ProgressionChoiceUnavailableError,
  PROGRESSION_DASHBOARD_UNAVAILABLE: Civ7ProgressionDashboardUnavailableError,
  PROGRESSION_PLAYER_CHOICE_UNAVAILABLE: Civ7ProgressionPlayerChoiceUnavailableError,
  PROGRESSION_TARGET_UNAVAILABLE: Civ7ProgressionTargetUnavailableError,
  PRODUCTION_CHOICE_UNAVAILABLE: Civ7ProductionChoiceUnavailableError,
  READINESS_CURRENT_UNAVAILABLE: Civ7ReadinessCurrentUnavailableError,
  STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE:
    Civ7StrategyCivilianRouteTriageUnavailableError,
  STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE:
    Civ7StrategyFormationSnapshotUnavailableError,
  STRATEGY_FRONT_SUMMARY_UNAVAILABLE: Civ7StrategyFrontSummaryUnavailableError,
  TOWN_FOCUS_UNAVAILABLE: Civ7TownFocusUnavailableError,
  TURN_COMPLETION_UNAVAILABLE: Civ7TurnCompletionUnavailableError,
  UNIT_REQUEST_UNAVAILABLE: Civ7UnitRequestUnavailableError,
  UNIT_TARGET_ACTION_UNAVAILABLE: Civ7UnitTargetActionUnavailableError,
  WORLD_CURRENT_UNAVAILABLE: Civ7WorldCurrentUnavailableError,
  WORLD_READ_UNAVAILABLE: Civ7WorldReadUnavailableError,
} satisfies EffectErrorMap;

export type Civ7ControlOrpcEffectErrorMap = typeof civ7ControlOrpcErrorMap;
export type Civ7ControlOrpcErrorMap =
  EffectErrorMapToErrorMap<Civ7ControlOrpcEffectErrorMap>;
