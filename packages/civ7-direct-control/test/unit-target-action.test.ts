import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import { getCiv7UnitTargetAction, requestCiv7UnitTargetAction } from "../src/index";

type ComponentId = {
  owner: number;
  id: number;
  type: number;
};

type UnitTargetActionInput = {
  unitId: ComponentId;
  x: number;
  y: number;
};

type UnitTargetActionCall = {
  input: UnitTargetActionInput;
  options: { send?: boolean };
};

type FakeTunerServer = {
  received: string[];
  targetActionCalls: UnitTargetActionCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type UnitTargetMode = "verified" | "no-op-after-send";

describe("unit target action requests", () => {
  test("plans and sends through the official target order", async () => {
    const server = await startUnitTargetActionTunerServer();
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const input = { unitId, x: 23, y: 33 };
      const plan = await getCiv7UnitTargetAction(input, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });
      const request = await requestCiv7UnitTargetAction(input, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(plan).toMatchObject({
        unitId,
        target: { x: 23, y: 33 },
        selected: {
          family: "unit-operation",
          operationType: "UNITOPERATION_RANGE_ATTACK",
          args: { X: 23, Y: 33, Modifiers: 3 },
        },
        sent: false,
        verification: {
          status: "not-sent",
          classification: "not-sent",
        },
      });
      expect(
        plan.candidates.map((candidate) => [candidate.family, candidate.operationType])
      ).toEqual([
        ["unit-operation", "UNITOPERATION_NAVAL_ATTACK"],
        ["unit-operation", "UNITOPERATION_AIR_ATTACK"],
        ["unit-operation", "UNITOPERATION_RANGE_ATTACK"],
        ["unit-command", "UNITCOMMAND_ARMY_OVERRUN"],
        ["unit-operation", "UNITOPERATION_SWAP_UNITS"],
        ["unit-operation", "MOVE_TO"],
      ]);
      expect(request).toMatchObject({
        unitId,
        target: { x: 23, y: 33 },
        selected: {
          family: "unit-operation",
          operationType: "UNITOPERATION_RANGE_ATTACK",
          args: { X: 23, Y: 33, Modifiers: 3 },
        },
        sent: true,
        verified: true,
        verification: {
          status: "verified",
          classification: "unit-state-changed",
          source: "immediate",
          attempts: 0,
        },
      });
      expect(request.afterUnit).toMatchObject({
        ok: true,
        value: { attacksRemaining: 0 },
      });
      expect(server.targetActionCalls).toEqual([
        { input, options: { send: false } },
        { input, options: { send: true } },
      ]);
    } finally {
      await server.close();
    }
  });

  test("reports sent no-ops as unverified postcondition misses without repeating the send", async () => {
    const server = await startUnitTargetActionTunerServer("no-op-after-send");
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const input = { unitId, x: 23, y: 33 };
      const request = await requestCiv7UnitTargetAction(input, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(request.selected).toMatchObject({
        family: "unit-operation",
        operationType: "UNITOPERATION_NAVAL_ATTACK",
        args: { X: 23, Y: 33, Modifiers: 3 },
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.verification).toMatchObject({
        status: "no-state-change",
        classification: "no-state-change",
        unitChanged: false,
        targetUnitsChanged: false,
        source: "bounded-poll",
      });
      expect(request.verification?.reason).toMatch(/re-read .* before repeating/i);
      expect(server.targetActionCalls[0]).toEqual({ input, options: { send: true } });
      expect(server.targetActionCalls.filter((call) => call.options.send === true)).toHaveLength(1);
      expect(server.targetActionCalls.slice(1).every((call) => call.options.send === false)).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });
});

async function startUnitTargetActionTunerServer(
  mode: UnitTargetMode = "verified"
): Promise<FakeTunerServer> {
  const received: string[] = [];
  const targetActionCalls: UnitTargetActionCall[] = [];
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
        } else {
          const targetActionCall = parseUnitTargetActionCall(frame.message);
          if (targetActionCall) {
            targetActionCalls.push(targetActionCall);
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify(unitTargetActionPayload(targetActionCall, mode)),
              ])
            );
          } else {
            socket.write(encodeResponse(frame.listenerId, ["2"]));
          }
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    targetActionCalls,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function parseUnitTargetActionCall(message: string): UnitTargetActionCall | undefined {
  const match = message.match(
    /return JSON\.stringify\(readUnitTargetAction\((\{.*\}), (\{.*\})\)\);/s
  );
  if (!match) return undefined;
  return {
    input: JSON.parse(match[1]),
    options: JSON.parse(match[2]),
  };
}

