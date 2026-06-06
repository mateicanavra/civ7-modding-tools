import { call, ORPCError } from "@orpc/server";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7TurnCompletionUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type { Civ7ControlOrpcTurnCompletionRequestResult } from "../src/dependencies/direct-control";
import { typeboxInputSchemaFromContractProcedure } from "../src/typebox-standard-schema";

type TurnCompletionServiceResult = Awaited<
  ReturnType<
    ReturnType<typeof createCiv7ControlOrpcServerClient>["turn"]["complete"]["request"]
  >
>;

const Civ7TurnCompletionInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.turn.complete.request,
);

describe("turn.complete.request control-oRPC procedure", () => {
  test("owns the caller-facing turn completion input without runtime controls", () => {
    expect(Value.Check(Civ7TurnCompletionInputSchema, {})).toBe(true);
    for (
      const input of [
        { host: "127.0.0.1" },
        { port: 4318 },
        { state: { role: "app-ui" } },
        { session: { state: "App UI" } },
        { command: "GameContext.sendTurnComplete()" },
        { rawCommand: "GameContext.sendTurnComplete()" },
      ]
    ) {
      expect(Value.Check(Civ7TurnCompletionInputSchema, input)).toBe(false);
    }
  });

  test("calls the turn completion mutation through native Effect/oRPC with readiness guards", async () => {
    const fake = fakeContext(turnCompletionActionResult({
      after: turnCompletionStatus({ turn: 13, hasSentTurnComplete: false }),
    }));

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.turnCompletion).toEqual([{
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toEqual({
      sent: true,
      status: "sent-confirmed",
      before: {
        turn: 12,
        turnDate: "3990 BCE",
        hasSentTurnComplete: false,
        canEndTurn: true,
        blocker: 0,
        firstReadyUnitId: null,
      },
      after: {
        turn: 13,
        turnDate: "3980 BCE",
        hasSentTurnComplete: false,
        canEndTurn: true,
        blocker: 0,
        firstReadyUnitId: null,
      },
      postcondition: {
        classification: "turn-advanced",
        reason: "The turn advanced after the turn completion send.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "turn.complete.request",
        label: "Refresh current attention before choosing the next player action.",
      }],
    });
    expectPublicResultOmitsRawRuntimeDetails(result);
  });

  test("keeps sent turn-complete state no-repeat guarded", async () => {
    const fake = fakeContext(turnCompletionActionResult({
      after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
    }));

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-guarded",
      postcondition: {
        classification: "turn-complete-sent",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "turn.complete.request",
      }],
    });
  });

  test("keeps no-state-change results no-repeat guarded", async () => {
    const fake = fakeContext(turnCompletionActionResult({
      after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
    }));

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "no-state-change",
        outcome: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "turn.complete.request",
      }],
    });
  });

  test("keeps missing postconditions no-repeat guarded", async () => {
    const fake = fakeContext(turnCompletionActionResult({
      after: turnCompletionStatus({
        turn: 12,
        hasSentTurnComplete: false,
        hasSentTurnCompleteOk: false,
      }),
    }));

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
  });

  test("projects expected guard-blocked turn completion as semantic not-sent output", async () => {
    const fake = fakeContext(turnCompletionBlockedResult());

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      before: {
        turn: 12,
        hasSentTurnComplete: false,
        canEndTurn: false,
        blocker: 0,
        firstReadyUnitId: null,
      },
      after: null,
      postcondition: {
        classification: "turn-completion-blocked",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-turn-completion",
          source: "turn.complete.request",
        },
        {
          kind: "do-not-repeat",
          source: "turn.complete.request",
        },
      ],
    });
    expectPublicResultOmitsRawRuntimeDetails(result);
  });

  test("rejects raw caller fields before readiness and mutation ports run", async () => {
    const fake = fakeContext(turnCompletionActionResult({}));

    await expect(
      call(
        Civ7ControlOrpcRouter.turn.complete.request,
        { rawCommand: "GameContext.sendTurnComplete()" },
        { context: fake.context },
      ),
    ).rejects.toBeInstanceOf(ORPCError);
    expect(fake.calls.readiness).toEqual([]);
    expect(fake.calls.turnCompletion).toEqual([]);
  });

  test("maps source failures to bounded tagged errors without raw cause details", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:65535:GameContext.sendTurnComplete()",
    ));

    let caught: unknown;
    try {
      await call(Civ7ControlOrpcRouter.turn.complete.request, {}, {
        context: fake.context,
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).toMatchObject({
      code: "TURN_COMPLETION_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "turn.complete.request",
        source: "direct-control-facade",
      },
    });
    const serialized = JSON.stringify(caught);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("GameContext.sendTurnComplete");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("command-failed");
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(turnCompletionActionResult({
      after: turnCompletionStatus({ turn: 13, hasSentTurnComplete: false }),
    }));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.turn.complete.request({});

    expect(result.status).toBe("sent-confirmed");
    expect(fake.calls.turnCompletion).toHaveLength(1);
  });

  test("publishes contract metadata and tagged error constructors", () => {
    expect(
      Civ7ControlOrpcContract.turn.complete.request["~orpc"].meta,
    ).toMatchObject({
      family: "turn",
      procedureKey: "turn.complete.request",
      risk: "mutation",
      proofBoundary: "local-package-test",
    });
    expect(Civ7TurnCompletionUnavailableError).toBeTypeOf("function");
  });
});

