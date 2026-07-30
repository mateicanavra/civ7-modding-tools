import type {
  Civ7UnitTargetActionCheckResult,
  Civ7UnitTargetActionId,
  Civ7UnitTargetSnapshot,
  Civ7UnitTargetUnitSummary,
} from "@civ7/direct-control";
import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiUnitTargetTarget,
  checkCiv7GameUiUnitTargetAction,
  civ7GameUiUnitTargetActionCheckAvailable,
  civ7GameUiUnitTargetActionSendAvailable,
  observeCiv7GameUiUnitTarget,
  sendCiv7GameUiUnitTargetAction,
} from "../../src/controller/game-ui/unit-target";

const actorId = { owner: 0, id: 42, type: 1 };
const targetUnitId = { owner: 1, id: 99, type: 2 };
const targetLocation = { x: 22, y: 31 };
const originLocation = { x: 20, y: 31 };
const rangedCombatType = "COMBAT_RANGED";
const noPlayerId = -1;

describe("game UI unit-target atoms", () => {
  test("advertises exact check and send capabilities independently through the facade", async () => {
    const complete = unitTargetRuntime();
    const readOnly = unitTargetRuntime({ sendAvailable: false });

    expect(civ7GameUiUnitTargetActionCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiUnitTargetActionSendAvailable(complete.target)).toBe(true);
    expect(civ7GameUiUnitTargetActionCheckAvailable(readOnly.target)).toBe(true);
    expect(civ7GameUiUnitTargetActionSendAvailable(readOnly.target)).toBe(false);

    const completeContext = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(complete.target),
    })();
    expect(completeContext.controller.supportedReadProcedures).toContain(
      "unit.target.action.check"
    );
    expect(completeContext.controller.supportedMutationProcedures).toContain(
      "unit.target.action.request"
    );
    await expect(
      completeContext.directControl.checkCiv7UnitTargetAction(
        { unitId: actorId, ...targetLocation, actionId: "naval-attack" },
        completeContext.endpointDefaults
      )
    ).resolves.toMatchObject({
      actionId: "naval-attack",
      valid: true,
    });

    const readOnlyContext = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(readOnly.target),
    })();
    expect(readOnlyContext.controller.supportedReadProcedures).toContain(
      "unit.target.action.check"
    );
    expect(readOnlyContext.controller.supportedMutationProcedures).not.toContain(
      "unit.target.action.request"
    );
  });

  test("observes focused immutable evidence without checking or selecting an action", async () => {
    const runtime = unitTargetRuntime();
    const inputUnitId = { ...actorId };

    const snapshot = await observeCiv7GameUiUnitTarget(
      {
        unitId: inputUnitId,
        ...targetLocation,
        trackedUnitIds: [targetUnitId],
      },
      runtime.target
    );
    inputUnitId.id = 404;

    expect(snapshot).toMatchObject({
      localPlayerId: 0,
      unitId: actorId,
      target: {
        ...targetLocation,
        index: 22_031,
      },
      actor: {
        id: actorId,
        location: originLocation,
      },
      targetUnits: [
        {
          id: targetUnitId,
          location: targetLocation,
        },
      ],
      trackedTargetUnits: [
        {
          id: targetUnitId,
          unit: {
            id: targetUnitId,
          },
        },
      ],
      combatType: rangedCombatType,
      rangedCombatType,
      war: {
        observed: true,
        player2: noPlayerId,
        noPlayerId,
        required: false,
      },
      modifiers: {
        none: 0,
        dispatch: 3,
      },
    });
    expect(runtime.calls.map((call) => call.kind)).toEqual(["combat", "war"]);
  });

  test.each<{
    actionId: Civ7UnitTargetActionId;
    family: "command" | "operation";
    operationType: unknown;
    modifiers: number;
    callOrder: readonly NativeCall["kind"][];
  }>([
    {
      actionId: "naval-attack",
      family: "operation",
      operationType: "UNITOPERATION_NAVAL_ATTACK",
      modifiers: 0,
      callOrder: ["check", "war"],
    },
    {
      actionId: "air-attack",
      family: "operation",
      operationType: "UNITOPERATION_AIR_ATTACK",
      modifiers: 0,
      callOrder: ["check", "war"],
    },
    {
      actionId: "army-overrun",
      family: "command",
      operationType: "UNITCOMMAND_ARMY_OVERRUN",
      modifiers: 0,
      callOrder: ["check"],
    },
    {
      actionId: "swap-units",
      family: "operation",
      operationType: "UNITOPERATION_SWAP_UNITS",
      modifiers: 0,
      callOrder: ["check"],
    },
    {
      actionId: "move-to",
      family: "operation",
      operationType: "MOVE_TO",
      modifiers: 3,
      callOrder: ["war", "check"],
    },
  ])("checks only $actionId without running ranged combat classification", async ({
    actionId,
    family,
    operationType,
    modifiers,
    callOrder,
  }) => {
    const runtime = unitTargetRuntime();

    const result = await checkCiv7GameUiUnitTargetAction(
      { unitId: actorId, ...targetLocation, actionId },
      runtime.target
    );

    expect(result).toMatchObject({
      actionId,
      valid: true,
      args: {
        X: targetLocation.x,
        Y: targetLocation.y,
        Modifiers: modifiers,
      },
      snapshot: {
        combatType: null,
      },
    });
    expect(runtime.calls.map((call) => call.kind)).toEqual(callOrder);
    expect(runtime.calls.find((call) => call.kind === "check")).toMatchObject({
      kind: "check",
      family,
      operationType,
      args: {
        X: targetLocation.x,
        Y: targetLocation.y,
        Modifiers: modifiers,
      },
      includeDetails: false,
    });
  });

  test("runs combat classification only for the ranged prerequisite", async () => {
    const nonRanged = unitTargetRuntime({ combatType: "COMBAT_MELEE" });

    await expect(
      checkCiv7GameUiUnitTargetAction(
        { unitId: actorId, ...targetLocation, actionId: "ranged-attack" },
        nonRanged.target
      )
    ).resolves.toMatchObject({
      actionId: "ranged-attack",
      valid: false,
      prerequisite: {
        kind: "ranged-combat",
        satisfied: false,
      },
      snapshot: {
        combatType: "COMBAT_MELEE",
      },
    });
    expect(nonRanged.calls.map((call) => call.kind)).toEqual(["combat"]);

    const ranged = unitTargetRuntime();
    await expect(
      checkCiv7GameUiUnitTargetAction(
        { unitId: actorId, ...targetLocation, actionId: "ranged-attack" },
        ranged.target
      )
    ).resolves.toMatchObject({
      actionId: "ranged-attack",
      valid: true,
      prerequisite: {
        kind: "ranged-combat",
        satisfied: true,
      },
      args: {
        X: targetLocation.x,
        Y: targetLocation.y,
        Modifiers: 0,
      },
    });
    expect(ranged.calls.map((call) => call.kind)).toEqual(["combat", "war", "check"]);
  });

  test.each([
    ["ranged-attack", ["combat", "war"]],
    ["move-to", ["war"]],
  ] as const)("returns %s war evidence before native admission and skips canStart", async (actionId, callOrder) => {
    const runtime = unitTargetRuntime({ player2: 2 });

    await expect(
      checkCiv7GameUiUnitTargetAction(
        { unitId: actorId, ...targetLocation, actionId },
        runtime.target
      )
    ).resolves.toMatchObject({
      actionId,
      valid: false,
      result: null,
      snapshot: {
        war: {
          observed: true,
          player2: 2,
          noPlayerId,
          required: true,
        },
      },
    });
    expect(runtime.calls.map((call) => call.kind)).toEqual(callOrder);
    expect(runtime.calls.some((call) => call.kind === "check")).toBe(false);
  });

  test("treats an unavailable actor location as a failed off-current-tile prerequisite", async () => {
    const runtime = unitTargetRuntime({ actorLocation: null });

    await expect(
      checkCiv7GameUiUnitTargetAction(
        { unitId: actorId, ...targetLocation, actionId: "swap-units" },
        runtime.target
      )
    ).resolves.toMatchObject({
      valid: false,
      prerequisite: {
        kind: "off-current-tile",
        satisfied: false,
      },
    });
    expect(runtime.calls).toEqual([]);
  });

  test("freshly revalidates, sends once, and keeps vanished target identities observable", async () => {
    const runtime = unitTargetRuntime({
      removeTargetOnSend: true,
      sendResult: false,
    });
    const input = {
      unitId: actorId,
      ...targetLocation,
      actionId: "move-to" as const,
    };
    const expected = await checkCiv7GameUiUnitTargetAction(input, runtime.target);
    runtime.calls.length = 0;

    const result = await sendCiv7GameUiUnitTargetAction({ ...input, expected }, runtime.target);

    expect(result).toMatchObject({
      sent: true,
      actionId: "move-to",
      validation: expected,
      before: expected.snapshot,
      after: {
        actor: {
          location: targetLocation,
        },
        targetUnits: [],
        trackedTargetUnits: [
          {
            id: targetUnitId,
            unit: null,
          },
        ],
      },
    });
    expect(runtime.calls.map((call) => call.kind)).toEqual([
      "war",
      "check",
      "send",
      "combat",
      "war",
    ]);
    expect(runtime.calls.find((call) => call.kind === "send")).toMatchObject({
      kind: "send",
      family: "operation",
      operationType: "MOVE_TO",
      args: {
        X: targetLocation.x,
        Y: targetLocation.y,
        Modifiers: 3,
      },
    });
  });

  test("refuses stale evidence before dispatch and preserves dispatch ambiguity after invocation", async () => {
    const stale = unitTargetRuntime();
    const input = {
      unitId: actorId,
      ...targetLocation,
      actionId: "naval-attack" as const,
    };
    const expected = await checkCiv7GameUiUnitTargetAction(input, stale.target);
    stale.calls.length = 0;
    stale.state.canStartResult = { Success: false };

    await expect(
      sendCiv7GameUiUnitTargetAction({ ...input, expected }, stale.target)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Unit target evidence changed after service admission.",
    });
    expect(stale.calls.some((call) => call.kind === "send")).toBe(false);

    const nativeFailure = unitTargetRuntime({
      sendError: new Error("native unit target send failed"),
    });
    const failureExpected = await checkCiv7GameUiUnitTargetAction(input, nativeFailure.target);
    nativeFailure.calls.length = 0;
    await expect(
      sendCiv7GameUiUnitTargetAction({ ...input, expected: failureExpected }, nativeFailure.target)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "native unit target send failed",
    });
    expect(nativeFailure.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });

  test("returns a strict validator block without dispatching", async () => {
    const runtime = unitTargetRuntime({ canStartResult: { Success: false } });
    const input = {
      unitId: actorId,
      ...targetLocation,
      actionId: "move-to" as const,
    };
    const expected = await checkCiv7GameUiUnitTargetAction(input, runtime.target);
    runtime.calls.length = 0;

    await expect(
      sendCiv7GameUiUnitTargetAction({ ...input, expected }, runtime.target)
    ).resolves.toEqual({
      sent: false,
      actionId: "move-to",
      validation: expected,
      before: expected.snapshot,
      after: expected.snapshot,
    });
    expect(runtime.calls.map((call) => call.kind)).toEqual(["war", "check"]);
  });
});

