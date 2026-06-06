import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ProgressionChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";
import type {
  Civ7ControlOrpcCultureChoiceCloseoutResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcTechnologyChoiceCloseoutResult,
} from "../src/dependencies/direct-control";

const technologyInput = {
  node: 18_001,
  notificationId: { owner: 0, id: 72, type: 20 },
} as const;

const cultureInput = {
  node: 27_001,
} as const;

describe("progression choice control-oRPC procedures", () => {
  test("projects confirmed technology choices without raw command output", async () => {
    const before = notificationView("NOTIFICATION_CHOOSE_TECH", {
      currentResearching: probe(10),
      targetNode: probe(20),
    });
    const after = cleanView({ canEndTurn: true });
    const fake = fakeContext({
      views: [before, after],
      technologyResult: progressionCloseoutResult("technology"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      technologyInput,
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(2);
    expect(fake.calls.technology).toEqual([{
      input: {
        playerId: 0,
        node: 18_001,
        notificationId: { owner: 0, id: 72, type: 20 },
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
      notificationId: { owner: 0, id: 72, type: 20 },
      sent: true,
      status: "sent-confirmed",
      evidence: {
        beforeBlockerPresent: true,
        afterReadStatus: "read",
        afterBlockerPresent: false,
        canEndTurnAfter: true,
      },
      postcondition: {
        classification: "turn-unblocked",
        reason: "The technology choice workflow left the turn unblocked.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "progression.technology.choice.request",
        label: "Refresh current attention before choosing the next player action.",
      }],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("SET_TECH_TREE_NODE");
  });

  test("rejects caller player id before progression send dependencies are called", async () => {
    const fake = fakeContext({
      views: [cleanView(), cleanView()],
      technologyResult: progressionCloseoutResult("technology"),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.progression.technology.choice.request,
        {
          ...technologyInput,
          playerId: 2,
        } as never,
        { context: fake.context },
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(fake.calls.readiness).toEqual([]);
    expect(fake.calls.views).toEqual([]);
    expect(fake.calls.technology).toEqual([]);
    expect(fake.calls.culture).toEqual([]);
  });

  test("keeps sent culture choices no-repeat guarded while the blocker remains live", async () => {
    const before = notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {
      currentResearching: probe(30),
      targetNode: probe(40),
    });
    const after = notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {
      currentResearching: probe(31),
      targetNode: probe(40),
    });
    const fake = fakeContext({
      views: [before, after],
      cultureResult: progressionCloseoutResult("culture"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.culture.choice.request,
      cultureInput,
      { context: fake.context },
    );

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
    expect(fake.calls.technology).toEqual([]);
    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "culture-state-changed-blocker-still-live",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(result.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "progression.culture.choice.request",
      label: "Do not repeat this progression choice request until fresh attention and progression evidence is read.",
    }]);
  });

  test("projects unsent progression closeouts as not-sent", async () => {
    const before = notificationView("NOTIFICATION_CHOOSE_TECH", {
      currentResearching: probe(10),
      targetNode: probe(20),
    });
    const fake = fakeContext({
      views: [before, before],
      technologyResult: progressionCloseoutResult("technology", {
        sent: false,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      technologyInput,
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      evidence: {
        beforeBlockerPresent: true,
        afterReadStatus: "skipped-not-sent",
        afterBlockerPresent: null,
        canEndTurnAfter: null,
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
      kind: "inspect-progression-choice",
      source: "progression.technology.choice.request",
      label: "Inspect current attention and progression choice state before attempting another progression request.",
    }]);
    expect(fake.calls.views).toHaveLength(1);
  });

  test("keeps sent progression choices no-repeat guarded when the post-read fails", async () => {
    const before = notificationView("NOTIFICATION_CHOOSE_TECH", {
      currentResearching: probe(10),
      targetNode: probe(20),
    });
    const fake = fakeContext({
      views: [
        before,
        new Error("Timed out waiting for Civ7 tuner response to CMD:65535:Game.turn"),
      ],
      technologyResult: progressionCloseoutResult("technology"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      technologyInput,
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      evidence: {
        beforeBlockerPresent: true,
        afterReadStatus: "failed",
        afterBlockerPresent: null,
        canEndTurnAfter: null,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
    expect(result.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "progression.technology.choice.request",
      label: "Do not repeat this progression choice request until fresh attention and progression evidence is read.",
    }]);
    expect(JSON.stringify(result)).not.toContain("CMD");
  });

  test("keeps endpoint/session/state/raw command fields and UI toggles out of procedure input", async () => {
    const invalidInputs = [
      { ...technologyInput, host: "127.0.0.1" },
      { ...technologyInput, port: 4318 },
      { ...technologyInput, state: { role: "tuner" } },
      { ...technologyInput, session: { state: "Tuner" } },
      { ...technologyInput, command: "Game.turn" },
      { ...technologyInput, rawCommand: "Game.turn" },
      { ...technologyInput, activateNotification: false },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        views: [cleanView(), cleanView()],
        technologyResult: progressionCloseoutResult("technology"),
      });

      await expect(
        call(
          Civ7ControlOrpcRouter.progression.technology.choice.request,
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
      views: [cleanView(), cleanView()],
      technologyResult: progressionCloseoutResult("technology"),
    });
    const failingContext: Civ7ControlOrpcContext = {
      ...fake.context,
      directControl: {
        ...fake.context.directControl,
        requestCiv7TechnologyChoiceCloseout: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:SET_TECH_TREE_NODE",
          );
        },
      },
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.progression.technology.choice.request,
        technologyInput,
        { context: failingContext },
      ),
    ).rejects.toMatchObject({
      code: "PROGRESSION_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "progression.technology.choice.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.progression.technology.choice.request,
        technologyInput,
        { context: failingContext },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("SET_TECH_TREE_NODE");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("supports the in-process server-side router client", async () => {
    const before = notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {});
    const fake = fakeContext({
      views: [before, cleanView()],
      cultureResult: progressionCloseoutResult("culture"),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.progression.culture.choice.request(cultureInput);

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.classification).toBe("culture-choice-cleared");
  });

  test("publishes domain-first progression service leaves", () => {
    expect(
      Civ7ControlOrpcContract.progression.technology.choice.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.technology.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.progression.culture.choice.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.culture.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.progression.technology.choice.request["~orpc"].errorMap,
    ).toHaveProperty("PROGRESSION_CHOICE_UNAVAILABLE");
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).decisions,
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcRouter as unknown as Record<string, unknown>).decisions,
    ).toBeUndefined();
    expect(Civ7ProgressionChoiceUnavailableError.code).toBe(
      "PROGRESSION_CHOICE_UNAVAILABLE",
    );
  });
});

function fakeContext(options: Readonly<{
  views: readonly (Civ7ControlOrpcPlayNotificationViewResult | Error)[];
  technologyResult?: Civ7ControlOrpcTechnologyChoiceCloseoutResult;
  cultureResult?: Civ7ControlOrpcCultureChoiceCloseoutResult;
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
  const views = [...options.views];
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
          const view = views.shift() ?? cleanView();
          if (view instanceof Error) throw view;
          return view;
        },
        requestCiv7TechnologyChoiceCloseout: async (
          input,
          endpointDefaults,        ) => {
          calls.technology.push({
            input,
            options: endpointDefaults,          });
          return options.technologyResult
            ?? progressionCloseoutResult("technology");
        },
        requestCiv7CultureChoiceCloseout: async (
          input,
          endpointDefaults,        ) => {
          calls.culture.push({
            input,
            options: endpointDefaults,          });
          return options.cultureResult ?? progressionCloseoutResult("culture");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function progressionCloseoutResult(
  kind: "technology",
  options?: Partial<{ sent: boolean }>,
): Civ7ControlOrpcTechnologyChoiceCloseoutResult;
function progressionCloseoutResult(
  kind: "culture",
  options?: Partial<{ sent: boolean }>,
): Civ7ControlOrpcCultureChoiceCloseoutResult;
function progressionCloseoutResult(
  kind: "technology" | "culture",
  options: Partial<{ sent: boolean }> = {},
):
  | Civ7ControlOrpcTechnologyChoiceCloseoutResult
  | Civ7ControlOrpcCultureChoiceCloseoutResult {
  const operationType = kind === "technology"
    ? "SET_TECH_TREE_NODE"
    : "SET_CULTURE_TREE_NODE";
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: [`${operationType} should remain hidden`],
    },
    payload: {
      sent: options.sent ?? true,
      rawCommand: operationType,
    },
    sent: options.sent ?? true,
  } as
    | Civ7ControlOrpcTechnologyChoiceCloseoutResult
    | Civ7ControlOrpcCultureChoiceCloseoutResult;
}

function notificationView(
  typeName: string,
  details: Record<string, unknown>,
  options: Readonly<{
    id?: number;
    canEndTurn?: boolean;
  }> = {},
): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    schemaVersion: "civ7-play-notifications.v1",
    localPlayerId: 0,
    turn: probe(80),
    turnDate: probe("2025 BCE"),
    canEndTurn: probe(options.canEndTurn ?? false),
    blocker: probe(1),
    firstReadyUnitId: probe(null),
    selectedUnitId: probe(null),
    selectedCityId: probe(null),
    blockingNotificationId: probe({ owner: 0, id: options.id ?? 72, type: 20 }),
    notifications: [{
      id: { owner: 0, id: options.id ?? 72, type: 20 },
      typeName,
      summary: typeName,
      isEndTurnBlocking: true,
      details,
    }],
  } as Civ7ControlOrpcPlayNotificationViewResult;
}

function cleanView(
  options: Readonly<{ canEndTurn?: boolean }> = {},
): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    ...notificationView("NOTIFICATION_INFORMATIONAL", {}, options),
    blocker: probe(0),
    blockingNotificationId: probe(null),
    notifications: [],
  };
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
