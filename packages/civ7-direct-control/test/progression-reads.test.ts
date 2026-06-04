import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7TraditionsViewInputSchema,
  Civ7TraditionsViewResultSchema,
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("progression read surfaces", () => {
  test("exports TypeBox schemas for the read-only traditions view atom", () => {
    expect(Value.Check(Civ7TraditionsViewInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7TraditionsViewInputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(Civ7TraditionsViewInputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(Civ7TraditionsViewInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TraditionsViewInputSchema, { rawCommand: "readTraditionsView()" })).toBe(false);

    const result = traditionsViewResult();
    expect(Value.Check(Civ7TraditionsViewResultSchema, result)).toBe(true);
    expect(Value.Check(Civ7TraditionsViewResultSchema, {
      ...result,
      active: [
        {
          ...result.active[0],
          actionHints: [
            {
              ...result.active[0].actionHints[0],
              operationType: "sendRequest",
            },
          ],
        },
      ],
    })).toBe(false);
    expect(Value.Check(Civ7TraditionsViewResultSchema, {
      ...result,
      hiddenInfoPolicy: "raw-debug-output",
    })).toBe(false);
    expect(Value.Check(Civ7TraditionsViewResultSchema, {
      ...result,
      rawCommand: "readTraditionsView()",
    })).toBe(false);
  });

  test("reads traditions view through App UI without sending tradition operations", async () => {
    const server = await startProgressionReadTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7TraditionsView(
        { playerId: 0 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        playerId: 0,
        government: {
          type: "GOVERNMENT_CHIEFDOM",
          name: "Chiefdom",
        },
        slots: {
          active: 1,
          available: 1,
          open: 1,
        },
        actions: {
          activate: 1,
          deactivate: 2,
        },
        active: [
          expect.objectContaining({
            id: 101,
            type: "TRADITION_CODE_OF_LAWS",
            active: true,
            actionHints: [
              expect.objectContaining({
                kind: "deactivate",
                operationType: "CHANGE_TRADITION",
                args: { TraditionType: 101, Action: 2 },
              }),
            ],
          }),
        ],
        available: [
          expect.objectContaining({
            id: 202,
            type: "TRADITION_ORAL_TRADITION",
            unlocked: true,
            recentUnlock: true,
            actionHints: [
              expect.objectContaining({
                kind: "activate",
                validation: { ok: true, value: { Success: true } },
              }),
            ],
          }),
        ],
        hiddenInfoPolicy: "player-culture-runtime",
      });
      expect(view.recommendedCli).toEqual([
        "game play change-tradition --player-id 0 --tradition-type 202 --action 1",
        "game play change-tradition --player-id 0 --tradition-type 202 --action 1",
      ]);
      expect(view.notes.join("\n")).toContain("Read-only traditions view");
      expect(view.notes.join("\n")).toContain("does not send CHANGE_TRADITION");
      expect(server.received).toEqual(["LSQ:", expect.stringContaining("CMD:65535:(() =>")]);
      expect(server.received[1]).toContain("readTraditionsView");
      expect(server.received[1]).toContain("GameInfo.Traditions.lookup");
      expect(server.received[1]).not.toContain(".sendRequest(");
    } finally {
      await server.close();
    }
  });

  test("reads progress dashboard with routed read sources and no chooser sends", async () => {
    const server = await startProgressionReadTunerServer();
    try {
      const { port } = server.address();
      const dashboard = await getCiv7ProgressDashboard(
        {},
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(dashboard).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        playerId: 0,
        age: {
          ageType: "AGE_ANTIQUITY",
          currentAgeProgressionPoints: { ok: true, value: 13 },
          maxAgeProgressionPoints: { ok: true, value: 30 },
        },
        player: {
          team: 3,
          historicalLegacyPointCountForTeam: { ok: true, value: 4 },
        },
        legacyPaths: [
          expect.objectContaining({
            legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
            enabledByDefault: true,
            enabledForPlayer: true,
            score: { ok: true, value: 7 },
            finalRequiredPathPoints: 10,
            nextMilestone: expect.objectContaining({
              ageProgressionMilestoneType: "MILESTONE_CULTURE_2",
            }),
          }),
        ],
        victories: {
          rows: [
            {
              victoryType: "VICTORY_CULTURE",
              victoryClassType: "VICTORY_CLASS_CULTURE",
              name: "Culture Victory",
              description: "Win through culture.",
            },
          ],
        },
        triumphs: {
          count: 1,
          rows: [
            {
              type: "TRIUMPH_CULTURE",
              name: "Culture Triumph",
              description: "Complete a culture triumph.",
            },
          ],
          source: "runtime-gameinfo",
        },
        hiddenInfoPolicy: "local-player-runtime-progress",
      });
      expect(dashboard.proof).toEqual({
        victoryManagerGlobal: { ok: true, value: "undefined" },
        sources: [
          "GameInfo.LegacyPaths",
          "player.LegacyPaths.getScore",
          "GameInfo.AgeProgressionMilestones",
          "Game.AgeProgressManager",
          "GameInfo.Victories",
          "GameInfo.Triumphs",
        ],
      });
      expect(dashboard.notes.join("\n")).toContain("Read-only progress dashboard");
      expect(dashboard.notes.join("\n")).toContain("does not choose technologies");
      expect(server.received).toEqual(["LSQ:", expect.stringContaining("CMD:65535:(() =>")]);
      expect(server.received[1]).toContain("readProgressDashboard");
      expect(server.received[1]).toContain("GameInfo.LegacyPaths");
      expect(server.received[1]).toContain("Game.AgeProgressManager");
      expect(server.received[1]).not.toContain(".sendRequest(");
      expect(server.received[1]).not.toContain("SET_TECH_TREE_NODE");
      expect(server.received[1]).not.toContain("SET_CULTURE_TREE_NODE");
    } finally {
      await server.close();
    }
  });
});

