import { describe, expect, it } from "vitest";

import {
  studioSetupConfigFromSavedConfigFile,
  studioSetupConfigFromLiveSnapshot,
  updateStudioSetupSavedConfig,
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
    const updated = updateStudioSetupPlayerOption({
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
    }, "PlayerLeader", "LEADER_ASHOKA");

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

  it("applies a saved config without dropping explicit neighboring setup choices", () => {
    const updated = updateStudioSetupSavedConfig({
      gameOptions: {
        AgeLength: "AGE_LENGTH_STANDARD",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_HARRIET_TUBMAN",
          },
        },
      ],
    }, {
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

    expect(updated.gameOptions).toEqual({
      AgeLength: "AGE_LENGTH_STANDARD",
      Difficulty: "DIFFICULTY_CUSTOM",
    });
    expect(updated.playerOptions[0]?.options.PlayerLeader).toBe("LEADER_ALEXANDER");
  });
});
