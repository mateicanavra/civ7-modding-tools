import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test, vi } from "vitest";

import {
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  getCiv7ReadyUnitView,
} from "../src/index";
import { jsonPayloadFromCommandResult } from "../src/session/command-result";
import { boundedInteger } from "../src/validation";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7ReadyUnitView", () => {
  test("queries only stock-visible identities with stock parameters, never arbitrary enums", async () => {
    const operations = vi.fn(() => ({ Success: true }));
    const commands = vi.fn(() => ({ Success: true }));
    const context = unitContext(operations, commands);
    context.GameInfo.UnitOperations = [
      { OperationType: "UNITOPERATION_SKIP_TURN", VisibleInUI: true },
      { OperationType: "UNITOPERATION_WMD_STRIKE", VisibleInUI: true },
      { OperationType: "UNITOPERATION_UNSAFE_HIDDEN", VisibleInUI: false },
    ];
    context.GameInfo.UnitCommands = [{ CommandType: "UNITCOMMAND_ABILITY", VisibleInUI: true }];
    context.GameInfo.UnitAbilities = [
      { CommandType: "UNITCOMMAND_ABILITY", $index: 7 },
      { CommandType: "UNITCOMMAND_ABILITY", $index: 8 },
    ];
    const view = await runUnitView(context);

    expect(operations.mock.calls).toEqual([
      [testUnitId, "UNITOPERATION_SKIP_TURN", { X: -9999, Y: -9999, UnitAbilityType: -1 }, true],
      [testUnitId, "UNITOPERATION_SKIP_TURN", { X: -9999, Y: -9999, UnitAbilityType: -1 }, false],
      [
        testUnitId,
        "UNITOPERATION_WMD_STRIKE",
        { X: -9999, Y: -9999, UnitAbilityType: -1, Type: 99 },
        true,
      ],
      [
        testUnitId,
        "UNITOPERATION_WMD_STRIKE",
        { X: -9999, Y: -9999, UnitAbilityType: -1, Type: 99 },
        false,
      ],
    ]);
    expect(commands.mock.calls).toEqual([
      [testUnitId, "UNITCOMMAND_ABILITY", { X: -9999, Y: -9999, UnitAbilityType: 7 }, true],
      [testUnitId, "UNITCOMMAND_ABILITY", { X: -9999, Y: -9999, UnitAbilityType: 7 }, false],
      [testUnitId, "UNITCOMMAND_ABILITY", { X: -9999, Y: -9999, UnitAbilityType: 8 }, true],
      [testUnitId, "UNITCOMMAND_ABILITY", { X: -9999, Y: -9999, UnitAbilityType: 8 }, false],
    ]);
    expect(view.legalOperations.map((item) => item.operationType)).toEqual([
      "SKIP_TURN",
      "WMD_STRIKE",
      "ABILITY",
      "ABILITY",
    ]);
    expect(Value.Check(Civ7ReadyUnitViewResultSchema, view)).toBe(true);
  });

  test("does not retry an unavailable native signature or manufacture success", async () => {
    const operations = vi.fn(() => {
      throw new Error("unsupported native query");
    });
    const commands = vi.fn(() => ({ unexpected: true }));
    const context = unitContext(operations, commands);
    context.GameInfo.UnitOperations = [
      { OperationType: "UNITOPERATION_SKIP_TURN", VisibleInUI: true },
    ];
    context.GameInfo.UnitCommands = [{ CommandType: "UNITCOMMAND_WAKE", VisibleInUI: true }];
    const view = await runUnitView(context);

    expect(operations).toHaveBeenCalledTimes(1);
    expect(commands).toHaveBeenCalledTimes(1);
    expect(view.unitId).toEqual(testUnitId);
    expect(view.legalOperations).toEqual([]);
    expect(view.notes.some((note) => note.includes("availability remains unknown"))).toBe(true);
  });

  test("retains unresolved ready identity without querying native actions", async () => {
    const operations = vi.fn();
    const commands = vi.fn();
    const context = unitContext(operations, commands);
    context.Units.get = () => null;
    const view = await runUnitView(context);

    expect(view.unitId).toEqual(testUnitId);
    expect(view.unit).toEqual({ ok: true, value: null });
    expect(view.legalOperations).toEqual([]);
    expect(operations).not.toHaveBeenCalled();
    expect(commands).not.toHaveBeenCalled();
    expect(context.MapUnits.getUnits).not.toHaveBeenCalled();
    expect(view.notes.some((note) => note.includes("did not resolve to a live unit"))).toBe(true);
  });

  test.each([
    [0, 0],
    [4, 0],
    [0, 4],
    [4, 4],
  ])("bounds default-radius plot reads at map corner (%i, %i) without assuming wrap", async (x, y) => {
    const context = unitContext(vi.fn(), vi.fn());
    context.Units.get = () => ({ id: testUnitId, type: 1, location: { x, y } });
    const view = await runUnitView(context, 96, null);

    const expected = [];
    for (let row = Math.max(0, y - 2); row <= Math.min(4, y + 2); row++) {
      for (let column = Math.max(0, x - 2); column <= Math.min(4, x + 2); column++) {
        expected.push([column, row]);
      }
    }
    expect(context.MapUnits.getUnits.mock.calls).toEqual(expected);
    expect(context.MapUnits.getUnits).toHaveBeenCalledTimes(9);
    expect(context.GameplayMap.getGridWidth).toHaveBeenCalledTimes(1);
    expect(context.GameplayMap.getGridHeight).toHaveBeenCalledTimes(1);
    expect(view.notes.some((note) => note.includes("across-wrap neighbors are not queried"))).toBe(
      true
    );
    expect(Value.Check(Civ7ReadyUnitViewResultSchema, view)).toBe(true);
  });

  test("retains the full in-bounds neighborhood away from the map edges", async () => {
    const context = unitContext(vi.fn(), vi.fn());
    context.Units.get = () => ({ id: testUnitId, type: 1, location: { x: 2, y: 2 } });
    const view = await runUnitView(context, 96, 2);

    expect(context.MapUnits.getUnits).toHaveBeenCalledTimes(25);
    expect(view.notes.some((note) => note.includes("coverage is clipped"))).toBe(false);
  });

  test.each([
    [0, 5],
    [-1, 5],
    [5, 0],
    [5, -1],
    [4.5, 5],
    [5, 4.5],
    [Number.NaN, 5],
    [5, Number.POSITIVE_INFINITY],
  ])("limits invalid map dimensions (%s, %s) to the live actor plot", async (width, height) => {
    const context = unitContext(vi.fn(), vi.fn());
    context.GameplayMap.getGridWidth.mockReturnValue(width);
    context.GameplayMap.getGridHeight.mockReturnValue(height);
    const view = await runUnitView(context, 96, 2);

    expect(context.MapUnits.getUnits.mock.calls).toEqual([[1, 1]]);
    expect(view.unitId).toEqual(testUnitId);
    expect(view.notes.some((note) => note.includes("broader neighborhood remains unknown"))).toBe(
      true
    );
  });

  test("does not guess neighborhood bounds when dimension getters are absent or throw", async () => {
    const context = unitContext(vi.fn(), vi.fn());
    Reflect.deleteProperty(context.GameplayMap, "getGridWidth");
    context.GameplayMap.getGridHeight.mockImplementation(() => {
      throw new Error("map dimensions unavailable");
    });
    const view = await runUnitView(context, 96, 2);

    expect(context.MapUnits.getUnits.mock.calls).toEqual([[1, 1]]);
    expect(context.GameplayMap.getGridHeight).toHaveBeenCalledTimes(1);
    expect(view.notes.some((note) => note.includes("broader neighborhood remains unknown"))).toBe(
      true
    );
  });

  test.each([
    [5, 1, "height"],
    [1, 5, "width"],
  ] as const)("rejects actor location (%i, %i) outside a known bound when %s is unavailable", async (x, y, unavailable) => {
    const context = unitContext(vi.fn(), vi.fn());
    context.Units.get = () => ({ id: testUnitId, type: 1, location: { x, y } });
    const getter =
      unavailable === "height"
        ? context.GameplayMap.getGridHeight
        : context.GameplayMap.getGridWidth;
    getter.mockImplementation(() => {
      throw new Error("one map dimension is unavailable");
    });
    const view = await runUnitView(context, 96, 2);

    expect(context.MapUnits.getUnits).not.toHaveBeenCalled();
    expect(view.unitId).toEqual(testUnitId);
    expect(view.notes.some((note) => note.includes("no plot query was made"))).toBe(true);
  });

  test("radius zero reads only the live actor plot without additional dimension queries", async () => {
    const context = unitContext(vi.fn(), vi.fn());
    const view = await runUnitView(context);

    expect(context.MapUnits.getUnits.mock.calls).toEqual([[1, 1]]);
    expect(context.GameplayMap.getGridWidth).not.toHaveBeenCalled();
    expect(context.GameplayMap.getGridHeight).not.toHaveBeenCalled();
    expect(view.unitId).toEqual(testUnitId);
  });

  test.each([
    [-1, 1],
    [1, -1],
    [0.5, 1],
    [1, Number.NaN],
    [5, 1],
    [1, 5],
  ])("does not query an invalid or out-of-bounds actor location (%s, %s)", async (x, y) => {
    const context = unitContext(vi.fn(), vi.fn());
    context.Units.get = () => ({ id: testUnitId, type: 1, location: { x, y } });
    const view = await runUnitView(context, 96, 2);

    expect(context.MapUnits.getUnits).not.toHaveBeenCalled();
    expect(view.unitId).toEqual(testUnitId);
    expect(view.notes.some((note) => note.includes("no plot query was made"))).toBe(true);
  });

  test("reports unavailable in-bounds plot reads without retrying them", async () => {
    const context = unitContext(vi.fn(), vi.fn());
    context.MapUnits.getUnits.mockImplementation(() => {
      throw new Error("plot read unavailable");
    });
    const view = await runUnitView(context);

    expect(context.MapUnits.getUnits.mock.calls).toEqual([[1, 1]]);
    expect(view.notes.some((note) => note.includes("nearby plot reads failed"))).toBe(true);
  });

  test("marks unavailable stock support and bounded coverage rather than scanning enums", async () => {
    const operations = vi.fn(() => ({ Success: true }));
    const context = unitContext(operations, vi.fn());
    context.GameInfo.UnitOperations = [
      { OperationType: "UNITOPERATION_SKIP_TURN", VisibleInUI: true },
      { OperationType: "UNITOPERATION_SLEEP", VisibleInUI: true },
    ];
    const bounded = await runUnitView(context, 1);
    expect(operations).toHaveBeenCalledTimes(2);
    expect(bounded.notes.some((note) => note.includes("coverage reached maxOperations"))).toBe(
      true
    );

    operations.mockClear();
    context.GameInfo.UnitAbilities = undefined;
    const unavailable = await runUnitView(context);
    expect(operations).not.toHaveBeenCalled();
    expect(unavailable.legalOperations).toEqual([]);
    expect(unavailable.unitId).toEqual(testUnitId);
    expect(unavailable.notes.some((note) => note.includes("does not prove no legal action"))).toBe(
      true
    );
  });

  test("reads the first ready unit view without sending operations", async () => {
    const server = await startReadyUnitTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7ReadyUnitView(
        {},
        {
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        }
      );

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        unitId: { owner: 0, id: 458752, type: 26 },
        legalOperations: [
          {
            family: "unit-operation",
            operationType: "SKIP_TURN",
            valid: true,
          },
        ],
      });
      expect(server.received.some((message) => message.includes("readReadyUnitView"))).toBe(true);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
      expect(
        Value.Check(Civ7ReadyUnitViewInputSchema, {
          unitId: { owner: 0, id: 458752, type: 26 },
          radius: 2,
          maxOperations: 96,
        })
      ).toBe(true);
      expect(Value.Check(Civ7ReadyUnitViewInputSchema, { radius: 6 })).toBe(false);
      expect(Value.Check(Civ7ReadyUnitViewInputSchema, { rawCommand: "readReadyUnitView()" })).toBe(
        false
      );
      expect(Value.Check(Civ7ReadyUnitViewResultSchema, view)).toBe(true);
      expect(
        Value.Check(Civ7ReadyUnitViewResultSchema, {
          ...view,
          command: "readReadyUnitView()",
        })
      ).toBe(false);
    } finally {
      await server.close();
    }
  });
});

