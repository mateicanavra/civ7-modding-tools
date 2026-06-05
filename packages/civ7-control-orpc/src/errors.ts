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

export const Civ7MutationApprovalRequiredErrorDataSchema = Type.Object(
  {
    procedureKey: Type.String(),
    source: Type.Literal("context.approval"),
    risk: Type.Literal("mutation"),
    ...Civ7ControlOrpcErrorCorrelationProperties,
  },
  { additionalProperties: false },
);
export type Civ7MutationApprovalRequiredErrorData = Static<
  typeof Civ7MutationApprovalRequiredErrorDataSchema
>;

export class Civ7MutationApprovalRequiredError extends ORPCTaggedError(
  "Civ7MutationApprovalRequiredError",
  {
    code: "MUTATION_APPROVAL_REQUIRED",
    message: "Explicit mutation approval is required.",
    schema: toStandardSchema(Civ7MutationApprovalRequiredErrorDataSchema),
    status: 403,
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
  MUTATION_APPROVAL_REQUIRED: Civ7MutationApprovalRequiredError,
  MUTATION_READINESS_REQUIRED: Civ7MutationReadinessRequiredError,
  MUTATION_READINESS_UNAVAILABLE: Civ7MutationReadinessUnavailableError,
  NOTIFICATION_DISMISSAL_UNAVAILABLE: Civ7NotificationDismissalUnavailableError,
  POPULATION_PLACEMENT_UNAVAILABLE: Civ7PopulationPlacementUnavailableError,
  PRODUCTION_CHOICE_UNAVAILABLE: Civ7ProductionChoiceUnavailableError,
  READINESS_CURRENT_UNAVAILABLE: Civ7ReadinessCurrentUnavailableError,
  UNIT_TARGET_ACTION_UNAVAILABLE: Civ7UnitTargetActionUnavailableError,
} satisfies EffectErrorMap;

export type Civ7ControlOrpcEffectErrorMap = typeof civ7ControlOrpcErrorMap;
export type Civ7ControlOrpcErrorMap =
  EffectErrorMapToErrorMap<Civ7ControlOrpcEffectErrorMap>;
