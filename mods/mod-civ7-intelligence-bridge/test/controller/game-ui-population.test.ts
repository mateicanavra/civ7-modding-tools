import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiPopulationTarget,
  checkCiv7GameUiCityExpansion,
  checkCiv7GameUiWorkerAssignment,
  civ7GameUiPopulationPlacementCheckAvailable,
  civ7GameUiPopulationPlacementSendAvailable,
  sendCiv7GameUiCityExpansion,
  sendCiv7GameUiWorkerAssignment,
} from "../../src/controller/game-ui/population";

const cityId = { owner: 0, id: 196_610, type: 1 };
const location = 2_543;
const destination = { x: 16, y: 19 };
const plotIndex = 1_660;
const constructibleType = 713_967_338;

describe("game UI population-placement atoms", () => {
  test("advertises check and send availability independently", () => {
    const target = populationTarget();
    const workerSend = target.Game?.PlayerOperations?.sendRequest;
    if (target.Game?.PlayerOperations != null) {
      target.Game.PlayerOperations.sendRequest = undefined;
    }

    expect(civ7GameUiPopulationPlacementCheckAvailable(target)).toBe(true);
    expect(civ7GameUiPopulationPlacementSendAvailable(target)).toBe(false);

    if (target.Game?.PlayerOperations != null) {
      target.Game.PlayerOperations.sendRequest = workerSend;
    }
    expect(civ7GameUiPopulationPlacementSendAvailable(target)).toBe(true);
  });

  test("advertises the check procedure without send support or mutation proof", async () => {
    const population = populationTarget();
    if (population.Game?.PlayerOperations != null) {
      population.Game.PlayerOperations.sendRequest = undefined;
    }
    const target: Civ7GameUiRuntimeTarget = {
      Cities: population.Cities,
      CityCommandTypes: population.CityCommandTypes,
      Game: population.Game,
      GameContext: population.GameContext,
      GameplayMap: population.GameplayMap,
      PlayerOperationTypes: population.PlayerOperationTypes,
      Players: population.Players,
    };

    const context = await createCiv7GameUiControllerContextFactory({ target })();
    expect(context.controller.supportedReadProcedures).toContain("city.population.place.check");
    expect(context.controller.supportedMutationProcedures).not.toContain(
      "city.population.place.request"
    );
  });

  test("checks strict ASSIGN_WORKER admission for the ambient player and target candidate", async () => {
    const calls: NativeCall[] = [];
    const target = populationTarget({ calls });

    const result = await checkCiv7GameUiWorkerAssignment({ location }, target);

    expect(result).toEqual({
      valid: true,
      result: { Success: true },
      snapshot: workerSnapshot(true, 0),
    });
    expect(calls).toEqual([
      {
        kind: "worker-check",
        target: 0,
        operationType: "ASSIGN_WORKER",
        args: { Location: location, Amount: 1 },
        queue: false,
      },
    ]);
  });

  test.each([
    { Success: false },
    { success: true },
    true,
  ])("rejects non-exact worker Success evidence: %j", async (workerValidation) => {
    const calls: NativeCall[] = [];
    const target = populationTarget({ calls, workerValidation });
    const result = await sendCiv7GameUiWorkerAssignment({ location }, target);

    expect(result.sent).toBe(false);
    expect(calls.filter((call) => call.kind === "worker-send")).toEqual([]);
  });

  test("treats a nonthrowing false worker send as dispatched and retains NumWorkers evidence", async () => {
    const calls: NativeCall[] = [];
    const target = populationTarget({ calls, workerSendResult: false });

    const result = await sendCiv7GameUiWorkerAssignment({ location }, target);

    expect(result).toEqual({
      sent: true,
      validation: { valid: true, result: { Success: true } },
      before: workerSnapshot(true, 0),
      after: workerSnapshot(false, 1),
    });
    expect(calls.filter((call) => call.kind === "worker-send")).toHaveLength(1);
  });

  test("checks EXPAND with empty args and aligned Plots/ConstructibleTypes evidence", async () => {
    const calls: NativeCall[] = [];
    const target = populationTarget({
      calls,
      expansionValidation: {
        Success: false,
        Plots: [1_659, plotIndex],
        ConstructibleTypes: [42, constructibleType],
      },
    });

    const result = await checkCiv7GameUiCityExpansion({ cityId, destination }, target);

    expect(result).toEqual({
      valid: true,
      result: {
        Success: false,
        Plots: [1_659, plotIndex],
        ConstructibleTypes: [42, constructibleType],
      },
      snapshot: expansionSnapshot(true, {
        plotIndex,
        constructibleType,
      }),
    });
    expect(calls).toEqual([
      {
        kind: "expansion-check",
        target: cityId,
        operationType: "EXPAND",
        args: {},
        queue: false,
      },
    ]);
  });

  test.each([
    undefined,
    {},
    { owner: 0 },
    "malformed",
  ])("keeps malformed expansion ownership unavailable: %j", async (expansionOwnershipBefore) => {
    const target = populationTarget({ expansionOwnershipBefore });
    const result = await checkCiv7GameUiCityExpansion({ cityId, destination }, target);

    expect(result.valid).toBe(false);
    expect(result.snapshot.ownership).toEqual({ status: "unavailable" });
  });

  test.each([
    undefined,
    { owner: 0, id: 999_001, type: 1 },
  ])("refuses EXPAND send without fresh unowned evidence: %j", async (expansionOwnershipBefore) => {
    const calls: NativeCall[] = [];
    const target = populationTarget({ calls, expansionOwnershipBefore });

    const result = await sendCiv7GameUiCityExpansion({ cityId, destination }, target);

    expect(result.sent).toBe(false);
    expect(calls.filter((call) => call.kind === "expansion-send")).toEqual([]);
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked EXPAND return of %j as dispatched", async (expansionSendResult) => {
    const calls: NativeCall[] = [];
    const target = populationTarget({ calls, expansionSendResult });

    const result = await sendCiv7GameUiCityExpansion({ cityId, destination }, target);

    expect(result.sent).toBe(true);
    expect(result.before).toEqual(expansionSnapshot(true, { plotIndex, constructibleType }));
    expect(result.after).toEqual(expansionSnapshot(false, null, { status: "owned", cityId }));
    expect(calls.filter((call) => call.kind === "expansion-send")).toEqual([
      {
        kind: "expansion-send",
        target: cityId,
        operationType: "EXPAND",
        args: { X: destination.x, Y: destination.y },
      },
    ]);
  });

  test("does not dispatch EXPAND without aligned constructible evidence", async () => {
    const calls: NativeCall[] = [];
    const target = populationTarget({
      calls,
      expansionValidation: {
        Plots: [plotIndex],
        ConstructibleTypes: [],
      },
    });

    const result = await sendCiv7GameUiCityExpansion({ cityId, destination }, target);
    expect(result.sent).toBe(false);
    expect(result.before.candidate).toBeNull();
    expect(calls.filter((call) => call.kind === "expansion-send")).toEqual([]);
  });

  test("preserves not-dispatched and dispatched failures with exact send counts", async () => {
    const beforeCalls: NativeCall[] = [];
    const beforeTarget = populationTarget({
      calls: beforeCalls,
      workerValidationError: new Error("worker validation failed"),
    });
    await expect(sendCiv7GameUiWorkerAssignment({ location }, beforeTarget)).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
    expect(beforeCalls.filter((call) => call.kind === "worker-send")).toEqual([]);

    const afterCalls: NativeCall[] = [];
    const afterTarget = populationTarget({
      calls: afterCalls,
      expansionOwnershipReadFailsAfterSend: true,
    });
    await expect(
      sendCiv7GameUiCityExpansion({ cityId, destination }, afterTarget)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "dispatched",
    });
    expect(afterCalls.filter((call) => call.kind === "expansion-send")).toHaveLength(1);
  });
});

