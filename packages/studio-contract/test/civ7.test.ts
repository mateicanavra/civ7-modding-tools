import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  civ7SetupSnapshotSchema,
  savedConfigsOutputSchema,
  savedSetupConfigurationSchema,
} from "../src/index.js";

function savedSetupConfiguration() {
  return {
    id: "tot-config",
    displayName: "ToT Config",
    fileName: "ToT Config.Civ7Cfg",
    summary: {
      mapSize: "MAPSIZE_SMALL",
      playerCount: 6,
      mapSeed: 43,
      gameSeed: 47,
    },
    gameOptions: { Crises: ["CRISIS_A", "CRISIS_B"] },
    mapOptions: { StartPosition: "START_POSITION_STANDARD" },
    playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_HATSHEPSUT" } }],
  } as const;
}

describe("Civ7 saved-configuration public DTO", () => {
  it("admits one complete grouped saved configuration and list response", () => {
    const configuration = savedSetupConfiguration();

    expect(Value.Check(savedSetupConfigurationSchema, configuration)).toBe(true);
    expect(
      Value.Check(savedConfigsOutputSchema, {
        ok: true,
        observedAt: "2026-06-01T00:00:01.000Z",
        configurations: [configuration],
      })
    ).toBe(true);
  });

  it("rejects missing groups, open summaries, and duplicate player slots", () => {
    const configuration = savedSetupConfiguration();
    const { mapOptions: _mapOptions, ...withoutMapOptions } = configuration;

    expect(Value.Check(savedSetupConfigurationSchema, withoutMapOptions)).toBe(false);
    expect(
      Value.Check(savedSetupConfigurationSchema, {
        ...configuration,
        summary: { ...configuration.summary, invented: true },
      })
    ).toBe(false);
    expect(
      Value.Check(savedSetupConfigurationSchema, {
        ...configuration,
        path: "/provider-private/ToT Config.Civ7Cfg",
      })
    ).toBe(false);
    expect(
      Value.Check(savedSetupConfigurationSchema, {
        ...configuration,
        playerOptions: [
          { playerId: 0, options: {} },
          { playerId: 0, options: { PlayerLeader: "LEADER_ASHOKA" } },
        ],
      })
    ).toBe(false);
  });
});

describe("Civ7 live setup public DTO", () => {
  it("admits only the bounded Studio setup observation", () => {
    const setup = {
      selectedMap: { file: "{swooper-maps}/maps/swooper-earthlike.js" },
      parameters: [
        {
          id: "Difficulty",
          exists: true,
          value: "DIFFICULTY_CUSTOM",
          possibleValues: [
            { value: "DIFFICULTY_CUSTOM" },
            { value: "DIFFICULTY_DEITY", hidden: true },
          ],
        },
      ],
      players: [
        {
          playerId: 0,
          parameters: [{ id: "PlayerLeader", exists: true, value: "LEADER_ASHOKA" }],
        },
      ],
      localPlayerId: 0,
    };

    expect(Value.Check(civ7SetupSnapshotSchema, setup)).toBe(true);
    expect(Value.Check(civ7SetupSnapshotSchema, { ...setup, state: { name: "App UI" } })).toBe(
      false
    );
    expect(
      Value.Check(civ7SetupSnapshotSchema, {
        ...setup,
        parameters: [{ ...setup.parameters[0], rawValue: "provider-private" }],
      })
    ).toBe(false);
  });

  it("rejects duplicate setup parameter and player identities", () => {
    const parameter = { id: "Difficulty", exists: true, value: "DIFFICULTY_CUSTOM" } as const;
    const player = {
      playerId: 0,
      parameters: [{ id: "PlayerLeader", exists: true, value: "LEADER_ASHOKA" }],
    } as const;

    expect(
      Value.Check(civ7SetupSnapshotSchema, {
        parameters: [parameter, parameter],
        players: [player],
      })
    ).toBe(false);
    expect(
      Value.Check(civ7SetupSnapshotSchema, {
        parameters: [parameter],
        players: [
          {
            ...player,
            parameters: [player.parameters[0], player.parameters[0]],
          },
        ],
      })
    ).toBe(false);
    expect(
      Value.Check(civ7SetupSnapshotSchema, {
        parameters: [parameter],
        players: [player, player],
      })
    ).toBe(false);
  });
});
