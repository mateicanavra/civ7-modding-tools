import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import type {
  Civ7ControlOrpcGovernmentChoiceResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "../src/dependencies/direct-control";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  type Civ7ControlOrpcPlayableStatusResult,
  Civ7ControlOrpcRouter,
  Civ7GovernmentChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";

const governmentInput = {
  governmentType: 0,
  action: -1_326_475_004,
} as const;

const celebrationInput = {
  goldenAgeType: -340_825_966,
} as const;

describe("government choice control-oRPC procedures", () => {
  test("routes government choices through live local-player evidence and keeps sends no-repeat guarded", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      governmentResult: governmentChoiceResult({
        kind: "government",
        playerId: 0,
        governmentType: 0,
        action: -1_326_475_004,
        sent: true,
      }),
    });

    const result = await call(Civ7ControlOrpcRouter.government.choice.request, governmentInput, {
      context: fake.context,
    });

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(1);
    expect(fake.calls.government).toEqual([
      {
        input: {
          playerId: 0,
          governmentType: 0,
          action: -1_326_475_004,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(fake.calls.celebration).toEqual([]);
    expect(result).toEqual({
      playerId: 0,
      governmentType: 0,
      action: -1_326_475_004,
      sent: true,
      status: "sent-unverified",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "government choice pending runtime proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "government.choice.request",
          label:
            "Do not repeat this government-domain choice request until fresh attention evidence is read.",
        },
      ],
    });
    expectSemanticGovernmentChoiceOmitsRawRuntimeDetails(result);
  });

  test("routes celebration choices through the government domain leaf", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      celebrationResult: governmentChoiceResult({
        kind: "celebration",
        playerId: 0,
        goldenAgeType: -340_825_966,
        sent: true,
      }),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.government.celebration.choice.request(celebrationInput);

    expect(fake.calls.celebration).toEqual([
      {
        input: {
          playerId: 0,
          goldenAgeType: -340_825_966,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result).toMatchObject({
      playerId: 0,
      goldenAgeType: -340_825_966,
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "pending-runtime-proof",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
  });

  test("projects validator-blocked government choices as not-sent", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      governmentResult: governmentChoiceResult({
        kind: "government",
        playerId: 0,
        governmentType: 0,
        action: -1_326_475_004,
        sent: false,
        valid: false,
      }),
    });

    const result = await call(Civ7ControlOrpcRouter.government.choice.request, governmentInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      playerId: 0,
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
    });
    expect(result.nextSteps).toEqual([
      {
        kind: "inspect-government-choice",
        source: "government.choice.request",
        label:
          "Inspect current government or celebration choice state before attempting another request.",
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { ...governmentInput, playerId: 2 },
      { ...governmentInput, host: "127.0.0.1" },
      { ...governmentInput, port: 4318 },
      { ...governmentInput, state: { role: "tuner" } },
      { ...governmentInput, session: { state: "Tuner" } },
      { ...governmentInput, command: "Game.PlayerOperations.sendRequest" },
      { ...governmentInput, rawCommand: "Game.PlayerOperations.sendRequest" },
      { ...governmentInput, operationType: "CHANGE_GOVERNMENT" },
      { ...governmentInput, args: { GovernmentType: 0, Action: -1_326_475_004 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        view: notificationView({ localPlayerId: 0 }),
      });

      await expect(
        call(Civ7ControlOrpcRouter.government.choice.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.views).toEqual([]);
      expect(fake.calls.government).toEqual([]);
    }

    const celebrationInvalidInputs = [
      { ...celebrationInput, playerId: 2 },
      { ...celebrationInput, host: "127.0.0.1" },
      { ...celebrationInput, command: "Game.PlayerOperations.sendRequest" },
      { ...celebrationInput, operationType: "CHOOSE_GOLDEN_AGE" },
      { ...celebrationInput, args: { GoldenAgeType: -340_825_966 } },
    ];

    for (const input of celebrationInvalidInputs) {
      const fake = fakeContext({
        view: notificationView({ localPlayerId: 0 }),
      });

      await expect(
        call(Civ7ControlOrpcRouter.government.celebration.choice.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.views).toEqual([]);
      expect(fake.calls.celebration).toEqual([]);
    }
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
    });
    const failingContext: Civ7ControlOrpcContext = {
      ...fake.context,
      directControl: {
        ...fake.context.directControl,
        requestCiv7GovernmentChoice: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:CHANGE_GOVERNMENT"
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.government.choice.request, governmentInput, {
        context: failingContext,
      })
    ).rejects.toMatchObject({
      code: "GOVERNMENT_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "government.choice.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.government.choice.request, governmentInput, {
        context: failingContext,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("CHANGE_GOVERNMENT");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("maps celebration source failures to the government tagged error", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
    });
    const failingContext: Civ7ControlOrpcContext = {
      ...fake.context,
      directControl: {
        ...fake.context.directControl,
        requestCiv7CelebrationChoice: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:CHOOSE_GOLDEN_AGE"
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.government.celebration.choice.request, celebrationInput, {
        context: failingContext,
      })
    ).rejects.toMatchObject({
      code: "GOVERNMENT_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "government.celebration.choice.request",
        source: "direct-control-facade",
      },
    });
  });

  test("publishes domain-first government service leaves", () => {
    expect(Civ7ControlOrpcContract.government.choice.request["~orpc"]).toMatchObject({
      meta: {
        family: "government",
        procedureKey: "government.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.government.celebration.choice.request["~orpc"]).toMatchObject({
      meta: {
        family: "government",
        procedureKey: "government.celebration.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.government.choice.request["~orpc"].errorMap).toHaveProperty(
      "GOVERNMENT_CHOICE_UNAVAILABLE"
    );
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).operations
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).decisions
    ).toBeUndefined();
    expect(Civ7GovernmentChoiceUnavailableError.code).toBe("GOVERNMENT_CHOICE_UNAVAILABLE");
  });
});

function expectSemanticGovernmentChoiceOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operation"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("Game.PlayerOperations");
  expect(serialized).not.toContain("CHANGE_GOVERNMENT");
  expect(serialized).not.toContain("CHOOSE_GOLDEN_AGE");
}

function fakeContext(
  options: Readonly<{
    view: Civ7ControlOrpcPlayNotificationViewResult;
    governmentResult?: Civ7ControlOrpcGovernmentChoiceResult;
    celebrationResult?: Civ7ControlOrpcGovernmentChoiceResult;
    playable?: boolean;
  }>
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    government: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    celebration: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    views: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    government: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    celebration: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
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
          return playableStatusResult(options.playable ?? true);
        },
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.views.push(endpointDefaults);
          return options.view;
        },
        requestCiv7GovernmentChoice: async (input, endpointDefaults) => {
          calls.government.push({ input, options: endpointDefaults });
          return (
            options.governmentResult ??
            governmentChoiceResult({
              kind: "government",
              playerId: 0,
              governmentType: 0,
              action: -1_326_475_004,
              sent: true,
            })
          );
        },
        requestCiv7CelebrationChoice: async (input, endpointDefaults) => {
          calls.celebration.push({ input, options: endpointDefaults });
          return (
            options.celebrationResult ??
            governmentChoiceResult({
              kind: "celebration",
              playerId: 0,
              goldenAgeType: -340_825_966,
              sent: true,
            })
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function governmentChoiceResult(
  options: Readonly<{
    kind: "government" | "celebration";
    playerId: number;
    governmentType?: number;
    action?: number;
    goldenAgeType?: number;
    sent: boolean;
    valid?: boolean;
  }>
): Civ7ControlOrpcGovernmentChoiceResult {
  const valid = options.valid ?? true;
  const operationType = options.kind === "government" ? "CHANGE_GOVERNMENT" : "CHOOSE_GOLDEN_AGE";
  const args =
    options.kind === "government"
      ? {
          GovernmentType: options.governmentType ?? 0,
          Action: options.action ?? -1_326_475_004,
        }
      : { GoldenAgeType: options.goldenAgeType ?? -340_825_966 };
  return {
    kind: options.kind,
    playerId: options.playerId,
    ...(options.kind === "government"
      ? {
          governmentType: options.governmentType ?? 0,
          action: options.action ?? -1_326_475_004,
        }
      : { goldenAgeType: options.goldenAgeType ?? -340_825_966 }),
    operation: {
      before: validationResult(operationType, options.playerId, args, valid),
      after: validationResult(operationType, options.playerId, args, valid),
      sent: options.sent,
      verified: options.sent && valid,
    },
    beforeValidation: validationResult(operationType, options.playerId, args, valid),
    afterValidation: validationResult(operationType, options.playerId, args, valid),
    sent: options.sent,
    verified: false,
    postcondition: {
      classification: options.sent ? "pending-runtime-proof" : "not-sent",
      reason: options.sent
        ? `${options.kind} choice pending runtime proof`
        : `${options.kind} choice not sent`,
    },
  };
}

function validationResult(
  operationType: string,
  playerId: number,
  args: Readonly<Record<string, number>>,
  valid: boolean
): Civ7ControlOrpcGovernmentChoiceResult["beforeValidation"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType,
    enumValue: operationType,
    target: { playerId },
    args,
    valid,
    result: { Success: valid },
  };
}

function notificationView(
  options: Readonly<{ localPlayerId: number }>
): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    schemaVersion: "civ7-play-notifications.v1",
    localPlayerId: options.localPlayerId,
    turn: probe(80),
    turnDate: probe("2025 BCE"),
    canEndTurn: probe(true),
    blocker: probe(0),
    firstReadyUnitId: probe(null),
    selectedUnitId: probe(null),
    selectedCityId: probe(null),
    blockingNotificationId: probe(null),
    notifications: [],
  } as Civ7ControlOrpcPlayNotificationViewResult;
}

function probe<T>(value: T): Readonly<{ ok: true; value: T }> {
  return { ok: true, value };
}

function playableStatusResult(playable: boolean): Civ7ControlOrpcPlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable,
    readiness: playable ? "tuner-ready" : "shell",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: { ok: true, value: playable },
          inShell: { ok: true, value: !playable },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
        },
        errors: [],
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      ready: playable,
      states: [],
      errors: [],
    },
    errors: [],
  };
}
