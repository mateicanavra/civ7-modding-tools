import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import type {
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcProgressionPlayerChoiceResult,
} from "../src/dependencies/direct-control";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ProgressionPlayerChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { playableStatusResult } from "./support/playable-status";

const attributePurchaseInput = {
  node: 20,
} as const;

const traditionChangeInput = {
  traditionType: -331_546_976,
  action: -1_326_475_004,
} as const;

describe("progression player-choice control-oRPC procedures", () => {
  test("routes attribute purchases through live local-player evidence and keeps sends no-repeat guarded", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      attributePurchaseResult: progressionPlayerChoiceResult({
        kind: "attribute-purchase",
        playerId: 0,
        node: 20,
        sent: true,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.attribute.purchase.request,
      attributePurchaseInput,
      { context: fake.context }
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(1);
    expect(fake.calls.attributePurchase).toEqual([
      {
        input: {
          playerId: 0,
          node: 20,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result).toEqual({
      playerId: 0,
      node: 20,
      sent: true,
      status: "sent-unverified",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "attribute-purchase pending runtime proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "progression.attribute.purchase.request",
          label:
            "Do not repeat this progression player-choice request until fresh attention evidence is read.",
        },
      ],
    });
    expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(result);
  });

  test("routes tradition changes through the progression tradition leaf", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      traditionChangeResult: progressionPlayerChoiceResult({
        kind: "tradition-change",
        playerId: 0,
        traditionType: -331_546_976,
        action: -1_326_475_004,
        sent: true,
      }),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.progression.tradition.change.request(traditionChangeInput);

    expect(fake.calls.traditionChange).toEqual([
      {
        input: {
          playerId: 0,
          traditionType: -331_546_976,
          action: -1_326_475_004,
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
      traditionType: -331_546_976,
      action: -1_326_475_004,
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "pending-runtime-proof",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
    expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(result);
  });

  test("projects review closeout validator blocks as not-sent", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
      attributeReviewResult: progressionPlayerChoiceResult({
        kind: "attribute-review",
        playerId: 0,
        sent: false,
        valid: false,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.attribute.review.request,
      {},
      { context: fake.context }
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
    expect(result.nextSteps).toEqual([
      {
        kind: "inspect-progression-attribute",
        source: "progression.attribute.review.request",
        label: "Inspect current attribute review state before attempting another request.",
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { ...attributePurchaseInput, host: "127.0.0.1" },
      { ...attributePurchaseInput, port: 4318 },
      { ...attributePurchaseInput, playerId: 2 },
      { ...attributePurchaseInput, state: { role: "tuner" } },
      { ...attributePurchaseInput, session: { state: "Tuner" } },
      { ...attributePurchaseInput, command: "Game.PlayerOperations.sendRequest" },
      { ...attributePurchaseInput, rawCommand: "Game.PlayerOperations.sendRequest" },
      { ...attributePurchaseInput, operationType: "BUY_ATTRIBUTE_TREE_NODE" },
      { ...attributePurchaseInput, args: { ProgressionTreeNodeType: 20 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        view: notificationView({ localPlayerId: 0 }),
      });

      await expect(
        call(Civ7ControlOrpcRouter.progression.attribute.purchase.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.views).toEqual([]);
      expect(fake.calls.attributePurchase).toEqual([]);
    }

    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.progression.tradition.change.request,
        {
          ...traditionChangeInput,
          playerId: 2,
          args: { TraditionType: -331_546_976 },
        } as never,
        { context: fake.context }
      )
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fake.calls.traditionChange).toEqual([]);
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const fake = fakeContext({
      view: notificationView({ localPlayerId: 0 }),
    });
    const failingContext: Civ7ControlOrpcContext = {
      ...fake.context,
      directControl: {
        ...fake.context.directControl,
        requestCiv7TraditionChange: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:CHANGE_TRADITION"
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.progression.tradition.change.request, traditionChangeInput, {
        context: failingContext,
      })
    ).rejects.toMatchObject({
      code: "PROGRESSION_PLAYER_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "progression.tradition.change.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.progression.tradition.change.request, traditionChangeInput, {
        context: failingContext,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("CHANGE_TRADITION");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes domain-first progression player-choice service leaves", () => {
    expect(Civ7ControlOrpcContract.progression.attribute.purchase.request["~orpc"]).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.attribute.purchase.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.progression.tradition.change.request["~orpc"]).toMatchObject({
      meta: {
        family: "progression",
        procedureKey: "progression.tradition.change.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.progression.attribute.review.request["~orpc"].errorMap
    ).toHaveProperty("PROGRESSION_PLAYER_CHOICE_UNAVAILABLE");
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).operations
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).decisions
    ).toBeUndefined();
    expect(Civ7ProgressionPlayerChoiceUnavailableError.code).toBe(
      "PROGRESSION_PLAYER_CHOICE_UNAVAILABLE"
    );
  });
});

function expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(result: unknown) {
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
  expect(serialized).not.toContain("BUY_ATTRIBUTE_TREE_NODE");
  expect(serialized).not.toContain("CONSIDER_ASSIGN_ATTRIBUTE");
  expect(serialized).not.toContain("CHANGE_TRADITION");
  expect(serialized).not.toContain("CONSIDER_ASSIGN_TRADITIONS");
}

function fakeContext(
  options: Readonly<{
    view: Civ7ControlOrpcPlayNotificationViewResult;
    attributePurchaseResult?: Civ7ControlOrpcProgressionPlayerChoiceResult;
    attributeReviewResult?: Civ7ControlOrpcProgressionPlayerChoiceResult;
    traditionChangeResult?: Civ7ControlOrpcProgressionPlayerChoiceResult;
    traditionReviewResult?: Civ7ControlOrpcProgressionPlayerChoiceResult;
    playable?: boolean;
  }>
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    attributePurchase: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    attributeReview: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    traditionChange: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    traditionReview: Array<
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
    attributePurchase: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    attributeReview: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    traditionChange: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    traditionReview: [] as Array<
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
          return playableStatusResult({ playable: options.playable ?? true });
        },
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.views.push(endpointDefaults);
          return options.view;
        },
        requestCiv7AttributePurchase: async (input, endpointDefaults) => {
          calls.attributePurchase.push({ input, options: endpointDefaults });
          return (
            options.attributePurchaseResult ??
            progressionPlayerChoiceResult({
              kind: "attribute-purchase",
              playerId: 0,
              node: 20,
              sent: true,
            })
          );
        },
        requestCiv7AttributeReviewCloseout: async (input, endpointDefaults) => {
          calls.attributeReview.push({ input, options: endpointDefaults });
          return (
            options.attributeReviewResult ??
            progressionPlayerChoiceResult({
              kind: "attribute-review",
              playerId: 0,
              sent: true,
            })
          );
        },
        requestCiv7TraditionChange: async (input, endpointDefaults) => {
          calls.traditionChange.push({ input, options: endpointDefaults });
          return (
            options.traditionChangeResult ??
            progressionPlayerChoiceResult({
              kind: "tradition-change",
              playerId: 0,
              traditionType: -331_546_976,
              action: -1_326_475_004,
              sent: true,
            })
          );
        },
        requestCiv7TraditionReviewCloseout: async (input, endpointDefaults) => {
          calls.traditionReview.push({ input, options: endpointDefaults });
          return (
            options.traditionReviewResult ??
            progressionPlayerChoiceResult({
              kind: "tradition-review",
              playerId: 0,
              sent: true,
            })
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function progressionPlayerChoiceResult(
  options: Readonly<{
    kind: "attribute-purchase" | "attribute-review" | "tradition-change" | "tradition-review";
    playerId: number;
    node?: number;
    traditionType?: number;
    action?: number;
    sent: boolean;
    valid?: boolean;
  }>
): Civ7ControlOrpcProgressionPlayerChoiceResult {
  const valid = options.valid ?? true;
  const operationType = operationTypeForKind(options.kind);
  const args = operationArgs(options);
  return {
    kind: options.kind,
    playerId: options.playerId,
    ...(options.kind === "attribute-purchase" ? { node: options.node ?? 20 } : {}),
    ...(options.kind === "tradition-change"
      ? {
          traditionType: options.traditionType ?? -331_546_976,
          action: options.action ?? -1_326_475_004,
        }
      : {}),
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
      reason: options.sent ? `${options.kind} pending runtime proof` : `${options.kind} not sent`,
    },
  } as Civ7ControlOrpcProgressionPlayerChoiceResult;
}

function operationTypeForKind(
  kind: "attribute-purchase" | "attribute-review" | "tradition-change" | "tradition-review"
): string {
  if (kind === "attribute-purchase") return "BUY_ATTRIBUTE_TREE_NODE";
  if (kind === "attribute-review") return "CONSIDER_ASSIGN_ATTRIBUTE";
  if (kind === "tradition-change") return "CHANGE_TRADITION";
  return "CONSIDER_ASSIGN_TRADITIONS";
}

function operationArgs(
  options: Readonly<{
    kind: "attribute-purchase" | "attribute-review" | "tradition-change" | "tradition-review";
    node?: number;
    traditionType?: number;
    action?: number;
  }>
): Readonly<Record<string, number>> {
  if (options.kind === "attribute-purchase") {
    return { ProgressionTreeNodeType: options.node ?? 20 };
  }
  if (options.kind === "tradition-change") {
    return {
      TraditionType: options.traditionType ?? -331_546_976,
      Action: options.action ?? -1_326_475_004,
    };
  }
  return {};
}

function validationResult(
  operationType: string,
  playerId: number,
  args: Readonly<Record<string, number>>,
  valid: boolean
): Civ7ControlOrpcProgressionPlayerChoiceResult["beforeValidation"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "Tuner" },
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
    localPlayerId: options.localPlayerId,
    turn: probe(80),
    turnDate: probe("2025 BCE"),
    hasSentTurnComplete: probe(false),
    canEndTurn: probe(true),
    blocker: probe(0),
    firstReadyUnitId: probe(null),
    selectedUnitId: probe(null),
    selectedCityId: probe(null),
    blockingNotificationId: probe(null),
    notifications: [],
    decisions: [],
    hud: { nextDecision: null, decisionQueue: [] },
    limits: { maxNotifications: 50, truncated: false },
  };
}

function probe<T>(value: T): Readonly<{ ok: true; value: T }> {
  return { ok: true, value };
}
