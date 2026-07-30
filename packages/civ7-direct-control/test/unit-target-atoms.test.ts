import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";

import {
  type Civ7UnitTargetActionId,
  checkCiv7UnitTargetAction,
  observeCiv7UnitTarget,
  sendCiv7UnitTargetAction,
} from "../src/index";

const unitId = { owner: 0, id: 65_536, type: 26 };
const targetUnitId = { owner: 1, id: 131_072, type: 26 };
const target = { x: 11, y: 10 };

describe("exact unit target wire atoms", () => {
  test("observes immutable actor, target, combat, war, and modifier evidence", async () => {
    const runtime = await startRuntime({
      warResult: { Success: true, Player2: 1 },
    });
    try {
      const snapshot = await observeCiv7UnitTarget({ unitId, ...target }, runtime.options());

      expect(snapshot).toMatchObject({
        localPlayerId: 0,
        unitId,
        target: { ...target, index: 11010 },
        actor: {
          id: unitId,
          location: { x: 10, y: 10 },
          movementMovesRemaining: 2,
          attacksRemaining: 1,
          damage: 0,
          hitPoints: 100,
        },
        targetUnits: [
          {
            id: targetUnitId,
            location: target,
            damage: 25,
            hitPoints: 75,
          },
        ],
        trackedTargetUnits: [{ id: targetUnitId, unit: { id: targetUnitId } }],
        combatType: 2,
        rangedCombatType: 2,
        war: {
          observed: true,
          result: { Success: true, Player2: 1 },
          player2: 1,
          noPlayerId: -1,
          required: true,
        },
        modifiers: { none: 0, dispatch: 3 },
      });
      expect(runtime.canStartCalls).toEqual([]);
      expect(runtime.sendCalls).toEqual([]);
      expect(runtime.combatCalls).toHaveLength(1);
    } finally {
      await runtime.close();
    }
  });

  test.each([
    ["naval-attack", "operation", "UNITOPERATION_NAVAL_ATTACK", 0],
    ["air-attack", "operation", "UNITOPERATION_AIR_ATTACK", 0],
    ["ranged-attack", "operation", "UNITOPERATION_RANGE_ATTACK", 0],
    ["army-overrun", "command", "UNITCOMMAND_ARMY_OVERRUN", 0],
    ["swap-units", "operation", "UNITOPERATION_SWAP_UNITS", 0],
    ["move-to", "operation", "MOVE_ENUM", 3],
  ] as const)("checks only %s with exact native arguments", async (actionId, family, operationType, modifiers) => {
    const runtime = await startRuntime({
      canStartResult: { Success: true, Plots: [] },
    });
    try {
      const result = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId },
        runtime.options()
      );

      expect(result).toMatchObject({
        actionId,
        valid: true,
        args: { X: target.x, Y: target.y, Modifiers: modifiers },
        result: { Success: true, Plots: [] },
      });
      expect(runtime.canStartCalls).toEqual([
        {
          family,
          unitId,
          operationType,
          args: { X: target.x, Y: target.y, Modifiers: modifiers },
          includeDetails: false,
        },
      ]);
      expect(runtime.combatCalls).toHaveLength(actionId === "ranged-attack" ? 1 : 0);
      expect(runtime.sendCalls).toEqual([]);
    } finally {
      await runtime.close();
    }
  });

  test("requires literal Success true and never consults returned Plots membership", async () => {
    const invalid = await startRuntime({ canStartResult: { Success: 1, Plots: [1011] } });
    try {
      const result = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId: "naval-attack" },
        invalid.options()
      );
      expect(result.valid).toBe(false);
    } finally {
      await invalid.close();
    }

    const valid = await startRuntime({ canStartResult: { Success: true, Plots: [] } });
    try {
      const result = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId: "naval-attack" },
        valid.options()
      );
      expect(result.valid).toBe(true);
    } finally {
      await valid.close();
    }
  });

  test("keeps ranged and off-current-tile prerequisites as terminal raw evidence", async () => {
    const nonRanged = await startRuntime({ combatType: 1 });
    try {
      const result = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId: "ranged-attack" },
        nonRanged.options()
      );
      expect(result).toMatchObject({
        valid: false,
        prerequisite: { kind: "ranged-combat", satisfied: false },
        result: null,
      });
      expect(nonRanged.canStartCalls).toEqual([]);
    } finally {
      await nonRanged.close();
    }

    for (const actionId of ["swap-units", "move-to"] as const) {
      const currentTile = await startRuntime();
      try {
        const result = await checkCiv7UnitTargetAction(
          { unitId, x: 10, y: 10, actionId },
          currentTile.options()
        );
        expect(result).toMatchObject({
          valid: false,
          prerequisite: { kind: "off-current-tile", satisfied: false },
          result: null,
        });
        expect(currentTile.canStartCalls).toEqual([]);
      } finally {
        await currentTile.close();
      }
    }
  });

  test.each([
    "ranged-attack",
    "move-to",
  ] as const)("checks war before %s validation and skips canStart when confirmation is required", async (actionId) => {
    const runtime = await startRuntime({
      warResult: { Success: true, Player2: 1 },
    });
    try {
      const result = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId },
        runtime.options()
      );

      expect(result).toMatchObject({
        actionId,
        valid: false,
        result: null,
        snapshot: {
          war: {
            observed: true,
            player2: 1,
            required: true,
          },
        },
      });
      expect(runtime.canStartCalls).toEqual([]);
      expect(runtime.sendCalls).toEqual([]);
    } finally {
      await runtime.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats a nonthrowing sendRequest return of %s as dispatched exactly once", async (sendReturn) => {
    const runtime = await startRuntime({
      sendReturn,
      onSend: (state) => {
        state.units.get(targetUnitId.id)!.location = { x: 12, y: 10 };
      },
    });
    try {
      const input = { unitId, ...target, actionId: "swap-units" as const };
      const expected = await checkCiv7UnitTargetAction(input, runtime.options());
      const result = await sendCiv7UnitTargetAction({ ...input, expected }, runtime.options());

      expect(result.sent).toBe(true);
      expect(runtime.sendCalls).toHaveLength(1);
      expect(result.after.targetUnits).toEqual([]);
      expect(result.after.trackedTargetUnits).toMatchObject([
        {
          id: targetUnitId,
          unit: { id: targetUnitId, location: { x: 12, y: 10 } },
        },
      ]);
    } finally {
      await runtime.close();
    }
  });

  test("uses dispatch modifiers for attack sends while retaining NONE in admitted check evidence", async () => {
    const runtime = await startRuntime();
    try {
      const input = { unitId, ...target, actionId: "ranged-attack" as const };
      const expected = await checkCiv7UnitTargetAction(input, runtime.options());
      const result = await sendCiv7UnitTargetAction({ ...input, expected }, runtime.options());

      expect(expected.args.Modifiers).toBe(0);
      expect(result.sent).toBe(true);
      expect(runtime.sendCalls).toEqual([
        {
          family: "operation",
          unitId,
          operationType: "UNITOPERATION_RANGE_ATTACK",
          args: { X: target.x, Y: target.y, Modifiers: 3 },
        },
      ]);
    } finally {
      await runtime.close();
    }
  });

  test("retains explicitly tracked pre-dispatch units after they leave the target plot", async () => {
    const runtime = await startRuntime();
    try {
      runtime.state.units.get(targetUnitId.id)!.location = { x: 12, y: 10 };
      const snapshot = await observeCiv7UnitTarget(
        { unitId, ...target, trackedUnitIds: [targetUnitId] },
        runtime.options()
      );

      expect(snapshot.targetUnits).toEqual([]);
      expect(snapshot.trackedTargetUnits).toMatchObject([
        {
          id: targetUnitId,
          unit: { id: targetUnitId, location: { x: 12, y: 10 } },
        },
      ]);
    } finally {
      await runtime.close();
    }
  });

  test("refuses stale evidence and war-required sends before native invocation", async () => {
    const stale = await startRuntime();
    try {
      const input = { unitId, ...target, actionId: "move-to" as const };
      const expected = await checkCiv7UnitTargetAction(input, stale.options());
      stale.state.units.get(unitId.id)!.Movement.movementMovesRemaining = 1;

      await expect(
        sendCiv7UnitTargetAction({ ...input, expected }, stale.options())
      ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
      expect(stale.sendCalls).toEqual([]);
    } finally {
      await stale.close();
    }

    const war = await startRuntime({
      warResult: { Success: true, Player2: 1 },
    });
    try {
      const input = { unitId, ...target, actionId: "naval-attack" as const };
      const expected = await checkCiv7UnitTargetAction(input, war.options());

      await expect(
        sendCiv7UnitTargetAction({ ...input, expected }, war.options())
      ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
      expect(war.sendCalls).toEqual([]);
    } finally {
      await war.close();
    }
  });

  test("refuses an expected check admitted for a different action", async () => {
    const runtime = await startRuntime();
    try {
      const expected = await checkCiv7UnitTargetAction(
        { unitId, ...target, actionId: "naval-attack" },
        runtime.options()
      );

      await expect(
        sendCiv7UnitTargetAction(
          { unitId, ...target, actionId: "air-attack", expected },
          runtime.options()
        )
      ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
      expect(runtime.sendCalls).toEqual([]);
    } finally {
      await runtime.close();
    }
  });

  test("reports failures after the single native invocation as dispatched", async () => {
    const runtime = await startRuntime({
      onSend: (state) => {
        state.failMapRead = true;
      },
    });
    try {
      const input = { unitId, ...target, actionId: "army-overrun" as const };
      const expected = await checkCiv7UnitTargetAction(input, runtime.options());

      await expect(
        sendCiv7UnitTargetAction({ ...input, expected }, runtime.options())
      ).rejects.toMatchObject({ dispatchStatus: "dispatched" });
      expect(runtime.sendCalls).toHaveLength(1);
    } finally {
      await runtime.close();
    }
  });
});

type Unit = {
  id: typeof unitId;
  location: { x: number; y: number };
  Movement: { movementMovesRemaining: number; movementTurnsRemaining: number };
  Combat: { attacksRemaining: number };
  Health: { damage: number; maxDamage: number };
};

type RuntimeState = {
  units: Map<number, Unit>;
  failMapRead: boolean;
};

type RuntimeOptions = {
  combatType?: number;
  warResult?: unknown;
  canStartResult?: unknown;
  sendReturn?: unknown;
  onSend?: (state: RuntimeState) => void;
};

type NativeCall = {
  family: "operation" | "command";
  unitId: typeof unitId;
  operationType: string;
  args: { X: number; Y: number; Modifiers: number };
  includeDetails: false;
};

type RuntimeHarness = {
  state: RuntimeState;
  combatCalls: Array<{
    unitId: typeof unitId;
    args: { X: number; Y: number; Modifiers: number };
  }>;
  canStartCalls: NativeCall[];
  sendCalls: Omit<NativeCall, "includeDetails">[];
  options(): { host: string; port: number; timeoutMs: number };
  close(): Promise<void>;
};

async function startRuntime(options: RuntimeOptions = {}): Promise<RuntimeHarness> {
  const actor = makeUnit(unitId, { x: 10, y: 10 }, 0);
  const targetUnit = makeUnit(targetUnitId, target, 25);
  const state: RuntimeState = {
    units: new Map([
      [unitId.id, actor],
      [targetUnitId.id, targetUnit],
    ]),
    failMapRead: false,
  };
  const canStartCalls: NativeCall[] = [];
  const combatCalls: RuntimeHarness["combatCalls"] = [];
  const sendCalls: Omit<NativeCall, "includeDetails">[] = [];
  const canStart = (
    family: NativeCall["family"],
    id: typeof unitId,
    operationType: string,
    args: NativeCall["args"],
    includeDetails: false
  ) => {
    canStartCalls.push({ family, unitId: id, operationType, args, includeDetails });
    return options.canStartResult ?? { Success: true };
  };
  const sendRequest = (
    family: NativeCall["family"],
    id: typeof unitId,
    operationType: string,
    args: NativeCall["args"]
  ) => {
    sendCalls.push({ family, unitId: id, operationType, args });
    options.onSend?.(state);
    return options.sendReturn;
  };
  const context = {
    Array,
    CombatTypes: { COMBAT_RANGED: 2 },
    Game: {
      Combat: {
        testAttackInto: (id: typeof unitId, args: { X: number; Y: number; Modifiers: number }) => {
          combatCalls.push({ unitId: id, args });
          return options.combatType ?? 2;
        },
      },
      UnitCommands: {
        canStart: (
          id: typeof unitId,
          operationType: string,
          args: NativeCall["args"],
          includeDetails: false
        ) => canStart("command", id, operationType, args, includeDetails),
        sendRequest: (id: typeof unitId, operationType: string, args: NativeCall["args"]) =>
          sendRequest("command", id, operationType, args),
      },
      UnitOperations: {
        canStart: (
          id: typeof unitId,
          operationType: string,
          args: NativeCall["args"],
          includeDetails: false
        ) => canStart("operation", id, operationType, args, includeDetails),
        sendRequest: (id: typeof unitId, operationType: string, args: NativeCall["args"]) =>
          sendRequest("operation", id, operationType, args),
      },
    },
    GameContext: { localPlayerID: 0 },
    GameplayMap: {
      getIndexFromLocation: ({ x, y }: { x: number; y: number }) => x * 1_000 + y,
    },
    MapUnits: {
      getUnits: (x: number, y: number) => {
        if (state.failMapRead) throw new Error("post-send map read failed");
        return [...state.units.values()]
          .filter((unit) => unit.location.x === x && unit.location.y === y)
          .map((unit) => unit.id);
      },
    },
    PlayerIds: { NO_PLAYER: -1 },
    Players: {
      get: () => ({
        Diplomacy: {
          willMoveStartWar: () => options.warResult ?? { Success: false },
        },
      }),
    },
    UnitOperationMoveModifiers: {
      NONE: 0,
      ATTACK: 1,
      MOVE_IGNORE_UNEXPLORED_DESTINATION: 2,
    },
    UnitOperationTypes: { MOVE_TO: "MOVE_ENUM" },
    Units: {
      get: (id: typeof unitId) => state.units.get(id.id) ?? null,
    },
  };

  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
          continue;
        }
        const match = frame.message.match(/^CMD:\d+:(.*)$/s);
        const output = match
          ? String(runInNewContext(match[1], context))
          : JSON.stringify({ error: "unexpected command" });
        socket.write(encodeResponse(frame.listenerId, [output]));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  return {
    state,
    combatCalls,
    canStartCalls,
    sendCalls,
    options: () => ({
      host: "127.0.0.1",
      port: (server.address() as AddressInfo).port,
      timeoutMs: 1_000,
    }),
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function makeUnit(id: typeof unitId, location: { x: number; y: number }, damage: number): Unit {
  return {
    id,
    location,
    Movement: { movementMovesRemaining: 2, movementTurnsRemaining: 0 },
    Combat: { attacksRemaining: 1 },
    Health: { damage, maxDamage: 100 },
  };
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
