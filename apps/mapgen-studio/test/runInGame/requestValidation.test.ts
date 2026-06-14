import { describe, expect, it } from "vitest";

import {
  assertNoRawControlFields,
  parseRunInGameSetupRequest,
} from "../../src/server/runInGame/requestValidation";

describe("Run in Game request validation", () => {
  it("rejects raw control command fields anywhere in the payload", () => {
    expect(() => assertNoRawControlFields({
      config: {
        nested: {
          rawJs: "UI.notifyUIReady()",
        },
      },
    })).toThrow("raw control commands");
    expect(() => assertNoRawControlFields({
      config: {
        operations: [
          {
            rawCommand: "GameplayMap.revealAll()",
          },
        ],
      },
    })).toThrow("raw control commands");
  });

  it("keeps disposable setup requests on the selected shell-visible config id", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: "123",
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
      materialization: { mode: "disposable" },
      selectedConfig: { id: "swooper-earthlike" },
      config: { ok: true },
    })).toEqual({
      requestedMode: "disposable",
      id: "swooper-earthlike",
      seed: 123,
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
      restartCivProcess: false,
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
    });
  });

  it("falls disposable setup requests back to studio-current when no selected config id exists", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: "123",
      mapSize: "MAPSIZE_STANDARD",
      materialization: { mode: "disposable" },
      config: { ok: true },
    })).toMatchObject({
      requestedMode: "disposable",
      id: "studio-current",
      restartCivProcess: false,
    });
  });

  it("keeps durable setup requests on the selected repo-backed config id", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: 123,
      mapSize: "MAPSIZE_HUGE",
      materialization: { mode: "durable" },
      selectedConfig: { id: "swooper-earthlike" },
      config: { ok: true },
    })).toMatchObject({
      requestedMode: "durable",
      id: "swooper-earthlike",
      seed: 123,
      mapSize: "MAPSIZE_HUGE",
      restartCivProcess: false,
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
    });
  });

  it("normalizes explicit process restart recovery without making it a save concern", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: 123,
      mapSize: "MAPSIZE_STANDARD",
      recovery: { restartCivProcess: true },
      config: { ok: true },
    })).toMatchObject({
      requestedMode: "disposable",
      id: "studio-current",
      restartCivProcess: true,
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
    });
  });

  it("normalizes bounded setup config fields", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: 123,
      mapSize: "MAPSIZE_STANDARD",
      setupConfig: {
        savedConfig: {
          id: "tot-config",
          displayName: "ToT Config",
          fileName: "ToT Config.Civ7Cfg",
          path: "/tmp/ToT Config.Civ7Cfg",
        },
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        gameOptions: {
          Difficulty: "DIFFICULTY_CUSTOM",
          BadOption: "ignored",
        },
        playerOptions: [
          {
            playerId: 0,
            options: {
              PlayerLeader: "LEADER_HARRIET_TUBMAN",
              PlayerCivilization: "CIVILIZATION_AMERICA",
              BadPlayerOption: "ignored",
            },
          },
        ],
      },
      config: { ok: true },
    })).toMatchObject({
      setupConfig: {
        savedConfig: {
          id: "tot-config",
          displayName: "ToT Config",
          fileName: "ToT Config.Civ7Cfg",
          path: "/tmp/ToT Config.Civ7Cfg",
        },
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        gameOptions: {
          Difficulty: "DIFFICULTY_CUSTOM",
        },
        playerOptions: [
          {
            playerId: 0,
            options: {
              PlayerLeader: "LEADER_HARRIET_TUBMAN",
              PlayerCivilization: "CIVILIZATION_AMERICA",
            },
          },
        ],
      },
    });
  });

  it("rejects malformed setup fields before any mutation can be queued", () => {
    expect(() => parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: "not a number",
      config: { ok: true },
    })).toThrow("Seed must be an integer");
    expect(() => parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: 2147483648,
      config: { ok: true },
    })).toThrow("signed 32-bit integers");
    expect(() => parseRunInGameSetupRequest({
      recipeId: "other",
      seed: 123,
      config: { ok: true },
    })).toThrow("supports only mod-swooper-maps/standard");
  });
});
