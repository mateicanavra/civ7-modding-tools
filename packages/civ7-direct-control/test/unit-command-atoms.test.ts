import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  checkCiv7UnitResettle,
  checkCiv7UnitUpgrade,
  sendCiv7UnitResettle,
  sendCiv7UnitUpgrade,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type UnitCommandType = "UNITCOMMAND_UPGRADE" | "UNITCOMMAND_RESETTLE";

type RuntimeCall = Readonly<{
  kind: "canStart" | "sendRequest";
  unitId: unknown;
  operationType: UnitCommandType;
  args: unknown;
}>;

type FakeUnitCommandTunerServer = Readonly<{
  calls: RuntimeCall[];
  commandExecutions: string[];
  events: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

const unitId = { owner: 0, id: 65_536, type: 26 };
const destination = { x: 17, y: 25 };

describe("exact unit command wire atoms", () => {
  test("publishes only exact upgrade and resettle atoms on the package and live facades", () => {
    expect(directControl).toMatchObject({
      checkCiv7UnitUpgrade: expect.any(Function),
      sendCiv7UnitUpgrade: expect.any(Function),
      checkCiv7UnitResettle: expect.any(Function),
      sendCiv7UnitResettle: expect.any(Function),
      Civ7UnitCommandCheckResultSchema: expect.any(Object),
      Civ7UnitCommandSnapshotSchema: expect.any(Object),
      Civ7UnitCommandSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7UnitUpgrade,
      sendCiv7UnitUpgrade,
      checkCiv7UnitResettle,
      sendCiv7UnitResettle,
    });
    expect("canStartCiv7UnitCommand" in directControl).toBe(false);
    expect("requestCiv7UnitCommand" in directControl).toBe(false);
    expect("canStartCiv7UnitCommand" in liveCiv7DirectControl).toBe(false);
    expect("requestCiv7UnitCommand" in liveCiv7DirectControl).toBe(false);
    expect(Value.Check(directControl.Civ7UnitCommandCheckResultSchema, {})).toBe(false);
    expect(Value.Check(directControl.Civ7UnitCommandSendResultSchema, {})).toBe(false);
  });

  test("checks upgrade and resettle with one tuner execution each and minimal validation evidence", async () => {
    const server = await startUnitCommandTunerServer();
    try {
      const options = tunerOptions(server);
      const upgrade = await checkCiv7UnitUpgrade({ unitId }, options);
      const resettle = await checkCiv7UnitResettle({ unitId, destination }, options);

      expect(upgrade).toEqual({
        valid: true,
        result: { Success: true },
      });
      expect(resettle).toEqual({
        valid: true,
        result: { Success: true },
      });
      expect(upgrade).not.toHaveProperty("host");
      expect(upgrade).not.toHaveProperty("state");
      expect(upgrade).not.toHaveProperty("family");
      expect(server.commandExecutions).toHaveLength(2);
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          unitId,
          operationType: "UNITCOMMAND_UPGRADE",
          args: {},
        },
        {
          kind: "canStart",
          unitId,
          operationType: "UNITCOMMAND_RESETTLE",
          args: { X: 17, Y: 25 },
        },
      ]);
      expect(server.events).toEqual(["canStart", "canStart"]);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "upgrade",
      operationType: "UNITCOMMAND_UPGRADE" as const,
      send: (server: FakeUnitCommandTunerServer) =>
        sendCiv7UnitUpgrade({ unitId }, tunerOptions(server)),
      expectedArgs: {},
      expectedAfterUnit: expect.objectContaining({ activity: "UPGRADED" }),
    },
    {
      label: "resettle",
      operationType: "UNITCOMMAND_RESETTLE" as const,
      send: (server: FakeUnitCommandTunerServer) =>
        sendCiv7UnitResettle({ unitId, destination }, tunerOptions(server)),
      expectedArgs: { X: 17, Y: 25 },
      expectedAfterUnit: null,
    },
  ])("guards and sends $label in one tuner execution with before/after snapshots", async ({
    operationType,
    send,
    expectedArgs,
    expectedAfterUnit,
  }) => {
    const server = await startUnitCommandTunerServer();
    try {
      const result = await send(server);

      expect(result).toMatchObject({
        sent: true,
        validation: {
          valid: true,
          result: { Success: true },
        },
        before: {
          unit: {
            ok: true,
            value: {
              id: unitId,
              location: { x: 12, y: 13 },
              movement: 2,
              activity: "AWAKE",
              damage: 0,
              attacks: 1,
            },
          },
          selectedUnitId: { ok: true, value: unitId },
          firstReadyUnitId: { ok: true, value: unitId },
          blocker: { ok: true, value: 7 },
        },
        after: {
          unit: {
            ok: true,
            value: expectedAfterUnit,
          },
        },
      });
      expect(result).not.toHaveProperty("command");
      expect(result).not.toHaveProperty("postcondition");
      expect(result).not.toHaveProperty("verified");
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          unitId,
          operationType,
          args: expectedArgs,
        },
        {
          kind: "sendRequest",
          unitId,
          operationType,
          args: expectedArgs,
        },
      ]);
      const canStartIndex = server.events.indexOf("canStart");
      expect(server.events.slice(canStartIndex, canStartIndex + 2)).toEqual([
        "canStart",
        "sendRequest",
      ]);
    } finally {
      await server.close();
    }
  });

  test("returns guarded snapshot evidence and performs zero sends when fresh validation rejects", async () => {
    const server = await startUnitCommandTunerServer({ valid: false });
    try {
      const result = await sendCiv7UnitUpgrade({ unitId }, tunerOptions(server));

      expect(result).toMatchObject({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false },
        },
      });
      expect(result.after).toEqual(result.before);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          unitId,
          operationType: "UNITCOMMAND_UPGRADE",
          args: {},
        },
      ]);
      expect(server.events).toEqual([
        "unit",
        "selectedUnitId",
        "firstReadyUnitId",
        "blocker",
        "canStart",
      ]);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "malformed JSON",
      commandResponseParts: ["{not-json"],
      expectedMessage: /returned invalid JSON/,
    },
    {
      label: "an empty payload",
      commandResponseParts: [],
      expectedMessage: /returned an invalid payload/,
    },
  ])("rejects $label from every exact unit command body", async ({
    commandResponseParts,
    expectedMessage,
  }) => {
    const atoms = [
      {
        label: "upgrade check",
        call: (server: FakeUnitCommandTunerServer) =>
          checkCiv7UnitUpgrade({ unitId }, tunerOptions(server)),
      },
      {
        label: "resettle check",
        call: (server: FakeUnitCommandTunerServer) =>
          checkCiv7UnitResettle({ unitId, destination }, tunerOptions(server)),
      },
      {
        label: "upgrade send",
        call: (server: FakeUnitCommandTunerServer) =>
          sendCiv7UnitUpgrade({ unitId }, tunerOptions(server)),
      },
      {
        label: "resettle send",
        call: (server: FakeUnitCommandTunerServer) =>
          sendCiv7UnitResettle({ unitId, destination }, tunerOptions(server)),
      },
    ];

    for (const atom of atoms) {
      const server = await startUnitCommandTunerServer({ commandResponseParts });
      try {
        const failure = await captureFailure(() => atom.call(server));
        expect(failure, atom.label).toMatchObject({
          name: "Civ7DirectControlError",
          code: "command-failed",
          dispatchStatus: "dispatched",
        });
        expect(failure, atom.label).toBeInstanceOf(Error);
        expect((failure as Error).message, atom.label).toMatch(expectedMessage);
        expect(server.commandExecutions, atom.label).toHaveLength(1);
        expect(server.calls, atom.label).toEqual([]);
      } finally {
        await server.close();
      }
    }
  });

  test.each([
    {
      label: "upgrade",
      send: () =>
        sendCiv7UnitUpgrade({
          unitId: { owner: 0 } as typeof unitId,
        }),
    },
    {
      label: "resettle",
      send: () =>
        sendCiv7UnitResettle({
          unitId,
          destination: { x: -1, y: destination.y },
        }),
    },
  ])("classifies $label command construction failures as not dispatched", async ({ send }) => {
    await expect(send()).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
    });
  });
});

