import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7TownFocusUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";

const cityId = { owner: 0, id: 131_073, type: 1 };

type TownFocusRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcContext["directControl"]["requestCiv7TownFocusChange"]>
>;

describe("city.townFocus.*.request control-oRPC procedures", () => {
  test("routes town focus changes through the city-domain service leaf", async () => {
    const fake = fakeContext(townFocusResult("town-focus-change", {
      sent: true,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
      },
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.change).toEqual([{
      input: {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(fake.calls.review).toEqual([]);
    expect(result).toEqual({
      cityId,
      growthType: -284_569_333,
      projectType: -548_685_232,
      city: 131_073,
      sent: true,
      status: "sent-unverified",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "town-focus-change pending runtime proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "city.townFocus.change.request",
        label: "Do not repeat this town focus request until fresh city readiness evidence is read.",
      }],
    });
    expectSemanticTownFocusOmitsRawRuntimeDetails(result);
  });

  test("routes town project review through the server-side router client", async () => {
    const fake = fakeContext(townFocusResult("town-focus-review", {
      sent: false,
      valid: false,
    }));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.townFocus.review.request({ cityId });

    expect(fake.calls.review).toEqual([{
      input: { cityId },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toMatchObject({
      cityId,
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
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "inspect-town-focus",
        source: "city.townFocus.review.request",
      }],
    });
    expect(fake.calls.change).toEqual([]);
  });

  test("keeps endpoint/session/operation/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        host: "127.0.0.1",
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        port: 4318,
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        state: { role: "tuner" },
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        session: { state: "Tuner" },
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        command: "Game.CityCommands.sendRequest(...)",
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        rawCommand: "Game.CityCommands.sendRequest(...)",
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        operationType: "CHANGE_GROWTH_MODE",
      },
      {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        args: { Type: -284_569_333 },
      },
      {
        cityId,
        growthType: 1.5,
        projectType: -548_685_232,
      },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(townFocusResult("town-focus-change", {
        sent: true,
      }));

      await expect(
        call(
          Civ7ControlOrpcRouter.city.townFocus.change.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.change).toEqual([]);
      expect(fake.calls.review).toEqual([]);
    }
  });

  test("maps town focus source failures to a tagged error without raw details", async () => {
    const fake = fakeContext(
      new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:CHANGE_GROWTH_MODE",
      ),
    );

    await expect(
      call(
        Civ7ControlOrpcRouter.city.townFocus.change.request,
        {
          cityId,
          growthType: -284_569_333,
          projectType: -548_685_232,
        },
        { context: fake.context },
      ),
    ).rejects.toMatchObject({
      code: "TOWN_FOCUS_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.townFocus.change.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.city.townFocus.change.request,
        {
          cityId,
          growthType: -284_569_333,
          projectType: -548_685_232,
        },
        { context: fake.context },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes domain-first town-focus contract leaves", () => {
    expect(
      Civ7ControlOrpcContract.city.townFocus.change.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.townFocus.change.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.city.townFocus.review.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.townFocus.review.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.city.townFocus.change.request["~orpc"].errorMap,
    ).toHaveProperty("TOWN_FOCUS_UNAVAILABLE");
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).operations,
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).actions,
    ).toBeUndefined();
    expect(Civ7TownFocusUnavailableError.code).toBe("TOWN_FOCUS_UNAVAILABLE");
  });
});

function expectSemanticTownFocusOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"session\"");
  expect(serialized).not.toContain("\"rawCommand\"");
  expect(serialized).not.toContain("\"command\"");
  expect(serialized).not.toContain("\"operation\"");
  expect(serialized).not.toContain("\"verified\"");
  expect(serialized).not.toContain("\"before\"");
  expect(serialized).not.toContain("\"after\"");
  expect(serialized).not.toContain("Game.CityCommands");
  expect(serialized).not.toContain("Game.CityOperations");
  expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
  expect(serialized).not.toContain("CONSIDER_TOWN_PROJECT");
}

function fakeContext(
  resultOrError: TownFocusRuntimeResult | Error,
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    change: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
    review: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    change: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>,
    review: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>,
  };

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7PlayableStatus: async (endpointDefaults) => {
          calls.readiness.push(endpointDefaults);
          return {
            playable: true,
            readiness: "tuner-ready",
          };
        },
        requestCiv7TownFocusChange: async (input, endpointDefaults) => {
          calls.change.push({ input, options: endpointDefaults });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
        requestCiv7TownFocusReviewCloseout: async (input, endpointDefaults) => {
          calls.review.push({ input, options: endpointDefaults });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function townFocusResult(
  kind: "town-focus-change" | "town-focus-review",
  options: Readonly<{
    sent: boolean;
    valid?: boolean;
  }>,
): TownFocusRuntimeResult {
  const valid = options.valid ?? true;
  const operationType = kind === "town-focus-change"
    ? "CHANGE_GROWTH_MODE"
    : "CONSIDER_TOWN_PROJECT";
  const args = kind === "town-focus-change"
    ? {
      Type: -284_569_333,
      ProjectType: -548_685_232,
      City: 131_073,
    }
    : {};
  const operation = {
    before: validationResult(operationType, args, valid),
    command: options.sent
      ? {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        output: [
          JSON.stringify({
            sent: true,
            rawCommand: kind === "town-focus-change"
              ? "Game.CityCommands.sendRequest(...)"
              : "Game.CityOperations.sendRequest(...)",
          }),
        ],
      }
      : undefined,
    after: validationResult(operationType, args, valid),
    sent: options.sent,
    verified: options.sent && valid,
  };
  return {
    kind,
    cityId,
    ...(kind === "town-focus-change"
      ? {
        growthType: -284_569_333,
        projectType: -548_685_232,
        city: 131_073,
      }
      : {}),
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent: options.sent,
    verified: false,
    postcondition: {
      classification: options.sent ? "pending-runtime-proof" : "not-sent",
      reason: options.sent
        ? `${kind} pending runtime proof`
        : `${kind} not sent`,
    },
  } as TownFocusRuntimeResult;
}

function validationResult(
  operationType: string,
  args: Readonly<Record<string, number>>,
  valid: boolean,
): TownFocusRuntimeResult["beforeValidation"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: operationType === "CHANGE_GROWTH_MODE"
      ? "city-command"
      : "city-operation",
    operationType,
    enumValue: operationType,
    target: { cityId },
    args,
    valid,
    result: { Success: valid },
  };
}
