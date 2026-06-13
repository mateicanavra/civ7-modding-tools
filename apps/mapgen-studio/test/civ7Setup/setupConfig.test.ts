import { describe, expect, it } from "vitest";

import {
  clearStudioSetupSavedConfig,
  studioSetupConfigFromSavedConfigFile,
  studioSetupConfigFromLiveSnapshot,
  studioSetupDriftsFromSavedConfig,
  updateStudioSetupGameOption,
  updateStudioSetupPlayerOption,
} from "../../src/features/civ7Setup/setupConfig";

describe("Civ7 Studio setup config", () => {
  it("extracts bounded game and player setup choices from live Civ snapshots", () => {
    const config = studioSetupConfigFromLiveSnapshot({
      selectedMapRow: {
        file: "{swooper-maps}/maps/swooper-earthlike.js",
      },
      setup: {
        localPlayerId: { ok: true, value: 0 },
        parameters: [
          { id: "Map", exists: true, value: "{swooper-maps}/maps/swooper-earthlike.js" },
          { id: "Difficulty", exists: true, value: "DIFFICULTY_CUSTOM" },
          { id: "DifficultyScience", exists: true, value: "DIFFICULTY_SOVEREIGN" },
          { id: "RawUnexpected", exists: true, value: "ignored" },
        ],
        playerParameters: [
          {
            playerId: 0,
            parameters: [
              { id: "PlayerLeader", exists: true, value: "LEADER_HARRIET_TUBMAN" },
              { id: "PlayerCivilization", exists: true, value: "CIVILIZATION_AMERICA" },
              { id: "PlayerDifficulty", exists: true, value: "DIFFICULTY_CUSTOM" },
            ],
          },
        ],
      },
    });

    expect(config).toMatchObject({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        DifficultyScience: "DIFFICULTY_SOVEREIGN",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_HARRIET_TUBMAN",
            PlayerCivilization: "CIVILIZATION_AMERICA",
            PlayerDifficulty: "DIFFICULTY_CUSTOM",
          },
        },
      ],
    });
    expect(config.gameOptions).not.toHaveProperty("RawUnexpected");
  });

  it("updates player setup values without dropping neighboring choices", () => {
    const updated = updateStudioSetupPlayerOption(
      {
        gameOptions: {},
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
      "PlayerLeader",
      "LEADER_ASHOKA"
    );

    expect(updated.playerOptions[0]?.options).toEqual({
      PlayerLeader: "LEADER_ASHOKA",
      PlayerCivilization: "CIVILIZATION_AMERICA",
    });
  });

  it("loads visible setup defaults from a saved Civ configuration file", () => {
    const savedConfig = {
      id: "tot-config",
      displayName: "ToT Config",
      fileName: "ToT Config.Civ7Cfg",
      path: "/tmp/ToT Config.Civ7Cfg",
      sizeBytes: 128,
      modifiedAt: "2026-06-01T00:00:00.000Z",
      source: "local-disk" as const,
      summary: {
        mapSeed: 3507297712,
        leader: "LEADER_ALEXANDER",
        civilization: "CIVILIZATION_GREECE",
        difficulty: "DIFFICULTY_CUSTOM",
        gameSpeed: "GAMESPEED_STANDARD",
      },
      setupOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_ALEXANDER",
            PlayerCivilization: "CIVILIZATION_GREECE",
            PlayerDifficulty: "DIFFICULTY_CUSTOM",
          },
        },
      ],
    };

    expect(studioSetupConfigFromSavedConfigFile(savedConfig)).toMatchObject({
      savedConfig: {
        id: "tot-config",
        displayName: "ToT Config",
        fileName: "ToT Config.Civ7Cfg",
        path: "/tmp/ToT Config.Civ7Cfg",
      },
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      playerOptions: savedConfig.playerOptions,
    });
  });

  // Config-precedence pin (P7): selection applies the file EXACTLY. At launch
  // the engine loads the saved config file first and re-applies every studio
  // option on top, so any pre-existing studio key the file does not specify
  // would silently override the file — selection must wipe it.
  it("applying a saved config replaces prior studio options instead of merging over them", () => {
    const applied = studioSetupConfigFromSavedConfigFile({
      id: "tot-config",
      displayName: "ToT Config",
      fileName: "ToT Config.Civ7Cfg",
      path: "/tmp/ToT Config.Civ7Cfg",
      sizeBytes: 128,
      modifiedAt: "2026-06-01T00:00:00.000Z",
      source: "local-disk",
      summary: {},
      setupOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_ALEXANDER",
          },
        },
      ],
    });

    // No stale keys survive: the launch payload is the file, nothing else.
    expect(applied.gameOptions).toEqual({ Difficulty: "DIFFICULTY_CUSTOM" });
    expect(applied.playerOptions).toEqual([
      { playerId: 0, options: { PlayerLeader: "LEADER_ALEXANDER" } },
    ]);
  });

  it("deselecting keeps the current options as free-form custom state", () => {
    const cleared = clearStudioSetupSavedConfig({
      savedConfig: {
        id: "tot-config",
        displayName: "ToT Config",
        fileName: "ToT Config.Civ7Cfg",
        path: "/tmp/ToT Config.Civ7Cfg",
      },
      gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
      playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_ALEXANDER" } }],
    });

    expect(cleared.savedConfig).toBeUndefined();
    expect(cleared.gameOptions).toEqual({ Difficulty: "DIFFICULTY_CUSTOM" });
    expect(cleared.playerOptions[0]?.options.PlayerLeader).toBe("LEADER_ALEXANDER");
  });

  // Config-precedence pins (Y2, hardened in P7): the selector shows "Custom"
  // whenever the authored state differs AT ALL from the file-derived state —
  // re-selecting the config re-applies the file exactly and clears the drift.
  describe("saved-config drift detection", () => {
    const savedConfig = {
      id: "tot-config",
      displayName: "ToT Config",
      fileName: "ToT Config.Civ7Cfg",
      path: "/tmp/ToT Config.Civ7Cfg",
      sizeBytes: 128,
      modifiedAt: "2026-06-01T00:00:00.000Z",
      source: "local-disk" as const,
      summary: {},
      setupOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_ALEXANDER",
            PlayerCivilization: "CIVILIZATION_GREECE",
          },
        },
      ],
    };
    const applied = studioSetupConfigFromSavedConfigFile(savedConfig);

    it("is clean immediately after applying the saved config", () => {
      expect(studioSetupDriftsFromSavedConfig(applied, savedConfig)).toBe(false);
    });

    it("drifts when a game-setup dropdown supersedes a governed option", () => {
      const drifted = updateStudioSetupGameOption(applied, "GameSpeeds", "GAMESPEED_QUICK");
      expect(studioSetupDriftsFromSavedConfig(drifted, savedConfig)).toBe(true);
    });

    it("drifts when a player option supersedes the saved leader", () => {
      const drifted = updateStudioSetupPlayerOption(applied, "PlayerLeader", "LEADER_ASHOKA");
      expect(studioSetupDriftsFromSavedConfig(drifted, savedConfig)).toBe(true);
    });

    it("drifts when ANY option the file does not specify is added (it would override the file at launch)", () => {
      const edited = updateStudioSetupGameOption(applied, "AgeLength", "AGE_LENGTH_LONG");
      expect(studioSetupDriftsFromSavedConfig(edited, savedConfig)).toBe(true);
    });

    it("re-applying the saved config clears the drift (sync back)", () => {
      const drifted = updateStudioSetupGameOption(applied, "GameSpeeds", "GAMESPEED_QUICK");
      const resynced = studioSetupConfigFromSavedConfigFile(savedConfig);
      expect(studioSetupDriftsFromSavedConfig(resynced, savedConfig)).toBe(false);
    });
  });
});