async function startProgressionReadTunerServer(): Promise<FakeTunerServer> {
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
        } else if (frame.message.includes("readTraditionsView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(traditionsView())]));
        } else if (frame.message.includes("readProgressDashboard")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(progressDashboard())]));
        } else {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                error: `unhandled fake tuner command: ${frame.message.slice(0, 160)}`,
              }),
            ])
          );
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

function traditionsView() {
  return {
    playerId: 0,
    turn: { ok: true, value: 42 },
    turnDate: { ok: true, value: "1200 BCE" },
    governmentType: { ok: true, value: 77 },
    government: {
      type: "GOVERNMENT_CHIEFDOM",
      name: "Chiefdom",
    },
    slots: {
      total: { ok: true, value: 2 },
      normal: { ok: true, value: 2 },
      crisis: { ok: true, value: 0 },
      active: 1,
      unlocked: 2,
      available: 1,
      open: 1,
    },
    actions: { activate: 1, deactivate: 2 },
    active: [
      traditionSummary({
        id: 101,
        type: "TRADITION_CODE_OF_LAWS",
        active: true,
        action: 2,
        kind: "deactivate",
        validation: { ok: true, value: { Success: true } },
      }),
    ],
    available: [
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
        validation: { ok: true, value: { Success: true } },
      }),
    ],
    recentUnlocks: [
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
        validation: { ok: true, value: { Success: true } },
      }),
    ],
    traditions: [
      traditionSummary({
        id: 101,
        type: "TRADITION_CODE_OF_LAWS",
        active: true,
        action: 2,
        kind: "deactivate",
        validation: { ok: true, value: { Success: true } },
      }),
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
        validation: { ok: true, value: { Success: true } },
      }),
    ],
    recommendedCli: [
      "game play change-tradition --player-id 0 --tradition-type 202 --action 1",
      "game play change-tradition --player-id 0 --tradition-type 202 --action 1",
    ],
    hiddenInfoPolicy: "player-culture-runtime",
    notes: [
      "Read-only traditions view; it does not send CHANGE_TRADITION or CONSIDER_ASSIGN_TRADITIONS.",
      "Use the exact TraditionType and Action values from actionHints, then validate with game play change-tradition before sending.",
      "Full slots may require deactivating an existing tradition before activating a new one; re-read this view after each mutation.",
    ],
  };
}

function traditionsViewResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    ...traditionsView(),
  };
}

