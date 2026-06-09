import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ProgressionTargetUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";
import type {
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcProgressionTargetResult,
} from "../src/dependencies/direct-control";

const technologyInput = {
  playerId: 2,
  node: 18_001,
} as const;

const cultureInput = {
  playerId: 2,
  node: 27_001,
} as const;

describe("progression target control-oRPC procedures", () => {
  test("routes technology targets through live local-player evidence and keeps sends no-repeat guarded", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      technologyResult: progressionTargetResult({
        kind: "technology",
        playerId: 0,
        node: 18_001,
        sent: true,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.target.request,
      technologyInput,
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(1);
    expect(fake.calls.technology).toEqual([{
      input: {
        playerId: 0,
        node: 18_001,
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(fake.calls.culture).toEqual([]);
    expect(result).toEqual({
      playerId: 0,
      node: 18_001,
      sent: true,
      status: "sent-unverified",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "technology target pending runtime proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "progression.technology.target.request",
        label: "Do not repeat this progression target request until fresh progression target evidence is read.",
      }],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
  });

  test("routes culture targets through the progression domain leaf", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      cultureResult: progressionTargetResult({
        kind: "culture",
        playerId: 0,
        node: 27_001,
        sent: true,
      }),
    });

    const client = createCiv7ControlOrpcServerClient(fake.context);
    const result = await client.progression.culture.target.request(cultureInput);

    expect(fake.calls.culture).toEqual([{
      input: {
        playerId: 0,
        node: 27_001,
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "pending-runtime-proof",
      confidence: "pending-runtime-proof",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("projects validator-blocked target requests as not-sent", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      technologyResult: progressionTargetResult({
        kind: "technology",
        playerId: 0,
        node: 18_001,
        sent: false,
        valid: false,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.target.request,
      technologyInput,
      { context: fake.context },
    );

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
    expect(result.nextSteps).toEqual([{
      kind: "inspect-progression-target",
      source: "progression.technology.target.request",
      label: "Inspect current progression target state before attempting another target request.",
    }]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { ...technologyInput, host: "127.0.0.1" },
      { ...technologyInput, port: 4318 },
      { ...technologyInput, state: { role: "tuner" } },
      { ...technologyInput, session: { state: "Tuner" } },
      { ...technologyInput, command: "Game.PlayerOperations.sendRequest" },
      { ...technologyInput, rawCommand: "Game.PlayerOperations.sendRequest" },
      { ...technologyInput, operationType: "SET_TECH_TREE_TARGET_NODE" },
      { ...technologyInput, args: { ProgressionTreeNodeType: 18_001 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        view: notificationView({ localPlayerId: 0 }),
      });

      await expect(
        call(
          Civ7ControlOrpcRouter.progression.technology.target.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.views).toEqual([]);
      expect(fake.calls.technology).toEqual([]);
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
        requestCiv7TechnologyTarget: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:SET_TECH_TREE_TARGET_NODE",
          );
        },
      },
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.progression.technology.target.request,
        technologyInput,
        { context: failingContext },
      ),
    ).rejects.toMatchObject({
      code: "PROGRESSION_TARGET_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "progression.technology.target.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.progression.technology.target.request,
        technologyInput,
        { context: failingContext },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes domain-first progression target service leaves", () => {
    expect(
      Civ7ControlOrpcContract.progression.technology.target.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.technology.target.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.progression.culture.target.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.culture.target.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.progression.technology.target.request["~orpc"].errorMap,
    ).toHaveProperty("PROGRESSION_TARGET_UNAVAILABLE");
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).decisions,
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).operations,
    ).toBeUndefined();
    expect(Civ7ProgressionTargetUnavailableError.code).toBe(
      "PROGRESSION_TARGET_UNAVAILABLE",
    );
  });
});

function fakeContext(options: Readonly<{
  view: Civ7ControlOrpcPlayNotificationViewResult;
  technologyResult?: Civ7ControlOrpcProgressionTargetResult;
  cultureResult?: Civ7ControlOrpcProgressionTargetResult;
  playable?: boolean;
}>): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    technology: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
    culture: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    views: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    technology: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>,
    culture: [] as Array<Readonly<{
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
          return playableStatusResult(options.playable ?? true);
        },
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.views.push(endpointDefaults);
          return options.view;
        },
        requestCiv7TechnologyTarget: async (input, endpointDefaults) => {
          calls.technology.push({ input, options: endpointDefaults });
          return options.technologyResult
            ?? progressionTargetResult({
              kind: "technology",
              playerId: 0,
              node: 18_001,
              sent: true,
            });
        },
        requestCiv7CultureTarget: async (input, endpointDefaults) => {
          calls.culture.push({ input, options: endpointDefaults });
          return options.cultureResult
            ?? progressionTargetResult({
              kind: "culture",
              playerId: 0,
              node: 27_001,
              sent: true,
            });
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function progressionTargetResult(
  options: Readonly<{
    kind: "technology" | "culture";
    playerId: number;
    node: number;
    sent: boolean;
    valid?: boolean;
  }>,
): Civ7ControlOrpcProgressionTargetResult {
  const valid = options.valid ?? true;
  const operationType = options.kind === "technology"
    ? "SET_TECH_TREE_TARGET_NODE"
    : "SET_CULTURE_TREE_TARGET_NODE";
  return {
    kind: options.kind,
    playerId: options.playerId,
    node: options.node,
    operation: {
      before: validationResult(operationType, options, valid),
      after: validationResult(operationType, options, valid),
      sent: options.sent,
      verified: options.sent && valid,
    },
    beforeValidation: validationResult(operationType, options, valid),
    afterValidation: validationResult(operationType, options, valid),
    sent: options.sent,
    verified: false,
    postcondition: {
      classification: options.sent ? "pending-runtime-proof" : "not-sent",
      reason: options.sent
        ? `${options.kind} target pending runtime proof`
        : `${options.kind} target not sent`,
    },
  };
}

function validationResult(
  operationType: string,
  options: Readonly<{
    playerId: number;
    node: number;
  }>,
  valid: boolean,
): Civ7ControlOrpcProgressionTargetResult["beforeValidation"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType,
    enumValue: operationType,
    target: { playerId: options.playerId },
    args: { ProgressionTreeNodeType: options.node },
    valid,
    result: { Success: valid },
  };
}

function notificationView(
  options: Readonly<{ localPlayerId: number }>,
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
