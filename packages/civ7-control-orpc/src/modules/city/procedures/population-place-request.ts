import { populationPlacementProofPostcondition } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7MutationNextSteps,
  civ7MutationRequestStatus,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7CityPopulationPlacementInput,
  Civ7CityPopulationPlacementResult,
} from "../contract";

type Civ7ControlOrpcPopulationPlacementRuntimeResult = Awaited<
  ReturnType<
    Civ7ControlOrpcContext["directControl"]["requestCiv7PlayerOperation"]
  >
>;

const cityPopulationPlaceRequestWithApproval =
  civ7ControlOrpcImplementer.city.population.place.request.use(
    civ7MutationApprovalMiddleware,
  );

export const cityPopulationPlaceRequestProcedure =
  cityPopulationPlaceRequestWithApproval.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = input.mode === "assign-worker"
          ? await context.directControl.requestCiv7PlayerOperation(
            {
              playerId: input.playerId,
              operationType: "ASSIGN_WORKER",
              args: {
                Location: input.location,
                Amount: 1,
              },
            },
            context.endpointDefaults,
            context.approval,
          )
          : await context.directControl.requestCiv7CityCommand(
            {
              cityId: input.cityId,
              operationType: "EXPAND",
              args: {
                X: input.destination.x,
                Y: input.destination.y,
              },
            },
            context.endpointDefaults,
            context.approval,
          );
        return cityPopulationPlacementResult(input, result);
      },
      catch: () =>
        errors.POPULATION_PLACEMENT_UNAVAILABLE({
          data: {
            procedureKey: "city.population.place.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function cityPopulationPlacementResult(
  input: Civ7CityPopulationPlacementInput,
  result: Civ7ControlOrpcPopulationPlacementRuntimeResult,
): Civ7CityPopulationPlacementResult {
  const postcondition = cityPopulationPlacementPostconditionSummary(result);
  const status = civ7MutationRequestStatus({
    sent: result.sent,
    postcondition,
  });

  return {
    placement: cityPopulationPlacementSummary(input),
    sent: result.sent,
    status,
    validation: {
      beforeValid: result.before.valid,
      afterValid: result.after.valid,
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "city.population.place.request",
      inspectKind: "inspect-population-placement",
      inspectLabel: "Inspect ready-city population placement evidence before attempting another placement request.",
      doNotRepeatLabel: "Do not repeat this population placement request until fresh city readiness evidence is read.",
    }),
  };
}

function cityPopulationPlacementSummary(
  input: Civ7CityPopulationPlacementInput,
): Civ7CityPopulationPlacementResult["placement"] {
  if (input.mode === "assign-worker") {
    return {
      mode: "assign-worker",
      playerId: input.playerId,
      location: input.location,
    };
  }

  return {
    mode: "expand-city",
    cityId: input.cityId,
    destination: {
      x: input.destination.x,
      y: input.destination.y,
    },
  };
}

function cityPopulationPlacementPostconditionSummary(
  result: Civ7ControlOrpcPopulationPlacementRuntimeResult,
): Civ7CityPopulationPlacementResult["postcondition"] {
  const sourcePostcondition = result.populationPostcondition;
  const postcondition = populationPlacementProofPostcondition(result, undefined);

  if (postcondition == null) {
    return {
      classification: "not-sent",
      reason: "The population placement request was not sent and did not include population-placement postcondition evidence.",
      outcome: "not-sent",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
      readyCleared: sourcePostcondition?.readyCleared ?? null,
      placementStateChanged: sourcePostcondition?.placementStateChanged ?? null,
    };
  }

  const confidence = postcondition.confidence === "pending-runtime-proof"
    ? "unverified"
    : postcondition.confidence;

  return {
    classification: postcondition.classification as
      Civ7CityPopulationPlacementResult["postcondition"]["classification"],
    reason: postcondition.reason,
    outcome: postcondition.outcome as
      Civ7CityPopulationPlacementResult["postcondition"]["outcome"],
    confidence,
    confirmed: confidence === "confirmed",
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
    readyCleared: sourcePostcondition?.readyCleared ?? null,
    placementStateChanged: sourcePostcondition?.placementStateChanged ?? null,
  };
}
