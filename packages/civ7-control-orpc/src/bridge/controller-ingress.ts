import { ORPCError } from "@orpc/server";
import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

import { createCiv7ControlOrpcServerClient } from "../client";
import type { Civ7ControlOrpcContext } from "../context";
import { Civ7ControlOrpcCorrelationIdSchema } from "../model/correlation";
import {
  Civ7AttentionCurrentInputSchema,
  Civ7AttentionCurrentResultSchema,
} from "../modules/attention/contract";
import {
  Civ7CityPopulationPlacementInputSchema,
  Civ7CityPopulationPlacementResultSchema,
  Civ7CityProductionChoiceInputSchema,
  Civ7CityProductionChoiceResultSchema,
} from "../modules/city/contract";
import {
  Civ7DiplomacyResponseInputSchema,
  Civ7DiplomacyResponseResultSchema,
} from "../modules/diplomacy/contract";
import {
  Civ7NotificationDismissInputSchema,
  Civ7NotificationDismissalResultSchema,
} from "../modules/notifications/contract";
import {
  Civ7ProgressionChoiceInputSchema,
  Civ7ProgressionCultureChoiceResultSchema,
  Civ7ProgressionTechnologyChoiceResultSchema,
} from "../modules/progression/contract";
import {
  Civ7NarrativeChoiceInputSchema,
  Civ7NarrativeChoiceResultSchema,
} from "../modules/narrative/contract";
import {
  Civ7ReadinessCurrentInputSchema,
  Civ7ReadinessCurrentResultSchema,
} from "../modules/readiness/contract";
import {
  Civ7TurnCompletionInputSchema,
  Civ7TurnCompletionResultSchema,
} from "../modules/turn/contract";
import {
  Civ7UnitTargetActionInputSchema,
  Civ7UnitTargetActionResultSchema,
} from "../modules/unit/contract";

