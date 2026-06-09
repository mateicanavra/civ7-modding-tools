import { governmentChoiceProofPostcondition } from "@civ7/direct-control/proof/government-choice-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcGovernmentChoiceResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7GovernmentCelebrationChoiceInput,
  Civ7GovernmentCelebrationChoiceResult,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceResult,
} from "../contract";

type GovernmentChoiceSource =
  | "government.choice.request"
  | "government.celebration.choice.request";
type GovernmentChoiceResult =
  | Civ7GovernmentChoiceResult
  | Civ7GovernmentCelebrationChoiceResult;
type GovernmentChoiceRuntimeInput =
  | (Civ7GovernmentChoiceInput & Readonly<{ playerId: number }>)
  | (Civ7GovernmentCelebrationChoiceInput & Readonly<{ playerId: number }>);

export const governmentChoiceRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.government.choice.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    const source = "government.choice.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          governmentType: input.governmentType,
          ...(input.action === undefined ? {} : { action: input.action }),
        };
        const result = await context.directControl.requestCiv7GovernmentChoice(
          requestInput,
          context.endpointDefaults,
        );
        return governmentChoiceResult(source, requestInput, result);
      },
      catch: () =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const governmentCelebrationChoiceRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.government.celebration.choice.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    const source = "government.celebration.choice.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          goldenAgeType: input.goldenAgeType,
        };
        const result = await context.directControl.requestCiv7CelebrationChoice(
          requestInput,
          context.endpointDefaults,
        );
        return governmentChoiceResult(source, requestInput, result);
      },
      catch: () =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: {
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

function governmentChoiceResult(
  source: "government.choice.request",
  input: Civ7GovernmentChoiceInput & Readonly<{ playerId: number }>,
  result: Civ7ControlOrpcGovernmentChoiceResult,
): Civ7GovernmentChoiceResult;
function governmentChoiceResult(
  source: "government.celebration.choice.request",
  input: Civ7GovernmentCelebrationChoiceInput & Readonly<{ playerId: number }>,
  result: Civ7ControlOrpcGovernmentChoiceResult,
): Civ7GovernmentCelebrationChoiceResult;
function governmentChoiceResult(
  source: GovernmentChoiceSource,
  input: GovernmentChoiceRuntimeInput,
  result: Civ7ControlOrpcGovernmentChoiceResult,
): GovernmentChoiceResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: governmentChoiceProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason: "The government-domain choice result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source,
    inspectKind: "inspect-government-choice",
    inspectLabel: "Inspect current government or celebration choice state before attempting another request.",
    doNotRepeatLabel: "Do not repeat this government-domain choice request until fresh attention evidence is read.",
  });

  const base = {
    playerId: result.playerId,
    sent: result.sent,
    status: projection.status as GovernmentChoiceResult["status"],
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as GovernmentChoiceResult["postcondition"],
    nextSteps: projection.nextSteps as GovernmentChoiceResult["nextSteps"],
  };

  if (
    source === "government.choice.request"
    && "governmentType" in input
    && result.kind === "government"
  ) {
    return {
      ...base,
      governmentType: result.governmentType,
      action: result.action,
    } as Civ7GovernmentChoiceResult;
  }

  if ("goldenAgeType" in input && result.kind === "celebration") {
    return {
      ...base,
      goldenAgeType: result.goldenAgeType,
    } as Civ7GovernmentCelebrationChoiceResult;
  }

  throw new Error("invalid government-domain choice projection");
}
