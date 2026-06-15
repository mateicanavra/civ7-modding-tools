import type { RunInGameOperationStatus } from "@civ7/studio-server";
import { describe, expect, it } from "vitest";

import {
  buildRunInGameClientSnapshot,
  buildRunInGameFingerprint,
  buildRunInGameSourceSnapshot,
  parseRunInGameClientSnapshot,
  parseRunInGameSourceSnapshot,
  relationForRunInGameOperation,
} from "../../src/features/runInGame/clientState";
import type { PipelineConfig, RecipeSettings, WorldSettings } from "../../src/ui/types";

const recipeSettings: RecipeSettings = {
  recipe: "standard",
  preset: "builtin:swooper-earthlike",
  seed: "123",
};

const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 8,
  resources: "balanced",
};

const pipelineConfig = {
  morphology: {
    knobs: {
      landmasses: "earthlike",
    },
  },
} as unknown as PipelineConfig;

const setupConfig = {
  gameOptions: {
    Difficulty: "DIFFICULTY_PRINCE",
  },
  playerOptions: [
    {
      playerId: 0,
      options: {
        PlayerLeader: "LEADER_HARRIET_TUBMAN",
        PlayerCivilization: "CIVILIZATION_AMERICA",
        PlayerDifficulty: "DIFFICULTY_PRINCE",
      },
    },
  ],
};

const status: RunInGameOperationStatus = {
  ok: true,
  requestId: "studio-run-in-game-test",
  phase: "complete",
  status: "complete",
  startedAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:01.000Z",
  completedPhases: [
    "materializing",
    "deploying",
    "checking-civ7",
    "preparing-setup",
    "starting-game",
    "waiting-for-proof",
  ],
};

describe("Run in Game client state", () => {
  it("detects whether a completed operation still matches the authored Studio state", () => {
    const snapshot = buildRunInGameClientSnapshot({
      requestId: status.requestId,
      recipeSettings,
      worldSettings,
      pipelineConfig,
      setupConfig,
      materializationMode: "durable",
      now: () => new Date("2026-06-01T00:00:00.000Z"),
    });
    const currentFingerprint = buildRunInGameFingerprint({
      recipeSettings,
      worldSettings,
      pipelineConfig,
      setupConfig,
      materializationMode: "durable",
    });

    expect(relationForRunInGameOperation({ status, snapshot, currentFingerprint })).toBe("current");
    expect(
      relationForRunInGameOperation({
        status,
        snapshot,
        currentFingerprint: buildRunInGameFingerprint({
          recipeSettings: { ...recipeSettings, seed: "456" },
          worldSettings,
          pipelineConfig,
          setupConfig,
          materializationMode: "durable",
        }),
      })
    ).toBe("stale");
    expect(
      relationForRunInGameOperation({
        status,
        snapshot,
        currentFingerprint: buildRunInGameFingerprint({
          recipeSettings,
          worldSettings,
          pipelineConfig,
          setupConfig: {
            ...setupConfig,
            playerOptions: [
              {
                playerId: 0,
                options: {
                  ...setupConfig.playerOptions[0]!.options,
                  PlayerLeader: "LEADER_ASHOKA",
                },
              },
            ],
          },
          materializationMode: "durable",
        }),
      })
    ).toBe("stale");
  });

  it("treats missing or mismatched stored snapshots as unknown instead of current", () => {
    expect(
      relationForRunInGameOperation({
        status,
        snapshot: null,
        currentFingerprint: "anything",
      })
    ).toBe("unknown");
    expect(
      relationForRunInGameOperation({
        status,
        snapshot: {
          requestId: "other-request",
          createdAt: "2026-06-01T00:00:00.000Z",
          fingerprint: "anything",
          seed: "123",
          mapSize: "MAPSIZE_STANDARD",
          playerCount: 8,
          resources: "balanced",
          recipe: "standard",
          preset: "builtin:swooper-earthlike",
          setupConfig,
          materializationMode: "durable",
        },
        currentFingerprint: "anything",
      })
    ).toBe("unknown");
  });

  it("parses only complete stored snapshots", () => {
    expect(
      parseRunInGameClientSnapshot(
        JSON.stringify({
          requestId: "request",
          createdAt: "2026-06-01T00:00:00.000Z",
          fingerprint: "fingerprint",
          seed: "123",
          mapSize: "MAPSIZE_STANDARD",
          playerCount: 8,
          resources: "balanced",
          recipe: "standard",
          preset: "none",
          materializationMode: "disposable",
        })
      )
    ).toMatchObject({ requestId: "request" });
    expect(parseRunInGameClientSnapshot('{"requestId":"request"}')).toBeNull();
    expect(parseRunInGameClientSnapshot("not json")).toBeNull();
  });

  it("round-trips the stored source snapshot used to sync Studio from a proved live game", () => {
    const source = buildRunInGameSourceSnapshot({
      requestId: status.requestId,
      recipeSettings,
      worldSettings,
      pipelineConfig,
      setupConfig,
      materializationMode: "disposable",
      selectedConfig: {
        id: "studio-current",
        label: "Live Game",
      },
      now: () => new Date("2026-06-01T00:00:00.000Z"),
    });

    expect(parseRunInGameSourceSnapshot(JSON.stringify(source))).toEqual(source);
    expect(
      parseRunInGameSourceSnapshot(
        JSON.stringify({
          requestId: status.requestId,
          createdAt: "2026-06-01T00:00:00.000Z",
          recipeSettings,
          worldSettings,
          materializationMode: "disposable",
        })
      )
    ).toBeNull();
  });
});
