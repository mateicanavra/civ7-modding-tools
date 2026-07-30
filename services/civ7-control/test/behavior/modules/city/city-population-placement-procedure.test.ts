import { call } from "@orpc/server";
import { describe, expect, test, vi } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCityExpansionCheckResult,
  Civ7ControlOrpcCityExpansionSendResult,
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcWorkerAssignmentCheckResult,
  Civ7ControlOrpcWorkerAssignmentSendResult,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
};
const cityId = { owner: 0, id: 196_610, type: 1 };
const destination = { x: 16, y: 19 };
const location = 2_543;

describe("city population placement control-oRPC procedures", () => {
  test("publishes separate check and request contract leaves", () => {
    expect(Civ7ControlOrpcContract.city.population.place.check["~orpc"].meta).toMatchObject({
      procedureKey: "city.population.place.check",
      risk: "read-only",
    });
    expect(Civ7ControlOrpcContract.city.population.place.request["~orpc"].meta).toMatchObject({
      procedureKey: "city.population.place.request",
      risk: "mutation",
    });
  });

  test("projects exact worker availability and resolved city evidence", async () => {
    const checkCiv7WorkerAssignment = vi.fn(async () => workerCheck());
    const context = fakeContext({ checkCiv7WorkerAssignment });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.check,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toEqual({
      placement: {
        mode: "assign-worker",
        playerId: 0,
        cityId,
        location,
      },
      available: true,
    });
    expect(checkCiv7WorkerAssignment).toHaveBeenCalledWith({ location }, endpointDefaults);
  });

  test("owns expansion availability instead of trusting validator success alone", async () => {
    const checkCiv7CityExpansion = vi.fn(async () =>
      expansionCheck({
        valid: true,
        snapshot: expansionSnapshot({ candidate: null }),
      })
    );
    const context = fakeContext({ checkCiv7CityExpansion });
    const client = createCiv7ControlOrpcServerClient(context);

    await expect(
      client.city.population.place.check({
        mode: "expand-city",
        cityId,
        destination,
      })
    ).resolves.toEqual({
      placement: {
        mode: "expand-city",
        cityId,
        destination,
      },
      available: false,
    });
  });

  test("does not dispatch expansion when native ownership evidence is unavailable", async () => {
    const checkCiv7CityExpansion = vi.fn(async () =>
      expansionCheck({
        valid: true,
        snapshot: expansionSnapshot({ ownership: { status: "unavailable" } }),
      })
    );
    const sendCiv7CityExpansion = vi.fn(async () => expansionSend());
    const context = fakeContext({
      checkCiv7CityExpansion,
      sendCiv7CityExpansion,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "expand-city", cityId, destination },
      { context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
      },
    });
    expect(sendCiv7CityExpansion).not.toHaveBeenCalled();
  });

  test("fresh-checks, sends once, and confirms only the requested plot NumWorkers increase", async () => {
    const before = workerSnapshot({ numWorkers: 1, isReadyToPlacePopulation: true });
    const after = workerSnapshot({ numWorkers: 2, isReadyToPlacePopulation: false });
    const checkCiv7WorkerAssignment = vi.fn(async () => workerCheck({ snapshot: before }));
    const sendCiv7WorkerAssignment = vi.fn(async () => workerSend({ before, after }));
    const context = fakeContext({
      checkCiv7WorkerAssignment,
      sendCiv7WorkerAssignment,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toMatchObject({
      placement: {
        mode: "assign-worker",
        playerId: 0,
        cityId,
        location,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "worker-assignment-confirmed",
        outcome: "worker-assigned",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.population.place.request",
        },
      ],
    });
    expect(checkCiv7WorkerAssignment).toHaveBeenCalledTimes(1);
    expect(sendCiv7WorkerAssignment).toHaveBeenCalledTimes(1);
    expect(Object.keys(result).sort()).toEqual([
      "nextSteps",
      "placement",
      "postcondition",
      "status",
    ]);
  });

  test("does not treat readiness clearing without a target worker increase as confirmation", async () => {
    const before = workerSnapshot({ numWorkers: 1, isReadyToPlacePopulation: true });
    const after = workerSnapshot({ numWorkers: 1, isReadyToPlacePopulation: false });
    const checkCiv7WorkerAssignment = vi
      .fn(async () => workerCheck({ snapshot: after }))
      .mockResolvedValueOnce(workerCheck({ snapshot: before }));
    const sendCiv7WorkerAssignment = vi.fn(async () => workerSend({ before, after }));
    const context = fakeContext({
      checkCiv7WorkerAssignment,
      sendCiv7WorkerAssignment,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "no-target-state-change",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.population.place.request",
        },
      ],
    });
    expect(sendCiv7WorkerAssignment).toHaveBeenCalledTimes(1);
  });

  test("confirms expansion only when the requested plot becomes owned by the requested city", async () => {
    const before = expansionSnapshot({
      ownership: { status: "unowned" },
      isReadyToPlacePopulation: true,
    });
    const after = expansionSnapshot({
      ownership: { status: "owned", cityId },
      isReadyToPlacePopulation: false,
    });
    const checkCiv7CityExpansion = vi.fn(async () => expansionCheck({ snapshot: before }));
    const sendCiv7CityExpansion = vi.fn(async () => expansionSend({ before, after }));
    const context = fakeContext({
      checkCiv7CityExpansion,
      sendCiv7CityExpansion,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "expand-city", cityId, destination },
      { context }
    );

    expect(result).toMatchObject({
      placement: {
        mode: "expand-city",
        cityId,
        destination,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "city-expansion-confirmed",
        outcome: "city-expanded",
        confidence: "confirmed",
      },
    });
    expect(checkCiv7CityExpansion).toHaveBeenCalledTimes(1);
    expect(sendCiv7CityExpansion).toHaveBeenCalledTimes(1);
  });

  test("polls past unrelated expansion ownership until target-city evidence appears", async () => {
    const before = expansionSnapshot({ ownership: { status: "unowned" } });
    const unrelated = expansionSnapshot({
      ownership: {
        status: "owned",
        cityId: { owner: 0, id: 999_001, type: 1 },
      },
      isReadyToPlacePopulation: false,
    });
    const confirmed = expansionSnapshot({
      ownership: { status: "owned", cityId },
      isReadyToPlacePopulation: false,
    });
    const checkCiv7CityExpansion = vi
      .fn(async () => expansionCheck({ snapshot: confirmed }))
      .mockResolvedValueOnce(expansionCheck({ snapshot: before }));
    const sendCiv7CityExpansion = vi.fn(async () => expansionSend({ before, after: unrelated }));
    const context = fakeContext({
      checkCiv7CityExpansion,
      sendCiv7CityExpansion,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "expand-city", cityId, destination },
      { context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "city-expansion-confirmed",
      },
    });
    expect(checkCiv7CityExpansion).toHaveBeenCalledTimes(2);
    expect(sendCiv7CityExpansion).toHaveBeenCalledTimes(1);
  });

  test("returns not-sent without invoking send when semantic precheck is unavailable", async () => {
    const checkCiv7WorkerAssignment = vi.fn(async () =>
      workerCheck({
        valid: true,
        snapshot: workerSnapshot({ numWorkers: null }),
      })
    );
    const sendCiv7WorkerAssignment = vi.fn(async () => workerSend());
    const context = fakeContext({
      checkCiv7WorkerAssignment,
      sendCiv7WorkerAssignment,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-population-placement",
          source: "city.population.place.request",
        },
      ],
    });
    expect(sendCiv7WorkerAssignment).not.toHaveBeenCalled();
  });

  test("reports the fresh send precheck identity when worker admission changes", async () => {
    const freshCityId = { owner: 0, id: 196_612, type: 1 };
    const freshBefore = workerSnapshot({
      candidateCityId: freshCityId,
      readyCityIds: [freshCityId],
    });
    const checkCiv7WorkerAssignment = vi.fn(async () => workerCheck());
    const sendCiv7WorkerAssignment = vi.fn(
      async (): Promise<Civ7ControlOrpcWorkerAssignmentSendResult> => ({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false },
        },
        before: freshBefore,
        after: freshBefore,
      })
    );
    const context = fakeContext({
      checkCiv7WorkerAssignment,
      sendCiv7WorkerAssignment,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toMatchObject({
      placement: {
        mode: "assign-worker",
        cityId: freshCityId,
      },
      status: "not-sent",
    });
    expect(sendCiv7WorkerAssignment).toHaveBeenCalledTimes(1);
  });

  test("classifies ambiguous send failure as dispatch-unknown with no-repeat guidance", async () => {
    const checkCiv7WorkerAssignment = vi.fn(async () => workerCheck());
    const sendCiv7WorkerAssignment = vi.fn(async () => {
      throw dispatchError("dispatched", "worker assignment response unavailable");
    });
    const context = fakeContext({
      checkCiv7WorkerAssignment,
      sendCiv7WorkerAssignment,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location },
      { context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.population.place.request",
        },
      ],
    });
    expect(sendCiv7WorkerAssignment).toHaveBeenCalledTimes(1);
  });

  test("maps check failures to the tagged service error without raw wire details", async () => {
    const checkCiv7WorkerAssignment = vi.fn(async () => {
      throw new Error("CMD:65535:Game.PlayerOperations.canStart(...)");
    });
    const context = fakeContext({ checkCiv7WorkerAssignment });

    const failure = await captureFailure(() =>
      call(
        Civ7ControlOrpcRouter.city.population.place.check,
        { mode: "assign-worker", location },
        { context }
      )
    );

    expect(failure).toMatchObject({
      code: "POPULATION_PLACEMENT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.population.place.check",
        source: "direct-control-facade",
      },
    });
    expect(JSON.stringify(failure)).not.toContain("CMD");
    expect(JSON.stringify(failure)).not.toContain("Game.PlayerOperations");
  });
});