const testUnitId = { owner: 0, id: 458752, type: 26 };

function unitContext(operations: ReturnType<typeof vi.fn>, commands: ReturnType<typeof vi.fn>) {
  return {
    GameContext: { localPlayerID: 0 },
    Game: { UnitOperations: { canStart: operations }, UnitCommands: { canStart: commands } },
    UnitOperationTypes: new Proxy(
      { SKIP_TURN: 1, WMD_STRIKE: 2, UNSAFE_ENUM: 3 },
      {
        ownKeys: () => {
          throw new Error("Generic native enum enumeration is forbidden");
        },
      }
    ),
    UnitCommandTypes: new Proxy(
      { ABILITY: 4, WAKE: 5, UNSAFE_ENUM: 6 },
      {
        ownKeys: () => {
          throw new Error("Generic native enum enumeration is forbidden");
        },
      }
    ),
    GameInfo: {
      Units: { lookup: () => ({ UnitType: "UNIT_WARRIOR" }) },
      UnitOperations: [] as Array<{ OperationType: string; VisibleInUI: boolean }>,
      UnitCommands: [] as Array<{ CommandType: string; VisibleInUI: boolean }>,
      UnitAbilities: [] as
        | Array<{ CommandType?: string; OperationType?: string; $index: number }>
        | undefined,
    },
    Units: { get: (): object | null => ({ id: testUnitId, type: 1, location: { x: 1, y: 1 } }) },
    UI: { Player: { getHeadSelectedUnit: () => null, getFirstReadyUnit: () => testUnitId } },
    GameplayMap: { getGridWidth: vi.fn(() => 5), getGridHeight: vi.fn(() => 5) },
    MapUnits: {
      getUnits: vi.fn((x: number, y: number) => {
        if (
          !Number.isSafeInteger(x) ||
          !Number.isSafeInteger(y) ||
          x < 0 ||
          y < 0 ||
          x >= 5 ||
          y >= 5
        )
          throw new Error("Off-map native plot query is forbidden");
        return [];
      }),
    },
    Database: {
      makeHash: (type: string) => {
        expect(type).toBe("WMD_NUCLEAR_DEVICE");
        return 99;
      },
    },
  };
}

async function runUnitView(
  context: ReturnType<typeof unitContext>,
  maxOperations = 96,
  radius: number | null = 0
) {
  return await getCiv7ReadyUnitView(
    { maxOperations, ...(radius == null ? {} : { radius }) },
    {},
    {
      boundedInteger,
      executeAppUiCommand: async ({ command }) => ({
        host: "mock",
        port: 0,
        state: { id: "65535", name: "App UI" },
        output: [String(runInNewContext(command, context, { timeout: 1_000 }))],
      }),
      parseReadyUnitView: (result, label) => jsonPayloadFromCommandResult(result, label),
    }
  );
}

async function startReadyUnitTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message.includes("readReadyUnitView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyUnitView())]));
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
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

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: "UNIT_ARMY_COMMANDER",
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: {
      ok: true,
      value: null,
    },
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: "UNIT_ARMY_COMMANDER" }],
        },
      ],
    },
    notes: ["Read-only ready-unit view. Use operation validation before mutation."],
  };
}