function expectPublicResultOmitsRawRuntimeDetails(
  result: TurnCompletionServiceResult,
): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"command\"");
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("GameContext.sendTurnComplete");
  expect(serialized).not.toContain("\"verified\"");
}

function fakeContext(
  resultOrError: Civ7ControlOrpcTurnCompletionRequestResult | Error,
): {
  context: Civ7ControlOrpcContext;
  calls: {
    readiness: unknown[];
    turnCompletion: unknown[];
  };
} {
  const calls: {
    readiness: unknown[];
    turnCompletion: unknown[];
  } = {
    readiness: [],
    turnCompletion: [],
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults: {
      host: "127.0.0.1",
      port: 4318,
      timeoutMs: 1_000,
    },
    directControl: {
      getCiv7PlayableStatus: async (endpointDefaults) => {
        calls.readiness.push(endpointDefaults);
        return { playable: true, readiness: "tuner-ready" } as Awaited<
          ReturnType<Civ7ControlOrpcContext["directControl"]["getCiv7PlayableStatus"]>
        >;
      },
      requestCiv7TurnComplete: async (endpointDefaults) => {
        calls.turnCompletion.push({
          options: endpointDefaults,
        });
        if (resultOrError instanceof Error) throw resultOrError;
        return resultOrError;
      },
    } as Civ7ControlOrpcContext["directControl"],
  };

  return { context, calls };
}

function turnCompletionActionResult(
  overrides: Partial<Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: true }>>,
): Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: true }> {
  return {
    sent: true,
    before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
    after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: [
        "CMD:65535:GameContext.sendTurnComplete()",
      ],
    },
    verified: true,
    ...overrides,
  } as Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: true }>;
}

function turnCompletionBlockedResult(): Extract<
  Civ7ControlOrpcTurnCompletionRequestResult,
  { sent: false }
> {
  return {
    sent: false,
    reason: "turn-completion-blocked",
    before: turnCompletionStatus({
      turn: 12,
      hasSentTurnComplete: false,
      canEndTurn: false,
    }),
    fallbackPreflight: {
      notifications: [{
        isEndTurnBlocking: true,
        typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
        decision: { category: "town-focus" },
      }],
    },
  } as Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: false }>;
}

function turnCompletionStatus(options: Readonly<{
  turn: number;
  hasSentTurnComplete: boolean;
  canEndTurn?: boolean;
  turnOk?: boolean;
  hasSentTurnCompleteOk?: boolean;
}>): Civ7ControlOrpcTurnCompletionRequestResult["before"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: options.turnOk === false
      ? { ok: false, reason: "missing turn" }
      : { ok: true, value: options.turn },
    turnDate: { ok: true, value: options.turn === 12 ? "3990 BCE" : "3980 BCE" },
    hasSentTurnComplete: options.hasSentTurnCompleteOk === false
      ? { ok: false, reason: "missing sent state" }
      : { ok: true, value: options.hasSentTurnComplete },
    canEndTurn: { ok: true, value: options.canEndTurn ?? true },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
  };
}