export const Civ7ControllerBridgeApprovalSchema = Type.Object(
  {
    source: Type.Literal("controller-runtime"),
    approved: Type.Literal(true),
    reason: Type.String({ minLength: 1 }),
    disposableSession: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeApproval = Static<
  typeof Civ7ControllerBridgeApprovalSchema
>;

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

export const Civ7ControllerBridgeNotificationDismissRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("notifications.dismiss.request"),
    input: Civ7NotificationDismissInputSchema,
    approval: Civ7ControllerBridgeApprovalSchema,
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
    approval: Civ7ControllerBridgeApprovalSchema,
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
    approval: Civ7ControllerBridgeApprovalSchema,
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
      approval: Civ7ControllerBridgeApprovalSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeCityPopulationPlacementRequest = Static<
  typeof Civ7ControllerBridgeCityPopulationPlacementRequestSchema
>;

export const Civ7ControllerBridgeNarrativeChoiceRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("narrative.choice.request"),
    input: Civ7NarrativeChoiceInputSchema,
    approval: Civ7ControllerBridgeApprovalSchema,
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
    approval: Civ7ControllerBridgeApprovalSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeDiplomacyResponseRequest = Static<
  typeof Civ7ControllerBridgeDiplomacyResponseRequestSchema
>;

export const Civ7ControllerBridgeUnitTargetActionRequestSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.target.action.request"),
    input: Civ7UnitTargetActionInputSchema,
    approval: Civ7ControllerBridgeApprovalSchema,
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ControllerBridgeUnitTargetActionRequest = Static<
  typeof Civ7ControllerBridgeUnitTargetActionRequestSchema
>;

export const Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema =
  Type.Object(
    {
      procedureKey: Type.Literal("progression.technology.choice.request"),
      input: Civ7ProgressionChoiceInputSchema,
      approval: Civ7ControllerBridgeApprovalSchema,
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
      approval: Civ7ControllerBridgeApprovalSchema,
      correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    },
    { additionalProperties: false },
  );
export type Civ7ControllerBridgeProgressionCultureChoiceRequest = Static<
  typeof Civ7ControllerBridgeProgressionCultureChoiceRequestSchema
>;

export const Civ7ControllerBridgeRequestSchema = Type.Union([
  Civ7ControllerBridgeReadinessCurrentRequestSchema,
  Civ7ControllerBridgeAttentionCurrentRequestSchema,
  Civ7ControllerBridgeNotificationDismissRequestSchema,
  Civ7ControllerBridgeTurnCompleteRequestSchema,
  Civ7ControllerBridgeCityProductionChoiceRequestSchema,
  Civ7ControllerBridgeCityPopulationPlacementRequestSchema,
  Civ7ControllerBridgeNarrativeChoiceRequestSchema,
  Civ7ControllerBridgeDiplomacyResponseRequestSchema,
  Civ7ControllerBridgeUnitTargetActionRequestSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema,
  Civ7ControllerBridgeProgressionCultureChoiceRequestSchema,
]);
export type Civ7ControllerBridgeRequest =
  | Civ7ControllerBridgeReadinessCurrentRequest
  | Civ7ControllerBridgeAttentionCurrentRequest
  | Civ7ControllerBridgeNotificationDismissRequest
  | Civ7ControllerBridgeTurnCompleteRequest
  | Civ7ControllerBridgeCityProductionChoiceRequest
  | Civ7ControllerBridgeCityPopulationPlacementRequest
  | Civ7ControllerBridgeNarrativeChoiceRequest
  | Civ7ControllerBridgeDiplomacyResponseRequest
  | Civ7ControllerBridgeUnitTargetActionRequest
  | Civ7ControllerBridgeProgressionTechnologyChoiceRequest
  | Civ7ControllerBridgeProgressionCultureChoiceRequest;

export const Civ7ControllerBridgeErrorSchema = Type.Object(
  {
    code: Type.String({ minLength: 1 }),
    message: Type.String({ minLength: 1 }),
    reason: Type.Union([
      Type.Literal("invalid-envelope"),
      Type.Literal("procedure-not-allowed"),
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

export const Civ7ControllerBridgeSuccessResponseSchema = Type.Union([
  Civ7ControllerBridgeReadinessCurrentSuccessResponseSchema,
  Civ7ControllerBridgeAttentionCurrentSuccessResponseSchema,
  Civ7ControllerBridgeNotificationDismissSuccessResponseSchema,
  Civ7ControllerBridgeTurnCompleteSuccessResponseSchema,
  Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema,
  Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema,
  Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema,
  Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema,
  Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema,
]);
export type Civ7ControllerBridgeSuccessResponse =
  | Civ7ControllerBridgeReadinessCurrentSuccessResponse
  | Civ7ControllerBridgeAttentionCurrentSuccessResponse
  | Civ7ControllerBridgeNotificationDismissSuccessResponse
  | Civ7ControllerBridgeTurnCompleteSuccessResponse
  | Civ7ControllerBridgeCityProductionChoiceSuccessResponse
  | Civ7ControllerBridgeCityPopulationPlacementSuccessResponse
  | Civ7ControllerBridgeNarrativeChoiceSuccessResponse
  | Civ7ControllerBridgeDiplomacyResponseSuccessResponse
  | Civ7ControllerBridgeUnitTargetActionSuccessResponse
  | Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponse
  | Civ7ControllerBridgeProgressionCultureChoiceSuccessResponse;

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
    const approval = isControllerBridgeMutationRequest(request)
      ? request.approval
      : context.approval;
    const client = createCiv7ControlOrpcServerClient({
      ...context,
      approval,
      correlation: request.correlationId == null
        ? context.correlation
        : {
            ...context.correlation,
            correlationId: request.correlationId,
          },
    });
    if (request.procedureKey === "readiness.current") {
      const output = await client.readiness.current(request.input);
      return {
        ok: true,
        procedureKey: "readiness.current",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "notifications.dismiss.request") {
      const output = await client.notifications.dismiss.request(request.input);
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
      const output = await client.turn.complete.request(request.input);
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
      const output = await client.city.production.choice.request(request.input);
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
      const output = await client.city.population.place.request(request.input);
      return {
        ok: true,
        procedureKey: "city.population.place.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "narrative.choice.request") {
      const output = await client.narrative.choice.request(request.input);
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
      const output = await client.diplomacy.response.request(request.input);
      return {
        ok: true,
        procedureKey: "diplomacy.response.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "unit.target.action.request") {
      const output = await client.unit.target.action.request(request.input);
      return {
        ok: true,
        procedureKey: "unit.target.action.request",
        output,
        ...(request.correlationId == null
          ? {}
          : { correlationId: request.correlationId }),
      };
    }

    if (request.procedureKey === "progression.technology.choice.request") {
      const output = await client.progression.technology.choice.request(
        request.input,
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
        request.input,
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

    const output = await client.attention.current(request.input);
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
    && request.procedureKey !== "notifications.dismiss.request"
    && request.procedureKey !== "turn.complete.request"
    && request.procedureKey !== "city.production.choice.request"
    && request.procedureKey !== "city.population.place.request"
    && request.procedureKey !== "narrative.choice.request"
    && request.procedureKey !== "diplomacy.response.request"
    && request.procedureKey !== "unit.target.action.request"
    && request.procedureKey !== "progression.technology.choice.request"
    && request.procedureKey !== "progression.culture.choice.request";
}

function isControllerBridgeMutationRequest(
  request: Civ7ControllerBridgeRequest,
): request is
  | Civ7ControllerBridgeNotificationDismissRequest
  | Civ7ControllerBridgeTurnCompleteRequest
  | Civ7ControllerBridgeCityProductionChoiceRequest
  | Civ7ControllerBridgeCityPopulationPlacementRequest
  | Civ7ControllerBridgeNarrativeChoiceRequest
  | Civ7ControllerBridgeDiplomacyResponseRequest
  | Civ7ControllerBridgeUnitTargetActionRequest
  | Civ7ControllerBridgeProgressionTechnologyChoiceRequest
  | Civ7ControllerBridgeProgressionCultureChoiceRequest {
  return request.procedureKey === "notifications.dismiss.request"
    || request.procedureKey === "turn.complete.request"
    || request.procedureKey === "city.production.choice.request"
    || request.procedureKey === "city.population.place.request"
    || request.procedureKey === "narrative.choice.request"
    || request.procedureKey === "diplomacy.response.request"
    || request.procedureKey === "unit.target.action.request"
    || request.procedureKey === "progression.technology.choice.request"
    || request.procedureKey === "progression.culture.choice.request";
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