function unitTargetActionPayload(call: UnitTargetActionCall, mode: UnitTargetMode) {
  const { input } = call;
  const send = call.options.send === true;
  const targetIndex = 1457;
  const beforeUnit = unitProbe({ attacksRemaining: 1 });
  const beforeTargetUnits = {
    ok: true,
    value: [{ owner: 62, id: 123, type: 26 }],
  };
  const noOp = mode === "no-op-after-send";
  const candidates = officialUnitTargetCandidates(input, noOp);
  const selected =
    candidates.find(
      (candidate) => candidate.valid === true && candidate.targetInReturnedPlots !== false
    ) ?? null;

  return {
    unitId: input.unitId,
    target: { x: input.x, y: input.y, index: { ok: true, value: targetIndex } },
    beforeUnit,
    beforeTargetUnits,
    candidates,
    selected,
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit: noOp ? beforeUnit : unitProbe({ attacksRemaining: 0 }),
          afterTargetUnits: beforeTargetUnits,
          verified: !noOp,
          verification: {
            status: noOp ? "no-state-change" : "verified",
            classification: noOp ? "no-state-change" : "unit-state-changed",
            unitChanged: !noOp,
            targetUnitsChanged: false,
            destinationReached: false,
            requestedLocation: { x: input.x, y: input.y },
            landedLocation: { x: 22, y: 33 },
            reason: noOp
              ? "send returned but unit and target-plot probes did not change; re-read before repeating"
              : "unit state changed after send",
          },
        }
      : {
          verification: {
            status: "not-sent",
            classification: "not-sent",
            unitChanged: false,
            targetUnitsChanged: false,
            destinationReached: null,
            requestedLocation: { x: input.x, y: input.y },
            landedLocation: { x: 22, y: 33 },
            reason: "read-only target resolution; use --send to request a mutation",
          },
        }),
    notes: [
      "Selection follows the official right-click WorldInput target order: naval, air, ranged, overrun, swap, then MOVE_TO.",
    ],
  };
}

function officialUnitTargetCandidates(input: UnitTargetActionInput, noOp: boolean) {
  const attackArgs = { X: input.x, Y: input.y, Modifiers: 3 };
  const baseArgs = { X: input.x, Y: input.y };
  return [
    candidate("unit-operation", "UNITOPERATION_NAVAL_ATTACK", attackArgs, noOp),
    candidate("unit-operation", "UNITOPERATION_AIR_ATTACK", attackArgs, false),
    candidate("unit-operation", "UNITOPERATION_RANGE_ATTACK", attackArgs, true),
    candidate("unit-command", "UNITCOMMAND_ARMY_OVERRUN", baseArgs, false),
    candidate("unit-operation", "UNITOPERATION_SWAP_UNITS", baseArgs, false),
    candidate("unit-operation", "MOVE_TO", attackArgs, true),
  ];
}

function candidate(
  family: "unit-operation" | "unit-command",
  operationType: string,
  args: Record<string, number>,
  valid: boolean
) {
  return {
    family,
    operationType,
    args,
    valid,
    result: { Success: valid, ...(valid ? { Plots: [1457] } : {}) },
    targetInReturnedPlots: valid ? true : null,
  };
}

function unitProbe(input: { attacksRemaining: number }) {
  return {
    ok: true,
    value: {
      id: { owner: 0, id: 65536, type: 26 },
      location: { x: 22, y: 33 },
      movementMovesRemaining: 2,
      attacksRemaining: input.attacksRemaining,
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
