import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7PopulationPlacementUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";

const cityId = { owner: 0, id: 196_610, type: 1 };
const destination = { x: 16, y: 19 };
type PopulationPlacementRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcContext["directControl"]["requestCiv7AssignWorkerPlacement"]>
>;

describe("city.population.place.request control-oRPC procedure", () => {
  test("maps assign-worker placement to the semantic population runtime port ", async () => {
    const fake = fakeContext(operationRequestResult("population-ready-cleared", "assign-worker"));

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location: 2543 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      placement: {
        mode: "assign-worker",
        playerId: 0,
        location: 2543,
      },
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "population-ready-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        readyCleared: true,
        placementStateChanged: true,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.population.place.request",
        },
      ],
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("Game.CityCommands");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"verified"');
    expect(fake.calls).toEqual([
      {
        method: "getCiv7PlayNotificationView",
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
      {
        method: "requestCiv7AssignWorkerPlacement",
        input: {
          playerId: 0,
          location: 2543,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("uses live local-player evidence instead of caller player input for assign-worker sends", async () => {
    const fake = fakeContext(operationRequestResult("population-ready-cleared", "assign-worker"), {
      localPlayerId: 2,
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location: 2543 },
      { context: fake.context }
    );

    expect(result.placement).toEqual({
      mode: "assign-worker",
      playerId: 2,
      location: 2543,
    });
    expect(fake.calls).toContainEqual({
      method: "requestCiv7AssignWorkerPlacement",
      input: {
        playerId: 2,
        location: 2543,
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    });
  });

  test("maps expand-city placement to the semantic population runtime port through the server-side router client", async () => {
    const fake = fakeContext(operationRequestResult("population-ready-cleared", "expand-city"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.population.place.request({
      mode: "expand-city",
      cityId,
      destination,
    });

    expect(result).toMatchObject({
      placement: {
        mode: "expand-city",
        cityId,
        destination,
      },
      status: "sent-confirmed",
    });
    expect(fake.calls).toEqual([
      {
        method: "requestCiv7ExpandCityPlacement",
        input: {
          cityId,
          destination,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("keeps state-changed placement proof no-repeat guarded", async () => {
    const fake = fakeContext(operationRequestResult("placement-state-changed", "assign-worker"));

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location: 2543 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-guarded",
      postcondition: {
        classification: "placement-state-changed",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
        readyCleared: false,
        placementStateChanged: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.population.place.request",
        },
      ],
    });
  });

  test("keeps validation-only and missing-postcondition sends no-repeat guarded", async () => {
    for (const resultOrError of [
      operationRequestResult("validation-changed", "assign-worker", {
        verified: true,
      }),
      operationRequestResult("population-ready-cleared", "assign-worker", {
        includePostcondition: false,
        verified: true,
      }),
    ]) {
      const fake = fakeContext(resultOrError);

      const result = await call(
        Civ7ControlOrpcRouter.city.population.place.request,
        { mode: "assign-worker", location: 2543 },
        { context: fake.context }
      );

      expect(result).toMatchObject({
        sent: true,
        status: "sent-unverified",
        postcondition: {
          confidence: "unverified",
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
    }
  });

  test("projects validator-blocked placement as not-sent", async () => {
    const fake = fakeContext(
      operationRequestResult("not-sent", "assign-worker", {
        beforeValid: false,
        afterValid: false,
        sent: false,
        verified: false,
      })
    );

    const result = await call(
      Civ7ControlOrpcRouter.city.population.place.request,
      { mode: "assign-worker", location: 2543 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        beforeValid: false,
        afterValid: false,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-population-placement",
          source: "city.population.place.request",
        },
      ],
    });
  });

  test("keeps endpoint, session, operation, and raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { mode: "assign-worker", location: 2543, host: "127.0.0.1" },
      { mode: "assign-worker", location: 2543, port: 4318 },
      { mode: "assign-worker", location: 2543, stateName: "App UI" },
      {
        mode: "assign-worker",
        location: 2543,
        session: { state: "App UI" },
      },
      {
        mode: "assign-worker",
        location: 2543,
        operationType: "ASSIGN_WORKER",
      },
      {
        mode: "assign-worker",
        location: 2543,
        args: { Location: 2543, Amount: 1 },
      },
      {
        mode: "assign-worker",
        location: 2543,
        rawCommand: "Game.PlayerOperations.sendRequest(...)",
      },
      { mode: "assign-worker", playerId: 2, location: 2543 },
      { mode: "assign-worker", location: 2543.5 },
      { mode: "expand-city", cityId, destination: { x: 1.5, y: 19 } },
      { mode: "expand-city", cityId, destination: { x: 16, y: -1 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(operationRequestResult("population-ready-cleared", "assign-worker"));

      await expect(
        call(Civ7ControlOrpcRouter.city.population.place.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps population placement facade failures to a tagged error without raw details", async () => {
    const fake = fakeContext(
      new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:Game.PlayerOperations.sendRequest(...)"
      )
    );

    await expect(
      call(
        Civ7ControlOrpcRouter.city.population.place.request,
        {
          mode: "assign-worker",
          location: 2543,
        },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "POPULATION_PLACEMENT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.population.place.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.city.population.place.request,
        {
          mode: "assign-worker",
          location: 2543,
        },
        { context: fake.context }
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.PlayerOperations");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first city.population.place.request leaf", () => {
    expect(Civ7ControlOrpcContract.city.population.place.request["~orpc"]).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.population.place.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.city.population.place.request["~orpc"].errorMap).toHaveProperty(
      "POPULATION_PLACEMENT_UNAVAILABLE"
    );
    expect(Civ7PopulationPlacementUnavailableError.code).toBe("POPULATION_PLACEMENT_UNAVAILABLE");
  });
});

function fakeContext(
  resultOrError: PopulationPlacementRuntimeResult | Error,
  options: {
    localPlayerId?: number;
  } = {}
): {
  context: Civ7ControlOrpcContext;
  calls: Array<{
    method:
      | "getCiv7PlayNotificationView"
      | "requestCiv7AssignWorkerPlacement"
      | "requestCiv7ExpandCityPlacement";
    input?: unknown;
    options: unknown;
  }>;
} {
  const calls: Array<{
    method:
      | "getCiv7PlayNotificationView"
      | "requestCiv7AssignWorkerPlacement"
      | "requestCiv7ExpandCityPlacement";
    input?: unknown;
    options: unknown;
  }> = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7PlayableStatus: async () => ({
          playable: true,
          readiness: "tuner-ready",
        }),
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.push({
            method: "getCiv7PlayNotificationView",
            options: endpointDefaults,
          });
          return { localPlayerId: options.localPlayerId ?? 0 };
        },
        requestCiv7AssignWorkerPlacement: async (input, endpointDefaults) => {
          calls.push({
            method: "requestCiv7AssignWorkerPlacement",
            input,
            options: endpointDefaults,
          });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
        requestCiv7ExpandCityPlacement: async (input, endpointDefaults) => {
          calls.push({
            method: "requestCiv7ExpandCityPlacement",
            input,
            options: endpointDefaults,
          });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
    calls,
  };
}

function operationRequestResult(
  classification: NonNullable<
    PopulationPlacementRuntimeResult["populationPostcondition"]
  >["classification"],
  mode: "assign-worker" | "expand-city",
  options: {
    beforeValid?: boolean;
    afterValid?: boolean;
    includePostcondition?: boolean;
    sent?: boolean;
    verified?: boolean;
  } = {}
): PopulationPlacementRuntimeResult {
  const sent = options.sent ?? classification !== "not-sent";
  const family = mode === "expand-city" ? "city-command" : "player-operation";
  const operationType = mode === "expand-city" ? "EXPAND" : "ASSIGN_WORKER";
  const target = mode === "expand-city" ? { cityId } : { playerId: 0 };
  const args =
    mode === "expand-city" ? { X: destination.x, Y: destination.y } : { Location: 2543, Amount: 1 };
  const includePostcondition = options.includePostcondition ?? true;

  return {
    before: validationResult(family, operationType, target, args, options.beforeValid ?? true),
    command: sent
      ? {
          host: "127.0.0.1",
          port: 4318,
          state: { id: "65535", name: "App UI" },
          output: [
            JSON.stringify({
              sent: true,
              rawCommand:
                mode === "expand-city"
                  ? "Game.CityCommands.sendRequest(...)"
                  : "Game.PlayerOperations.sendRequest(...)",
            }),
          ],
        }
      : undefined,
    after: validationResult(family, operationType, target, args, options.afterValid ?? true),
    sent,
    verified:
      options.verified ??
      (classification === "population-ready-cleared" ||
        classification === "placement-state-changed" ||
        classification === "validation-changed"),
    ...(includePostcondition
      ? {
          populationPostcondition: {
            family,
            operationType,
            classification,
            readyCleared: classification === "population-ready-cleared",
            placementStateChanged:
              classification === "placement-state-changed" ||
              classification === "population-ready-cleared",
            reason: `test ${classification}`,
          },
        }
      : {}),
  } as PopulationPlacementRuntimeResult;
}

function validationResult(
  family: "city-command" | "player-operation",
  operationType: "EXPAND" | "ASSIGN_WORKER",
  target: { cityId: typeof cityId } | { playerId: number },
  args: Record<string, number>,
  valid: boolean
) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family,
    operationType,
    enumValue: operationType,
    target,
    args,
    valid,
    result: {
      raw: "validation-result",
      command: modeCommandName(family),
    },
  };
}

function modeCommandName(family: "city-command" | "player-operation") {
  return family === "city-command"
    ? "Game.CityCommands.canStart(...)"
    : "Game.PlayerOperations.canStart(...)";
}
