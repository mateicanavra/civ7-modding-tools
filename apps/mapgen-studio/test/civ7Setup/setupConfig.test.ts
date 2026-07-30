import { describe, expect, it } from "vitest";

import {
  clearStudioSetupSavedConfig,
  getLocalPlayerSetup,
  studioSavedWorldSettingsFromConfigFile,
  studioSetupConfigFromLiveSnapshot,
  studioSetupConfigFromSavedConfigFile,
  studioSetupDriftsFromSavedConfig,
  updateStudioSetupGameOption,
  updateStudioSetupMapScript,
  updateStudioSetupPlayerOption,
} from "../../src/features/civ7Setup/setupConfig";

describe("Civ7 Studio setup config", () => {
  it("resolves local-player authorship by player identity rather than override order", () => {
    const config = {
      gameOptions: {},
      mapOptions: {},
      playerOptions: [
        { playerId: 4, options: { PlayerLeader: "LEADER_ASHOKA" } },
        { playerId: 0, options: { PlayerLeader: "LEADER_HARRIET_TUBMAN" } },
      ],
    } as const;

    expect(getLocalPlayerSetup(config, 0)).toEqual({
      playerId: 0,
      options: { PlayerLeader: "LEADER_HARRIET_TUBMAN" },
    });
    expect(getLocalPlayerSetup(config, 2)).toEqual({ playerId: 2, options: {} });
  });

  it("partitions official live setup groups and preserves every observed player slot", () => {
    const config = studioSetupConfigFromLiveSnapshot({
      selectedMap: {
        file: "{swooper-maps}/maps/swooper-earthlike.js",
      },
      localPlayerId: 0,
      parameters: [
        { id: "Map", exists: true, value: "{swooper-maps}/maps/swooper-earthlike.js" },
        { id: "Difficulty", exists: true, value: "DIFFICULTY_CUSTOM" },
        { id: "DifficultyScience", exists: true, value: "DIFFICULTY_SOVEREIGN" },
        { id: "Crises", exists: true, value: ["CRISIS_A", "CRISIS_B"] },
        { id: "StartPosition", exists: true, value: "START_POSITION_STANDARD" },
        { id: "RawUnexpected", exists: true, value: "ignored" },
      ],
      players: [
        {
          playerId: 0,
          parameters: [
            { id: "PlayerLeader", exists: true, value: "LEADER_HARRIET_TUBMAN" },
            { id: "PlayerCivilization", exists: true, value: "CIVILIZATION_AMERICA" },
            { id: "PlayerDifficulty", exists: true, value: "DIFFICULTY_CUSTOM" },
          ],
        },
        {
          playerId: 1,
          parameters: [{ id: "PlayerLeader", exists: true, value: "LEADER_ASHOKA" }],
        },
      ],
    });

    expect(config).toMatchObject({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        DifficultyScience: "DIFFICULTY_SOVEREIGN",
        Crises: ["CRISIS_A", "CRISIS_B"],
      },
      mapOptions: { StartPosition: "START_POSITION_STANDARD" },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_HARRIET_TUBMAN",
            PlayerCivilization: "CIVILIZATION_AMERICA",
            PlayerDifficulty: "DIFFICULTY_CUSTOM",
          },
        },
        { playerId: 1, options: { PlayerLeader: "LEADER_ASHOKA" } },
      ],
    });
    expect(config.gameOptions).not.toHaveProperty("RawUnexpected");
    expect(Object.isFrozen(config.gameOptions.Crises)).toBe(true);
  });

  it("does not adopt setup parameters that live GameSetup refuses for authoring", () => {
    const config = studioSetupConfigFromLiveSnapshot({
      parameters: [
        { id: "Difficulty", exists: false, value: "DIFFICULTY_CUSTOM" },
        { id: "GameSpeeds", exists: true, hidden: true, value: "GAMESPEED_STANDARD" },
        { id: "AgeLength", exists: true, readOnly: true, value: "AGE_LENGTH_LONG" },
        { id: "DisasterIntensity", exists: true, destroyed: true, value: "DISASTER_HIGH" },
        {
          id: "AgeCountdownTimer",
          exists: true,
          invalidReason: "unavailable for this setup",
          value: "AGE_COUNTDOWN_LENGTH_LONG",
        },
        { id: "StartPosition", exists: true, invalidReason: 4, value: "START_POSITION_STANDARD" },
      ],
      players: [
        {
          playerId: 0,
          parameters: [
            { id: "PlayerLeader", exists: true, hidden: true, value: "LEADER_ASHOKA" },
            {
              id: "PlayerCivilization",
              exists: true,
              invalidReason: "leader unavailable",
              value: "CIVILIZATION_INDIA_MAURYA",
            },
          ],
        },
      ],
      localPlayerId: 0,
    });

    expect(config).toEqual({
      gameOptions: {},
      mapOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    });
  });

  it("rejects invalid public edits without replacing valid neighboring setup state", () => {
    const config = {
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
      mapOptions: { StartPosition: "START_POSITION_STANDARD" },
      playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_ASHOKA" } }],
    } as const;

    expect(() => updateStudioSetupMapScript(config, "invalid\nscript")).toThrow(
      "Civ7 map script is invalid"
    );
    expect(() =>
      Reflect.apply(updateStudioSetupGameOption, undefined, [config, "RawUnexpected", "value"])
    ).toThrow("Civ7 game option RawUnexpected is invalid");
    expect(config).toEqual({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
      mapOptions: { StartPosition: "START_POSITION_STANDARD" },
      playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_ASHOKA" } }],
    });
  });

  it("updates player setup values without dropping neighboring choices", () => {
    const updated = updateStudioSetupPlayerOption(
      {
        gameOptions: {},
        mapOptions: {},
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
      summary: {
        mapSize: "MAPSIZE_SMALL",
        playerCount: 6,
        leader: "LEADER_ALEXANDER",
        civilization: "CIVILIZATION_GREECE",
        difficulty: "DIFFICULTY_CUSTOM",
        gameSpeed: "GAMESPEED_STANDARD",
      },
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      mapOptions: { StartPosition: "START_POSITION_STANDARD" },
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

    expect(studioSetupConfigFromSavedConfigFile(savedConfig)).toEqual({
      savedConfig: {
        id: "tot-config",
        displayName: "ToT Config",
        fileName: "ToT Config.Civ7Cfg",
      },
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      mapOptions: { StartPosition: "START_POSITION_STANDARD" },
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
    });
  });

  it("refuses saved player counts that exceed the selected preset's official start slots", () => {
    const savedConfig = {
      id: "over-capacity",
      displayName: "Over capacity",
      fileName: "over-capacity.Civ7Cfg",
      summary: { mapSize: "MAPSIZE_TINY", playerCount: 5 },
      gameOptions: {},
      mapOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    };

    expect(studioSavedWorldSettingsFromConfigFile(savedConfig)).toEqual({
      mapSize: "MAPSIZE_TINY",
    });
  });

  it("refuses malformed saved configuration setup instead of silently selecting defaults", () => {
    const malformed = {
      id: "tot-config",
      displayName: "ToT Config",
      fileName: "ToT Config.Civ7Cfg",
      summary: {},
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    };

    expect(() =>
      Reflect.apply(studioSetupConfigFromSavedConfigFile, undefined, [malformed])
    ).toThrow("Saved Civ7 setup configuration is invalid");
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
      summary: {},
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
      },
      mapOptions: {},
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
      },
      gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
      mapOptions: {},
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
      summary: {},
      gameOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      mapOptions: {},
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
      expect(studioSetupDriftsFromSavedConfig(drifted, savedConfig)).toBe(true);
      const resynced = studioSetupConfigFromSavedConfigFile(savedConfig);
      expect(studioSetupDriftsFromSavedConfig(resynced, savedConfig)).toBe(false);
    });
  });
});
