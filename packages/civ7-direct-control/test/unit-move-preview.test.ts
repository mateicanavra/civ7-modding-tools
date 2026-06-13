import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7MapLocationSchema,
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewResultSchema,
  getCiv7UnitMovePreview,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7UnitMovePreview", () => {
  test("reads official move preview with conservative relationship proof", async () => {
    const server = await startUnitMovePreviewTunerServer();
    try {
      const { port } = server.address();
      const result = await getCiv7UnitMovePreview(
        {
          unitId: { owner: 0, id: 65536, type: 26 },
          destination: { x: 25, y: 35 },
          maxPlots: 12,
          maxPathPlots: 8,
        },
        {
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        }
      );

      expect(result).toMatchObject({
        host: "127.0.0.1",
        port,
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        requestedUnitId: { owner: 0, id: 65536, type: 26 },
        selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
        firstReadyUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
        unitId: { owner: 0, id: 65536, type: 26 },
        unit: {
          ok: true,
          value: {
            id: { owner: 0, id: 65536, type: 26 },
            owner: 0,
            type: 222,
            typeName: "UNIT_GALLEY",
            location: { x: 24, y: 35 },
            movementMovesRemaining: 2,
            attacksRemaining: 1,
            damage: 0,
          },
        },
        reachableMovement: {
          ok: true,
          value: [
            { index: 2964, x: 24, y: 35 },
            { index: 2965, x: 25, y: 35 },
          ],
        },
        reachableZonesOfControl: { ok: true, value: [] },
        reachableTargets: {
          ok: true,
          value: [[{ index: 2966, x: 26, y: 35 }]],
        },
        queuedDestination: { ok: true, value: { x: 25, y: 35 } },
        queuedPath: {
          ok: true,
          value: {
            plotCount: 2,
            turns: 1,
            obstacles: [],
            rawKeys: ["obstacles", "plots", "turns"],
          },
        },
        requestedDestination: { x: 25, y: 35 },
        requestedPath: {
          ok: true,
          value: {
            plotCount: 2,
            turns: 1,
            obstacles: [],
            rawKeys: ["obstacles", "plots", "turns"],
          },
        },
        relationshipPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
        },
      });
      expect(result.relationshipPolicy.guidance).toMatch(
        /does not classify other-owner relationships/
      );
      expect(result.notes).toEqual(
        expect.arrayContaining([
          "Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.",
          "Relationship labels are intentionally conservative: owner mismatch is contact evidence, not relationship proof.",
        ])
      );

      expect(server.received).toHaveLength(2);
      expect(server.received[0]).toBe("LSQ:");
      expect(server.received[1]).toContain("CMD:65535:");
      expect(server.received[1]).toContain("readUnitMovePreview");
      expect(server.received[1]).toContain('"unitId":{"owner":0,"id":65536,"type":26}');
      expect(server.received[1]).toContain('"destination":{"x":25,"y":35}');
      expect(server.received[1]).toContain('"maxPlots":12');
      expect(server.received[1]).toContain('"maxPathPlots":8');
      expect(server.received[1]).toContain("getReachableMovement");
      expect(server.received[1]).toContain("getQueuedOperationDestination");
      expect(server.received[1]).toContain("getPathTo");
      expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35 })).toBe(true);
      expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35, rawCommand: "MOVE_TO" })).toBe(
        false
      );
      expect(Value.Check(Civ7MapLocationSchema, { x: 1.5, y: 0 })).toBe(false);
      expect(Value.Check(Civ7MapLocationSchema, { x: -1, y: 0 })).toBe(false);
      expect(Value.Check(Civ7MapLocationSchema, { x: 0, y: 1_000_001 })).toBe(false);
      expect(
        Value.Check(Civ7UnitMovePreviewInputSchema, {
          unitId: { owner: 0, id: 65536, type: 26 },
          destination: { x: 25, y: 35 },
          maxPlots: 12,
          maxPathPlots: 8,
        })
      ).toBe(true);
      expect(Value.Check(Civ7UnitMovePreviewInputSchema, { maxPlots: 513 })).toBe(false);
      expect(
        Value.Check(Civ7UnitMovePreviewInputSchema, { rawCommand: "readUnitMovePreview()" })
      ).toBe(false);
      expect(Value.Check(Civ7UnitMovePreviewInputSchema, { destination: { x: 1.5, y: 0 } })).toBe(
        false
      );
      expect(Value.Check(Civ7UnitMovePreviewInputSchema, { destination: { x: -1, y: 0 } })).toBe(
        false
      );
      expect(
        Value.Check(Civ7UnitMovePreviewInputSchema, { destination: { x: 0, y: 1_000_001 } })
      ).toBe(false);
      expect(
        Value.Check(Civ7UnitMovePreviewInputSchema, {
          destination: { x: 0, y: 0, rawCommand: "MOVE_TO" },
        })
      ).toBe(false);
      expect(Value.Check(Civ7UnitMovePreviewResultSchema, result)).toBe(true);
      expect(
        Value.Check(Civ7UnitMovePreviewResultSchema, {
          ...result,
          command: "readUnitMovePreview()",
        })
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("rejects out-of-range preview limits before issuing the App UI read", async () => {
    const server = await startUnitMovePreviewTunerServer();
    try {
      const { port } = server.address();
      await expect(
        getCiv7UnitMovePreview(
          {
            unitId: { owner: 0, id: 65536, type: 26 },
            destination: { x: 25, y: 35 },
            maxPlots: 9_999,
            maxPathPlots: 9_999,
          },
          {
            host: "127.0.0.1",
            port,
            timeoutMs: 1_000,
          }
        )
      ).rejects.toMatchObject({
        code: "command-failed",
        message: expect.stringContaining("maxPlots must be an integer between 1 and 512"),
      });
      expect(server.received).toHaveLength(0);
    } finally {
      await server.close();
    }
  });

  test("rejects map locations outside the validator boundary before issuing the App UI read", async () => {
    const server = await startUnitMovePreviewTunerServer();
    try {
      const { port } = server.address();
      for (const [destination, field] of [
        [{ x: 1.5, y: 0 }, "x"],
        [{ x: -1, y: 0 }, "x"],
        [{ x: 0, y: 1_000_001 }, "y"],
      ] as const) {
        await expect(
          getCiv7UnitMovePreview(
            {
              unitId: { owner: 0, id: 65536, type: 26 },
              destination,
            },
            {
              host: "127.0.0.1",
              port,
              timeoutMs: 1_000,
            }
          )
        ).rejects.toMatchObject({
          code: "command-failed",
          message: expect.stringContaining(`${field} must be an integer between 0 and 1000000`),
        });
      }
      expect(server.received).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
});

async function startUnitMovePreviewTunerServer(): Promise<FakeTunerServer> {
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
        } else if (frame.message.includes("readUnitMovePreview")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitMovePreviewView())]));
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

function unitMovePreviewView() {
  const unitId = { owner: 0, id: 65536, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 222,
        typeName: "UNIT_GALLEY",
        location: { x: 24, y: 35 },
        movementMovesRemaining: 2,
        attacksRemaining: 1,
        damage: 0,
      },
    },
    reachableMovement: {
      ok: true,
      value: [
        { index: 2964, x: 24, y: 35 },
        { index: 2965, x: 25, y: 35 },
      ],
    },
    reachableZonesOfControl: { ok: true, value: [] },
    reachableTargets: { ok: true, value: [[{ index: 2966, x: 26, y: 35 }]] },
    queuedDestination: { ok: true, value: { x: 25, y: 35 } },
    queuedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ["obstacles", "plots", "turns"],
      },
    },
    requestedDestination: { x: 25, y: 35 },
    requestedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ["obstacles", "plots", "turns"],
      },
    },
    relationshipPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.",
    },
    notes: [
      "Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.",
      "Reachable movement, targets, zones of control, queued destination, and path data come from the same Units preview APIs used by the Civ7 UI when available.",
      "Operation validators and postconditions remain authoritative before and after any send.",
      "Relationship labels are intentionally conservative: owner mismatch is contact evidence, not relationship proof.",
    ],
  };
}
