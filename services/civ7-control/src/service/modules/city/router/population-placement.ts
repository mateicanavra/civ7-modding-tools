import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCityExpansionCheckResult,
  Civ7ControlOrpcCityExpansionSendResult,
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcWorkerAssignmentCheckResult,
  Civ7ControlOrpcWorkerAssignmentSendResult,
  Civ7ControlOrpcWorkerAssignmentSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7CityPopulationPlacementCheckResult,
  Civ7CityPopulationPlacementInput,
  Civ7CityPopulationPlacementResult,
} from "../contract";
import {
  pollCityExpansionPostcondition,
  pollWorkerAssignmentPostcondition,
} from "../model/policy/population-placement-polling";
import {
  type Civ7PopulationPlacementPostconditionEvidence,
  cityExpansionAvailable,
  civ7PopulationPlacementPostcondition,
  workerAssignmentAvailable,
} from "../model/policy/population-placement-postcondition";
import { module } from "../module";

const DEFAULT_POPULATION_PLACEMENT_WAIT_MS = 3_000;
const MIN_POPULATION_PLACEMENT_WAIT_MS = 1_000;
const MAX_POPULATION_PLACEMENT_WAIT_MS = 6_000;

/** Service-owned population-placement availability, dispatch, and observation procedures. */
export const populationPlace = {
  check: module.population.place.check.effect(function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: () => populationPlacementCheck(input, context),
      catch: (cause) =>
        errors.POPULATION_PLACEMENT_UNAVAILABLE({
          data: populationPlacementUnavailableData("city.population.place.check", cause, context),
        }),
    });
  }),
  request: civ7ControlOrpcMutationProcedure(module.population.place.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    const waitMs = populationPlacementWaitMs(context.endpointDefaults?.timeoutMs);
    if (input.mode === "assign-worker") {
      return yield* workerAssignmentRequest({
        input,
        waitMs,
        check: (timeoutMs) =>
          context.directControl.checkCiv7WorkerAssignment(
            { location: input.location },
            directControlOptions(context, timeoutMs)
          ),
        send: () =>
          context.directControl.sendCiv7WorkerAssignment(
            { location: input.location },
            context.endpointDefaults
          ),
        onPrecheckFailure: (cause) =>
          errors.POPULATION_PLACEMENT_UNAVAILABLE({
            data: populationPlacementUnavailableData(
              "city.population.place.request",
              cause,
              context
            ),
          }),
      });
    }
    return yield* cityExpansionRequest({
      input,
      waitMs,
      check: (timeoutMs) =>
        context.directControl.checkCiv7CityExpansion(
          { cityId: input.cityId, destination: input.destination },
          directControlOptions(context, timeoutMs)
        ),
      send: () =>
        context.directControl.sendCiv7CityExpansion(
          { cityId: input.cityId, destination: input.destination },
          context.endpointDefaults
        ),
      onPrecheckFailure: (cause) =>
        errors.POPULATION_PLACEMENT_UNAVAILABLE({
          data: populationPlacementUnavailableData("city.population.place.request", cause, context),
        }),
    });
  }),
};

async function populationPlacementCheck(
  input: Civ7CityPopulationPlacementInput,
  context: Civ7ControlOrpcContext
): Promise<Civ7CityPopulationPlacementCheckResult> {
  if (input.mode === "assign-worker") {
    const check = await context.directControl.checkCiv7WorkerAssignment(
      { location: input.location },
      context.endpointDefaults
    );
    return {
      placement: workerPlacementSummary(input, check.snapshot),
      available: workerAssignmentAvailable(input, check),
    };
  }
  const check = await context.directControl.checkCiv7CityExpansion(
    { cityId: input.cityId, destination: input.destination },
    context.endpointDefaults
  );
  return {
    placement: expansionPlacementSummary(input),
    available: cityExpansionAvailable(input, check),
  };
}

function workerAssignmentRequest<E>(
  options: Readonly<{
    input: Extract<Civ7CityPopulationPlacementInput, { mode: "assign-worker" }>;
    waitMs: number;
    check: (timeoutMs?: number) => Promise<Civ7ControlOrpcWorkerAssignmentCheckResult>;
    send: () => Promise<Civ7ControlOrpcWorkerAssignmentSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7CityPopulationPlacementResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => options.check(),
      catch: options.onPrecheckFailure,
    });
    const placement = workerPlacementSummary(options.input, precheck.snapshot);
    if (!workerAssignmentAvailable(options.input, precheck)) {
      return populationPlacementResult(placement, "not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptPopulationPlacementSend(options.send).pipe(
      Effect.uninterruptible
    );
    if (!sendAttempt.ok) {
      const dispatchState = populationPlacementDispatchState(sendAttempt.dispatchStatus);
      return populationPlacementResult(
        placement,
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    const attemptedPlacement = workerPlacementSummary(options.input, sendAttempt.value.before);
    if (!sendAttempt.value.sent) {
      return populationPlacementResult(attemptedPlacement, "not-sent", { kind: "not-sent" });
    }

    const evidence = yield* pollWorkerAssignmentPostcondition({
      input: options.input,
      send: sendAttempt.value,
      check: (timeoutMs) => options.check(timeoutMs),
      waitMs: options.waitMs,
    });
    return populationPlacementResult(attemptedPlacement, "sent", evidence);
  });
}

