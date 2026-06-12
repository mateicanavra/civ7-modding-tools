import { progressionPlayerChoiceProofPostcondition } from "@civ7/direct-control/proof/progression-player-choice-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcProgressionPlayerChoiceResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7ProgressionAttributePurchaseInput,
  Civ7ProgressionAttributePurchaseResult,
  Civ7ProgressionAttributeReviewResult,
  Civ7ProgressionPlayerReviewInput,
  Civ7ProgressionTraditionChangeInput,
  Civ7ProgressionTraditionChangeResult,
  Civ7ProgressionTraditionReviewResult,
} from "../contract";

type ProgressionPlayerChoiceSource =
  | "progression.attribute.purchase.request"
  | "progression.attribute.review.request"
  | "progression.tradition.change.request"
  | "progression.tradition.review.request";

type ProgressionPlayerChoiceResult =
  | Civ7ProgressionAttributePurchaseResult
  | Civ7ProgressionAttributeReviewResult
  | Civ7ProgressionTraditionChangeResult
  | Civ7ProgressionTraditionReviewResult;

export const progressionAttributePurchaseRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.progression.attribute.purchase.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    const source = "progression.attribute.purchase.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          node: input.node,
        };
        const result = await context.directControl.requestCiv7AttributePurchase(
          requestInput,
          context.endpointDefaults,
        );
        return progressionPlayerChoiceResult(source, requestInput, result);
      },
      catch: (cause) =>
        errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const progressionAttributeReviewRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.progression.attribute.review.request,
  ).effect(function* ({
    context,
    errors,
  }) {
    const source = "progression.attribute.review.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = { playerId: localPlayerId };
        const result = await context.directControl.requestCiv7AttributeReviewCloseout(
          requestInput,
          context.endpointDefaults,
        );
        return progressionPlayerChoiceResult(source, requestInput, result);
      },
      catch: (cause) =>
        errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const progressionTraditionChangeRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.progression.tradition.change.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    const source = "progression.tradition.change.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          traditionType: input.traditionType,
          action: input.action,
        };
        const result = await context.directControl.requestCiv7TraditionChange(
          requestInput,
          context.endpointDefaults,
        );
        return progressionPlayerChoiceResult(source, requestInput, result);
      },
      catch: (cause) =>
        errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const progressionTraditionReviewRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.progression.tradition.review.request,
  ).effect(function* ({
    context,
    errors,
  }) {
    const source = "progression.tradition.review.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = { playerId: localPlayerId };
        const result = await context.directControl.requestCiv7TraditionReviewCloseout(
          requestInput,
          context.endpointDefaults,
        );
        return progressionPlayerChoiceResult(source, requestInput, result);
      },
      catch: (cause) =>
        errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

async function readLocalPlayerId(
  context: Civ7ControlOrpcContext,
): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(
    context.endpointDefaults,
  );
  return view.localPlayerId;
}

function progressionPlayerChoiceResult(
  source: "progression.attribute.purchase.request",
  input: Civ7ProgressionAttributePurchaseInput,
  result: Civ7ControlOrpcProgressionPlayerChoiceResult,
): Civ7ProgressionAttributePurchaseResult;
function progressionPlayerChoiceResult(
  source: "progression.attribute.review.request",
  input: Civ7ProgressionPlayerReviewInput,
  result: Civ7ControlOrpcProgressionPlayerChoiceResult,
): Civ7ProgressionAttributeReviewResult;
function progressionPlayerChoiceResult(
  source: "progression.tradition.change.request",
  input: Civ7ProgressionTraditionChangeInput,
  result: Civ7ControlOrpcProgressionPlayerChoiceResult,
): Civ7ProgressionTraditionChangeResult;
function progressionPlayerChoiceResult(
  source: "progression.tradition.review.request",
  input: Civ7ProgressionPlayerReviewInput,
  result: Civ7ControlOrpcProgressionPlayerChoiceResult,
): Civ7ProgressionTraditionReviewResult;
function progressionPlayerChoiceResult(
  source: ProgressionPlayerChoiceSource,
  input:
    | Civ7ProgressionAttributePurchaseInput
    | Civ7ProgressionPlayerReviewInput
    | Civ7ProgressionTraditionChangeInput,
  result: Civ7ControlOrpcProgressionPlayerChoiceResult,
): ProgressionPlayerChoiceResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: progressionPlayerChoiceProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason: "The progression player-choice result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source,
    inspectKind: source.includes("attribute")
      ? "inspect-progression-attribute"
      : "inspect-progression-tradition",
    inspectLabel: source.includes("attribute")
      ? "Inspect current attribute review state before attempting another request."
      : "Inspect current tradition review state before attempting another request.",
    doNotRepeatLabel: "Do not repeat this progression player-choice request until fresh attention evidence is read.",
  });

  const base = {
    playerId: result.playerId,
    sent: result.sent,
    status: projection.status as ProgressionPlayerChoiceResult["status"],
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as ProgressionPlayerChoiceResult["postcondition"],
    nextSteps: projection.nextSteps as ProgressionPlayerChoiceResult["nextSteps"],
  };

  if (
    source === "progression.attribute.purchase.request"
    && "node" in input
    && result.kind === "attribute-purchase"
  ) {
    return {
      ...base,
      node: result.node,
    } as Civ7ProgressionAttributePurchaseResult;
  }

  if (source === "progression.attribute.review.request") {
    return base as Civ7ProgressionAttributeReviewResult;
  }

  if (
    source === "progression.tradition.change.request"
    && "traditionType" in input
    && result.kind === "tradition-change"
  ) {
    return {
      ...base,
      traditionType: result.traditionType,
      action: result.action,
    } as Civ7ProgressionTraditionChangeResult;
  }

  if (source === "progression.tradition.review.request") {
    return base as Civ7ProgressionTraditionReviewResult;
  }

  throw new Error("invalid progression player-choice projection");
}
