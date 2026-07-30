import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiTurnCompletionTarget,
  checkCiv7GameUiTurnCompletion,
  civ7GameUiTurnCompletionCheckAvailable,
  civ7GameUiTurnCompletionSendAvailable,
  sendCiv7GameUiTurnCompletion,
} from "../../src/controller/game-ui/turn-completion";

describe("game UI turn-completion atoms", () => {
  test("advertises exact native check and send capabilities independently", () => {
    const checkOnly = turnRuntime({ sendEndTurn: undefined });

    expect(civ7GameUiTurnCompletionCheckAvailable(checkOnly.target)).toBe(true);
    expect(civ7GameUiTurnCompletionSendAvailable(checkOnly.target)).toBe(false);

    const complete = turnRuntime();
    expect(civ7GameUiTurnCompletionCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiTurnCompletionSendAvailable(complete.target)).toBe(true);

    const missingPanel = turnRuntime({ actionPanel: null });
    expect(civ7GameUiTurnCompletionCheckAvailable(missingPanel.target)).toBe(false);
    expect(civ7GameUiTurnCompletionSendAvailable(missingPanel.target)).toBe(false);
  });

  test("projects independent turn.complete.check/request support through the controller facade", async () => {
    const checkOnly = controllerTarget(turnRuntime({ sendEndTurn: undefined }).target);
    const checkOnlyContext = await createCiv7GameUiControllerContextFactory({
      target: checkOnly,
    })();

    expect(checkOnlyContext.controller).toEqual({
      supportedReadProcedures: ["turn.complete.check"],
      supportedMutationProcedures: [],
    });

    const complete = controllerTarget(turnRuntime().target);
    const completeContext = await createCiv7GameUiControllerContextFactory({
      target: complete,
    })();
    expect(completeContext.controller).toEqual({
      supportedReadProcedures: ["turn.complete.check"],
      supportedMutationProcedures: ["turn.complete.request"],
    });
    await expect(completeContext.directControl.checkCiv7TurnCompletion({}, {})).resolves.toEqual({
      snapshot: turnSnapshot(),
    });
  });

  test("checks the official action panel and preserves raw source probes", async () => {
    const runtime = turnRuntime();

    const result = await checkCiv7GameUiTurnCompletion({}, runtime.target);

    expect(result).toEqual({ snapshot: turnSnapshot() });
    expect(runtime.selectors).toEqual([".action-panel"]);
    expect(runtime.canEndTurnCalls).toBe(1);
    expect(runtime.sendEndTurnCalls).toBe(0);
  });

  test("preserves unreadable native evidence without manufacturing defaults", async () => {
    const runtime = turnRuntime({
      turn: Number.NaN,
      hasSentTurnComplete: "no",
      canEndTurn: 1,
    });

    const result = await checkCiv7GameUiTurnCompletion({}, runtime.target);

    expect(result.snapshot).toEqual({
      localPlayerId: 0,
      turn: {
        ok: false,
        error: "Game.turn must be a finite number.",
      },
      hasSentTurnComplete: {
        ok: false,
        error: "GameContext.hasSentTurnComplete returned a non-boolean value.",
      },
      canEndTurn: {
        ok: false,
        error: "The .action-panel component canEndTurn method returned a non-boolean value.",
      },
    });
  });

  test("sends once through native sendEndTurn and snapshots its state transition", async () => {
    const runtime = turnRuntime();

    const result = await sendCiv7GameUiTurnCompletion(
      {
        expected: turnSnapshot(),
      },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      before: turnSnapshot(),
      after: turnSnapshot({ hasSentTurnComplete: true }),
    });
    expect(runtime.sendEndTurnCalls).toBe(1);
    expect(runtime.canEndTurnCalls).toBe(2);
    expect(runtime.selectors).toEqual([".action-panel", ".action-panel", ".action-panel"]);
  });

  test("refuses changed, unreadable, or native-blocked evidence before dispatch", async () => {
    const changed = turnRuntime({ canEndTurn: false });
    await expect(
      sendCiv7GameUiTurnCompletion(
        {
          expected: turnSnapshot(),
        },
        changed.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Turn completion admission evidence changed or is unavailable.",
    });
    expect(changed.sendEndTurnCalls).toBe(0);

    const blocked = turnRuntime({ canEndTurn: false });
    await expect(
      sendCiv7GameUiTurnCompletion(
        {
          expected: turnSnapshot({ canEndTurn: false }),
        },
        blocked.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
      message: "Native turn completion admission is not currently satisfied.",
    });
    expect(blocked.sendEndTurnCalls).toBe(0);

    const unreadable = turnRuntime({ canEndTurn: new Error("panel check failed") });
    const expected = await checkCiv7GameUiTurnCompletion({}, unreadable.target);
    await expect(
      sendCiv7GameUiTurnCompletion(
        {
          expected: expected.snapshot,
        },
        unreadable.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
      message: "Turn completion admission evidence changed or is unavailable.",
    });
    expect(unreadable.sendEndTurnCalls).toBe(0);
  });

  test("labels a native sendEndTurn exception as dispatched", async () => {
    const runtime = turnRuntime({ sendError: new Error("native turn send failed") });

    await expect(
      sendCiv7GameUiTurnCompletion(
        {
          expected: turnSnapshot(),
        },
        runtime.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "native turn send failed",
    });
    expect(runtime.sendEndTurnCalls).toBe(1);
  });
});