function fakeContext(
  overrides: Partial<Civ7ControlOrpcContext["directControl"]>
): Civ7ControlOrpcContext {
  return {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult(),
      ...overrides,
    }),
  };
}

function workerSnapshot(
  overrides: Partial<Civ7ControlOrpcWorkerAssignmentCheckResult["snapshot"]> = {}
): Civ7ControlOrpcWorkerAssignmentCheckResult["snapshot"] {
  return {
    localPlayerId: 0,
    location,
    readyCityIds: [cityId],
    candidateCityId: cityId,
    isReadyToPlacePopulation: true,
    placementInfo: {
      PlotIndex: location,
      IsBlocked: false,
      NumWorkers: 1,
    },
    numWorkers: 1,
    ...overrides,
  };
}

function workerCheck(
  overrides: Partial<Civ7ControlOrpcWorkerAssignmentCheckResult> = {}
): Civ7ControlOrpcWorkerAssignmentCheckResult {
  return {
    valid: true,
    result: { Success: true },
    snapshot: workerSnapshot(),
    ...overrides,
  };
}

function workerSend(
  overrides: Partial<Extract<Civ7ControlOrpcWorkerAssignmentSendResult, { sent: true }>> = {}
): Extract<Civ7ControlOrpcWorkerAssignmentSendResult, { sent: true }> {
  return {
    sent: true,
    validation: {
      valid: true,
      result: { Success: true },
    },
    before: workerSnapshot(),
    after: workerSnapshot({ numWorkers: 2 }),
    ...overrides,
  };
}