function traditionSummary(input: {
  id: number;
  type: string;
  active: boolean;
  action: number;
  kind: "activate" | "deactivate";
  recentUnlock?: boolean;
  validation: { ok: true; value: { Success: boolean } };
}) {
  return {
    id: input.id,
    type: input.type,
    name: input.type.replace("TRADITION_", "").replaceAll("_", " "),
    description: `${input.type} description`,
    ageType: "AGE_ANTIQUITY",
    cultureSlotType: "SLOT_TRADITION",
    traitType: null,
    isCrisis: false,
    active: input.active,
    unlocked: true,
    recentUnlock: input.recentUnlock === true,
    actionHints: [
      {
        kind: input.kind,
        action: input.action,
        operationType: "CHANGE_TRADITION",
        args: { TraditionType: input.id, Action: input.action },
        validation: input.validation,
        cli: `game play change-tradition --player-id 0 --tradition-type ${input.id} --action ${input.action}`,
      },
    ],
  };
}

function progressDashboard() {
  return {
    localPlayerId: 0,
    playerId: 0,
    turn: { ok: true, value: 42 },
    turnDate: { ok: true, value: "1200 BCE" },
    age: {
      hash: 11,
      ageType: "AGE_ANTIQUITY",
      name: "Antiquity",
      chronologyIndex: 1,
      isFinalAge: { ok: true, value: false },
      isSingleAge: { ok: true, value: false },
      isExtendedGame: { ok: true, value: false },
      isAgeOver: { ok: true, value: false },
      currentAgeProgressionPoints: { ok: true, value: 13 },
      maxAgeProgressionPoints: { ok: true, value: 30 },
      primaryAgeProgression: { ok: true, value: "LEGACY_PATH_ANTIQUITY_CULTURE" },
    },
    player: {
      team: 3,
      historicalLegacyPointCountForTeam: { ok: true, value: 4 },
    },
    legacyPaths: [
      {
        legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
        legacyPathClassType: "LEGACY_PATH_CLASS_CULTURE",
        ageType: "AGE_ANTIQUITY",
        name: "Culture",
        description: "Culture legacy path.",
        enabledByDefault: true,
        enabledForPlayer: true,
        score: { ok: true, value: 7 },
        finalRequiredPathPoints: 10,
        nextMilestone: {
          ageProgressionMilestoneType: "MILESTONE_CULTURE_2",
          legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
          requiredPathPoints: 10,
          finalMilestone: true,
          progressionPoints: { ok: true, value: 5 },
          complete: { ok: true, value: false },
          reachedByScore: false,
        },
        milestones: [
          {
            ageProgressionMilestoneType: "MILESTONE_CULTURE_1",
            legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
            requiredPathPoints: 5,
            finalMilestone: false,
            progressionPoints: { ok: true, value: 3 },
            complete: { ok: true, value: true },
            reachedByScore: true,
          },
          {
            ageProgressionMilestoneType: "MILESTONE_CULTURE_2",
            legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
            requiredPathPoints: 10,
            finalMilestone: true,
            progressionPoints: { ok: true, value: 5 },
            complete: { ok: true, value: false },
            reachedByScore: false,
          },
        ],
      },
    ],
    victories: {
      rows: [
        {
          victoryType: "VICTORY_CULTURE",
          victoryClassType: "VICTORY_CLASS_CULTURE",
          name: "Culture Victory",
          description: "Win through culture.",
        },
      ],
    },
    triumphs: {
      count: 1,
      rows: [
        {
          type: "TRIUMPH_CULTURE",
          name: "Culture Triumph",
          description: "Complete a culture triumph.",
        },
      ],
      source: "runtime-gameinfo",
    },
    proof: {
      victoryManagerGlobal: { ok: true, value: "undefined" },
      sources: [
        "GameInfo.LegacyPaths",
        "player.LegacyPaths.getScore",
        "GameInfo.AgeProgressionMilestones",
        "Game.AgeProgressManager",
        "GameInfo.Victories",
        "GameInfo.Triumphs",
      ],
    },
    hiddenInfoPolicy: "local-player-runtime-progress",
    notes: [
      "Read-only progress dashboard; it does not choose technologies, civics, productions, policies, or victory strategy.",
      "Legacy path scores come from the local player's LegacyPaths component and milestone thresholds come from GameInfo.AgeProgressionMilestones.",
      "VictoryManager is module-local in the official UI and may not be globally available through direct App UI eval; this wrapper uses the official lower-level runtime APIs exposed to App UI.",
      "Triumph rows are reported from runtime GameInfo.Triumphs. An empty table means no runtime triumph rows were available from this read, not that rewards are impossible elsewhere.",
    ],
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