async function startUnitCommandTunerServer(
  options: Readonly<{
    commandResponseParts?: ReadonlyArray<string>;
    valid?: boolean;
  }> = {}
): Promise<FakeUnitCommandTunerServer> {
  const calls: RuntimeCall[] = [];
  const commandExecutions: string[] = [];
  const events: string[] = [];
  const runtime = {
    unit: {
      id: unitId,
      location: { x: 12, y: 13 },
      Movement: 2,
      Activity: "AWAKE",
      Damage: 0,
      Attacks: 1,
    } as Record<string, unknown> | null,
    selectedUnitId: unitId as typeof unitId | null,
    firstReadyUnitId: unitId as typeof unitId | null,
    blocker: 7,
  };
  const globals = {
    UnitCommandTypes: {
      UNITCOMMAND_UPGRADE: "UNITCOMMAND_UPGRADE",
      UNITCOMMAND_RESETTLE: "UNITCOMMAND_RESETTLE",
    },
    Units: {
      get: () => {
        events.push("unit");
        return runtime.unit;
      },
    },
    UI: {
      Player: {
        getHeadSelectedUnit: () => {
          events.push("selectedUnitId");
          return runtime.selectedUnitId;
        },
        getFirstReadyUnit: () => {
          events.push("firstReadyUnitId");
          return runtime.firstReadyUnitId;
        },
      },
    },
    GameContext: {
      localPlayerID: 0,
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => {
          events.push("blocker");
          return runtime.blocker;
        },
      },
      UnitCommands: {
        canStart: (requestedUnitId: unknown, operationType: UnitCommandType, args: unknown) => {
          events.push("canStart");
          calls.push({
            kind: "canStart",
            unitId: jsonClone(requestedUnitId),
            operationType,
            args: jsonClone(args),
          });
          return { Success: options.valid !== false };
        },
        sendRequest: (requestedUnitId: unknown, operationType: UnitCommandType, args: unknown) => {
          events.push("sendRequest");
          calls.push({
            kind: "sendRequest",
            unitId: jsonClone(requestedUnitId),
            operationType,
            args: jsonClone(args),
          });
          if (operationType === "UNITCOMMAND_UPGRADE" && runtime.unit) {
            runtime.unit = {
              ...runtime.unit,
              Activity: "UPGRADED",
            };
          } else {
            runtime.unit = null;
            runtime.selectedUnitId = null;
            runtime.firstReadyUnitId = null;
          }
          return { accepted: true };
        },
      },
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
        const command = frame.message.replace(/^CMD:[^:]+:/, "");
        commandExecutions.push(command);
        if (options.commandResponseParts !== undefined) {
          socket.write(encodeResponse(frame.listenerId, options.commandResponseParts));
          continue;
        }
        const output = runInNewContext(command, globals);
        socket.write(encodeResponse(frame.listenerId, [String(output)]));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    calls,
    commandExecutions,
    events,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function tunerOptions(server: FakeUnitCommandTunerServer) {
  return {
    host: "127.0.0.1",
    port: server.address().port,
    timeoutMs: 1_000,
  };
}

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected exact unit command to fail");
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function encodeResponse(listenerId: number, parts: ReadonlyArray<string>): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