function expansionSnapshot(
  overrides: Partial<Civ7ControlOrpcCityExpansionCheckResult["snapshot"]> = {}
): Civ7ControlOrpcCityExpansionCheckResult["snapshot"] {
  return {
    localPlayerId: 0,
    cityId,
    destination,
    plotIndex: 999,
    isReadyToPlacePopulation: true,
    candidate: {
      plotIndex: 999,
      constructibleType: 42,
    },
    ownership: { status: "unowned" },
    ...overrides,
  };
}

function expansionCheck(
  overrides: Partial<Civ7ControlOrpcCityExpansionCheckResult> = {}
): Civ7ControlOrpcCityExpansionCheckResult {
  return {
    valid: true,
    result: {
      Plots: [999],
      ConstructibleTypes: [42],
    },
    snapshot: expansionSnapshot(),
    ...overrides,
  };
}

function expansionSend(
  overrides: Partial<Extract<Civ7ControlOrpcCityExpansionSendResult, { sent: true }>> = {}
): Extract<Civ7ControlOrpcCityExpansionSendResult, { sent: true }> {
  return {
    sent: true,
    validation: {
      valid: true,
      result: {
        Plots: [999],
        ConstructibleTypes: [42],
      },
    },
    before: expansionSnapshot(),
    after: expansionSnapshot({ ownership: { status: "owned", cityId } }),
    ...overrides,
  };
}

function dispatchError(
  dispatchStatus: Civ7ControlOrpcCommandDispatchStatus,
  message: string
): Error & { dispatchStatus: Civ7ControlOrpcCommandDispatchStatus } {
  const code: "command-failed" = "command-failed";
  const error = Object.assign(new Error(message), {
    code,
    dispatchStatus,
  });
  error.name = "Civ7DirectControlError";
  return error;
}

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected procedure call to fail");
}