type ComponentId = Civ7UnitTargetSnapshot["unitId"];
type NativeArgs = Civ7UnitTargetActionCheckResult["args"];
type NativeCall =
  | Readonly<{
      kind: "combat";
      unitId: ComponentId;
      args: NativeArgs;
    }>
  | Readonly<{
      kind: "war";
      unitId: ComponentId;
      target: typeof targetLocation;
    }>
  | Readonly<{
      kind: "check";
      family: "command" | "operation";
      unitId: ComponentId;
      operationType: unknown;
      args: NativeArgs;
      includeDetails?: boolean;
    }>
  | Readonly<{
      kind: "send";
      family: "command" | "operation";
      unitId: ComponentId;
      operationType: unknown;
      args: NativeArgs;
    }>;

function unitTargetRuntime(
  options: Readonly<{
    actorLocation?: Civ7UnitTargetUnitSummary["location"];
    canStartResult?: unknown;
    combatType?: unknown;
    player2?: number | null;
    removeTargetOnSend?: boolean;
    sendAvailable?: boolean;
    sendError?: Error;
    sendResult?: unknown;
  }> = {}
): {
  target: Civ7GameUiUnitTargetTarget;
  calls: NativeCall[];
  state: {
    actorLocation: Civ7UnitTargetUnitSummary["location"];
    canStartResult: unknown;
    sent: boolean;
    targetPresent: boolean;
  };
} {
  const calls: NativeCall[] = [];
  const state = {
    actorLocation: Object.prototype.hasOwnProperty.call(options, "actorLocation")
      ? (options.actorLocation ?? null)
      : originLocation,
    canStartResult: Object.prototype.hasOwnProperty.call(options, "canStartResult")
      ? options.canStartResult
      : { Success: true },
    sent: false,
    targetPresent: true,
  };

  const router = (family: "command" | "operation") => ({
    canStart: (
      unitId: ComponentId,
      operationType: unknown,
      args: NativeArgs,
      includeDetails?: boolean
    ) => {
      calls.push({
        kind: "check",
        family,
        unitId,
        operationType,
        args,
        includeDetails,
      });
      return state.canStartResult;
    },
    ...(options.sendAvailable === false
      ? {}
      : {
          sendRequest: (unitId: ComponentId, operationType: unknown, args: NativeArgs) => {
            calls.push({
              kind: "send",
              family,
              unitId,
              operationType,
              args,
            });
            if (options.sendError) throw options.sendError;
            state.sent = true;
            state.actorLocation = targetLocation;
            if (options.removeTargetOnSend === true) state.targetPresent = false;
            return options.sendResult;
          },
        }),
  });

  return {
    calls,
    state,
    target: {
      CombatTypes: {
        COMBAT_RANGED: rangedCombatType,
      },
      Game: {
        Combat: {
          testAttackInto: (unitId, args) => {
            calls.push({
              kind: "combat",
              unitId,
              args: {
                X: args.X,
                Y: args.Y,
                Modifiers: args.Modifiers ?? 0,
              },
            });
            return Object.prototype.hasOwnProperty.call(options, "combatType")
              ? options.combatType
              : rangedCombatType;
          },
        },
        UnitCommands: router("command"),
        UnitOperations: router("operation"),
      },
      GameContext: {
        localPlayerID: 0,
      },
      GameplayMap: {
        getIndexFromLocation: ({ x, y }) => x * 1_000 + y,
      },
      MapUnits: {
        getUnits: (x, y) =>
          x === targetLocation.x && y === targetLocation.y && state.targetPresent
            ? [targetUnitId]
            : [],
      },
      PlayerIds: {
        NO_PLAYER: noPlayerId,
      },
      Players: {
        get: () => ({
          Diplomacy: {
            willMoveStartWar: (unitId: ComponentId, target: typeof targetLocation) => {
              calls.push({ kind: "war", unitId, target });
              const player2 = Object.prototype.hasOwnProperty.call(options, "player2")
                ? options.player2
                : noPlayerId;
              return player2 === null ? { Success: false } : { Success: true, Player2: player2 };
            },
          },
        }),
      },
      UnitOperationMoveModifiers: {
        NONE: 0,
        ATTACK: 1,
        MOVE_IGNORE_UNEXPLORED_DESTINATION: 2,
      },
      UnitOperationTypes: {
        MOVE_TO: "MOVE_TO",
      },
      Units: {
        get: (id) => {
          if (componentIdsMatch(id, actorId)) {
            return unitSummary(actorId, state.actorLocation, state.sent);
          }
          if (componentIdsMatch(id, targetUnitId) && state.targetPresent) {
            return unitSummary(targetUnitId, targetLocation, false);
          }
          return null;
        },
      },
    },
  };
}

function unitSummary(
  id: ComponentId,
  location: Civ7UnitTargetUnitSummary["location"],
  moved: boolean
) {
  return {
    id,
    location,
    Movement: {
      movementMovesRemaining: moved ? 0 : 1,
      movementTurnsRemaining: 0,
    },
    Combat: {
      attacksRemaining: 1,
    },
    Health: {
      damage: 0,
      maxDamage: 100,
    },
  };
}

function controllerTarget(target: Civ7GameUiUnitTargetTarget): Civ7GameUiRuntimeTarget {
  return Object.assign(Object.create(target) as object, {
    UI: {
      isInGame: () => true,
    },
    Players: {
      ...target.Players,
      getAliveHumanIds: () => [0],
    },
  }) as Civ7GameUiRuntimeTarget;
}

function componentIdsMatch(
  left: Readonly<{ owner: number; id: number; type?: number }>,
  right: Readonly<{ owner: number; id: number; type?: number }>
): boolean {
  return (
    left.owner === right.owner &&
    left.id === right.id &&
    (left.type ?? null) === (right.type ?? null)
  );
}