function controllerTarget(target: Civ7GameUiTurnCompletionTarget): Civ7GameUiRuntimeTarget {
  return {
    ...target,
    UI: {
      isInGame: () => true,
    },
    Players: {
      getAliveHumanIds: () => [0],
    },
  } as Civ7GameUiRuntimeTarget;
}

function turnRuntime(
  options: Readonly<{
    actionPanel?: "present" | null;
    canEndTurn?: unknown;
    hasSentTurnComplete?: unknown;
    sendEndTurn?: undefined;
    sendError?: Error;
    turn?: unknown;
  }> = {}
): {
  target: Civ7GameUiTurnCompletionTarget;
  readonly canEndTurnCalls: number;
  readonly selectors: readonly string[];
  readonly sendEndTurnCalls: number;
} {
  const selectors: string[] = [];
  let canEndTurnCalls = 0;
  let sendEndTurnCalls = 0;
  let hasSentTurnComplete = options.hasSentTurnComplete ?? false;
  const panel = {
    canEndTurn(): unknown {
      canEndTurnCalls += 1;
      if (options.canEndTurn instanceof Error) throw options.canEndTurn;
      return options.canEndTurn ?? true;
    },
    ...("sendEndTurn" in options
      ? {}
      : {
          sendEndTurn(): void {
            sendEndTurnCalls += 1;
            if (options.sendError) throw options.sendError;
            hasSentTurnComplete = true;
          },
        }),
  };
  const runtime = {
    target: {
      document: {
        querySelector(selector: string) {
          selectors.push(selector);
          return options.actionPanel === null ? null : { maybeComponent: panel };
        },
      },
      Game: {
        turn: options.turn ?? 42,
      },
      GameContext: {
        localPlayerID: 0,
        hasSentTurnComplete: () => hasSentTurnComplete,
      },
    },
    get canEndTurnCalls() {
      return canEndTurnCalls;
    },
    selectors,
    get sendEndTurnCalls() {
      return sendEndTurnCalls;
    },
  };
  return runtime;
}

function turnSnapshot(
  options: Readonly<{
    canEndTurn?: boolean;
    hasSentTurnComplete?: boolean;
    turn?: number;
  }> = {}
) {
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: options.turn ?? 42 },
    hasSentTurnComplete: {
      ok: true as const,
      value: options.hasSentTurnComplete ?? false,
    },
    canEndTurn: { ok: true as const, value: options.canEndTurn ?? true },
  };
}
