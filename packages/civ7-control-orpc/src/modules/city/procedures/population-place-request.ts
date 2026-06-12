import { populationPlacementProofPostcondition } from "@civ7/direct-control/proof/population-placement-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
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
    Civ7ControlOrpcContext["directControl"]["requestCiv7AssignWorkerPlacement"]
  >
>;
type Civ7CityPopulationPlacementRuntimeInput =
  | Readonly<{ mode: "assign-worker"; playerId: number; location: number }>
  | Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>;

export const cityPopulationPlaceRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.city.population.place.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const runtimeInput = input.mode === "assign-worker"
          ? {
              mode: "assign-worker",
              playerId: await readLocalPlayerId(context),
              location: input.location,
            } as const
          : input;
        const result = runtimeInput.mode === "assign-worker"
          ? await context.directControl.requestCiv7AssignWorkerPlacement(
            {
              playerId: runtimeInput.playerId,
              location: runtimeInput.location,
            },
            context.endpointDefaults,
          )
          : await context.directControl.requestCiv7ExpandCityPlacement(
            {
              cityId: runtimeInput.cityId,
              destination: runtimeInput.destination,
            },
            context.endpointDefaults,
          );
        return cityPopulationPlacementResult(runtimeInput, result);
      },
      catch: (cause) =>
        errors.POPULATION_PLACEMENT_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "city.population.place.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function cityPopulationPlacementResult(
  input: Civ7CityPopulationPlacementRuntimeInput,
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
  input: Civ7CityPopulationPlacementRuntimeInput,
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

async function readLocalPlayerId(
  context: Civ7ControlOrpcContext,
): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(
    context.endpointDefaults,
  );
  return view.localPlayerId;
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