function cityExpansionRequest<E>(
  options: Readonly<{
    input: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>;
    waitMs: number;
    check: (timeoutMs?: number) => Promise<Civ7ControlOrpcCityExpansionCheckResult>;
    send: () => Promise<Civ7ControlOrpcCityExpansionSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7CityPopulationPlacementResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => options.check(),
      catch: options.onPrecheckFailure,
    });
    const placement = expansionPlacementSummary(options.input);
    if (!cityExpansionAvailable(options.input, precheck)) {
      return populationPlacementResult(placement, "not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptPopulationPlacementSend(options.send).pipe(
      Effect.uninterruptible
    );
    if (!sendAttempt.ok) {
      const dispatchState = populationPlacementDispatchState(sendAttempt.dispatchStatus);
      return populationPlacementResult(
        placement,
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    if (!sendAttempt.value.sent) {
      return populationPlacementResult(placement, "not-sent", { kind: "not-sent" });
    }

    const evidence = yield* pollCityExpansionPostcondition({
      input: options.input,
      send: sendAttempt.value,
      check: (timeoutMs) => options.check(timeoutMs),
      waitMs: options.waitMs,
    });
    return populationPlacementResult(placement, "sent", evidence);
  });
}

type PlacementSummary = Civ7CityPopulationPlacementResult["placement"];
type PopulationPlacementDispatchState = "not-sent" | "sent" | "unknown";

function populationPlacementResult(
  placement: PlacementSummary,
  dispatchState: PopulationPlacementDispatchState,
  evidence: Civ7PopulationPlacementPostconditionEvidence
): Civ7CityPopulationPlacementResult {
  const postcondition = civ7PopulationPlacementPostcondition(evidence);
  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("A population placement that was not sent must report not-sent.");
    }
    return {
      placement,
      status: "not-sent",
      postcondition,
      nextSteps: inspectPopulationPlacementNextSteps(),
    };
  }
  if (dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown population dispatch must report missing postcondition evidence.");
    }
    return {
      placement,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: noRepeatPopulationPlacementNextSteps(),
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A sent population placement cannot report not-sent.");
  }
  if (postcondition.classification === "worker-assignment-confirmed") {
    if (placement.mode !== "assign-worker") {
      throw new Error("Worker-assignment confirmation requires a worker placement identity.");
    }
    return {
      placement,
      status: "sent-confirmed",
      postcondition,
      nextSteps: refreshPopulationPlacementNextSteps(),
    };
  }
  if (postcondition.classification === "city-expansion-confirmed") {
    if (placement.mode !== "expand-city") {
      throw new Error("City-expansion confirmation requires an expansion placement identity.");
    }
    return {
      placement,
      status: "sent-confirmed",
      postcondition,
      nextSteps: refreshPopulationPlacementNextSteps(),
    };
  }
  return {
    placement,
    status: "sent-unverified",
    postcondition,
    nextSteps: noRepeatPopulationPlacementNextSteps(),
  };
}

function workerPlacementSummary(
  input: Extract<Civ7CityPopulationPlacementInput, { mode: "assign-worker" }>,
  snapshot: Civ7ControlOrpcWorkerAssignmentSnapshot
): Extract<PlacementSummary, { mode: "assign-worker" }> {
  return {
    mode: "assign-worker",
    playerId: snapshot.localPlayerId,
    cityId: snapshot.candidateCityId,
    location: input.location,
  };
}

function expansionPlacementSummary(
  input: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>
): Extract<PlacementSummary, { mode: "expand-city" }> {
  return {
    mode: "expand-city",
    cityId: input.cityId,
    destination: input.destination,
  };
}

type PopulationPlacementSendAttempt<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptPopulationPlacementSend<T extends Readonly<{ sent: boolean }>>(
  send: () => Promise<T>
): Effect.Effect<PopulationPlacementSendAttempt<T>> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return {
        ok: false,
        dispatchStatus: civ7DirectControlDispatchStatus(cause),
      };
    }
  });
}

function populationPlacementDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): Exclude<PopulationPlacementDispatchState, "sent"> {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function inspectPopulationPlacementNextSteps(): Extract<
  Civ7CityPopulationPlacementResult,
  { status: "not-sent" }
>["nextSteps"] {
  return [
    {
      kind: "inspect-population-placement",
      source: "city.population.place.request",
      label: "Inspect exact population placement availability before attempting another request.",
    },
  ];
}

function noRepeatPopulationPlacementNextSteps(): Extract<
  Civ7CityPopulationPlacementResult,
  { status: "dispatch-unknown" | "sent-unverified" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "city.population.place.request",
      label:
        "Do not repeat this population placement until fresh target-specific evidence is read.",
    },
  ];
}

function refreshPopulationPlacementNextSteps(): Extract<
  Civ7CityPopulationPlacementResult,
  { status: "sent-confirmed" }
>["nextSteps"] {
  return [
    {
      kind: "refresh-attention",
      source: "city.population.place.request",
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}

function populationPlacementUnavailableData(
  procedureKey: "city.population.place.check" | "city.population.place.request",
  cause: unknown,
  context: Civ7ControlOrpcContext
) {
  const source: "direct-control-facade" = "direct-control-facade";
  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}

function directControlOptions(context: Civ7ControlOrpcContext, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}

function populationPlacementWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_POPULATION_PLACEMENT_WAIT_MS,
    Math.max(MIN_POPULATION_PLACEMENT_WAIT_MS, timeoutMs ?? DEFAULT_POPULATION_PLACEMENT_WAIT_MS)
  );
}