type NativeCall = Readonly<{
  kind: "worker-check" | "worker-send" | "expansion-check" | "expansion-send";
  target: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

function populationTarget(
  options: Readonly<{
    calls?: NativeCall[];
    workerValidation?: unknown;
    workerValidationError?: Error;
    workerSendResult?: unknown;
    expansionValidation?: unknown;
    expansionSendResult?: unknown;
    expansionOwnershipBefore?: unknown;
    expansionOwnershipReadFailsAfterSend?: boolean;
  }> = {}
): Civ7GameUiPopulationTarget {
  let sent = false;
  let numWorkers = 0;
  const city = {
    Growth: {
      get isReadyToPlacePopulation() {
        return !sent;
      },
    },
    Workers: {
      GetAllPlacementInfo: () => [
        {
          PlotIndex: location,
          IsBlocked: false,
          NumWorkers: numWorkers,
          MaxWorkers: 2,
        },
      ],
    },
  };
  return {
    Cities: {
      get: () => city,
    },
    CityCommandTypes: {
      EXPAND: "EXPAND",
    },
    Game: {
      PlayerOperations: {
        canStart: (playerId, operationType, args, queue) => {
          options.calls?.push({
            kind: "worker-check",
            target: playerId,
            operationType,
            args,
            queue,
          });
          if (options.workerValidationError) throw options.workerValidationError;
          return options.workerValidation ?? { Success: true };
        },
        sendRequest: (playerId, operationType, args) => {
          options.calls?.push({
            kind: "worker-send",
            target: playerId,
            operationType,
            args,
          });
          sent = true;
          numWorkers += 1;
          return options.workerSendResult;
        },
      },
      CityCommands: {
        canStart: (requestedCityId, operationType, args, queue) => {
          options.calls?.push({
            kind: "expansion-check",
            target: requestedCityId,
            operationType,
            args,
            queue,
          });
          if (sent) return { Success: false, Plots: [], ConstructibleTypes: [] };
          return (
            options.expansionValidation ?? {
              Success: true,
              Plots: [plotIndex],
              ConstructibleTypes: [constructibleType],
            }
          );
        },
        sendRequest: (requestedCityId, operationType, args) => {
          options.calls?.push({
            kind: "expansion-send",
            target: requestedCityId,
            operationType,
            args,
          });
          sent = true;
          return options.expansionSendResult;
        },
      },
    },
    GameContext: {
      localPlayerID: 0,
    },
    GameplayMap: {
      getIndexFromLocation: () => plotIndex,
      getOwningCityFromXY: () => {
        if (sent && options.expansionOwnershipReadFailsAfterSend) {
          throw new Error("ownership read failed");
        }
        if (sent) return cityId;
        return Object.prototype.hasOwnProperty.call(options, "expansionOwnershipBefore")
          ? options.expansionOwnershipBefore
          : null;
      },
    },
    PlayerOperationTypes: {
      ASSIGN_WORKER: "ASSIGN_WORKER",
    },
    Players: {
      get: () => ({
        Cities: {
          getCityIds: () => [cityId],
        },
      }),
    },
  };
}

function workerSnapshot(ready: boolean, numWorkers: number) {
  return {
    localPlayerId: 0,
    location,
    readyCityIds: ready ? [cityId] : [],
    candidateCityId: cityId,
    isReadyToPlacePopulation: ready,
    placementInfo: {
      PlotIndex: location,
      IsBlocked: false,
      NumWorkers: numWorkers,
      MaxWorkers: 2,
    },
    numWorkers,
  };
}

function expansionSnapshot(
  ready: boolean,
  candidate: { plotIndex: number; constructibleType: number } | null,
  ownership:
    | { status: "unowned" }
    | { status: "owned"; cityId: typeof cityId }
    | { status: "unavailable" } = { status: "unowned" }
) {
  return {
    localPlayerId: 0,
    cityId,
    destination,
    plotIndex,
    isReadyToPlacePopulation: ready,
    candidate,
    ownership,
  };
}
