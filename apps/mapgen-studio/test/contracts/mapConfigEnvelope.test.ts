import {
  createDefaultRunInGameSetupConfig,
  isMapConfigEnvelope,
  mapConfigs,
  normalizeRunInGameSetupConfig,
  runInGame,
  serializeConfigSource,
  serializeMapConfigEnvelope,
  serializeRunInGameStartSource,
  snapshotConfigSource,
  snapshotMapConfigEnvelope,
  snapshotRunInGameStartSource,
} from "@civ7/studio-contract";
import { describe, expect, it } from "vitest";

describe("map config envelope portability", () => {
  it("rejects a Date nested in the portable JSON payload", () => {
    expect(
      isMapConfigEnvelope({
        id: "test-map",
        name: "Test Map",
        description: "Portable envelope predicate test.",
        recipe: "standard",
        sortIndex: 1,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config: { createdAt: new Date("2026-07-10T00:00:00.000Z") },
      })
    ).toBe(false);
  });

  it("rejects path-like and unstable config ids at every envelope admission", () => {
    for (const id of [
      "../outside",
      "folder/config",
      "folder\\config",
      ".hidden",
      "trailing-",
      "double--dash",
      "Uppercase",
      "space separated",
      "config.json",
    ]) {
      expect(
        snapshotMapConfigEnvelope({
          id,
          name: "Hostile Id",
          description: "Unsafe config identity fixture.",
          recipe: "standard",
          sortIndex: 1,
          latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
          config: {},
        }),
        id
      ).toBeUndefined();
    }

    const inputSchema = mapConfigs.saveDeploy["~orpc"].inputSchema;
    if (inputSchema === undefined)
      throw new Error("mapConfigs.saveDeploy must expose an input schema");
    const result = inputSchema["~standard"].validate({
      canonicalConfig: {
        id: "../outside",
        name: "Hostile Id",
        description: "Contract admission fixture.",
        recipe: "standard",
        sortIndex: 1,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config: {},
      },
    });
    expect("issues" in result).toBe(true);
  });

  it("does not admit caller-selected Save/Deploy paths", () => {
    const inputSchema = mapConfigs.saveDeploy["~orpc"].inputSchema;
    if (inputSchema === undefined)
      throw new Error("mapConfigs.saveDeploy must expose an input schema");
    const result = inputSchema["~standard"].validate({
      sourcePath: "../../outside.config.json",
      canonicalConfig: {
        id: "studio-current",
        name: "Studio Current",
        description: "Closed Save/Deploy request fixture.",
        recipe: "standard",
        sortIndex: 1,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config: {},
      },
    });
    expect("issues" in result).toBe(true);
  });

  it("rejects recursively unsafe own JSON keys before TypeBox can clone them", () => {
    for (const key of ["__proto__", "prototype", "constructor"]) {
      const raw = JSON.parse(
        `{"id":"test-map","name":"Test Map","description":"Unsafe key test.","recipe":"standard","sortIndex":1,"latitudeBounds":{"topLatitude":80,"bottomLatitude":-80},"config":{"nested":{"${key}":true}}}`
      );
      expect(isMapConfigEnvelope(raw), key).toBe(false);
      expect(snapshotMapConfigEnvelope(raw), key).toBeUndefined();
    }
  });

  it("rejects unsafe save/deploy envelopes before TypeBox transport parsing", () => {
    const unsafeConfig = JSON.parse(
      '{"id":"test-map","name":"Test Map","description":"Unsafe save test.","recipe":"standard","sortIndex":1,"latitudeBounds":{"topLatitude":80,"bottomLatitude":-80},"config":{"__proto__":{"polluted":true}}}'
    );
    const inputSchema = mapConfigs.saveDeploy["~orpc"].inputSchema;
    if (inputSchema === undefined)
      throw new Error("mapConfigs.saveDeploy must expose an input schema");

    const result = inputSchema["~standard"].validate({ canonicalConfig: unsafeConfig });
    expect("issues" in result).toBe(true);
  });

  it("clones immutable snapshots into schema-derived mutable wire DTOs", () => {
    const raw = {
      id: "test-map",
      name: "Test Map",
      description: "Portable envelope serialization test.",
      recipe: "standard",
      sortIndex: 1,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: { nested: [{ enabled: true }] },
    };
    const snapshot = snapshotMapConfigEnvelope(raw);
    expect(snapshot).toBeDefined();
    if (snapshot === undefined) return;

    const envelopeWire = serializeMapConfigEnvelope(snapshot);
    expect(envelopeWire).toEqual(snapshot);
    expect(envelopeWire).not.toBe(snapshot);
    expect(envelopeWire.config).not.toBe(snapshot.config);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(envelopeWire)).toBe(false);

    const source = snapshotConfigSource({
      kind: "editor",
      editorSessionId: "test-session",
      canonicalConfig: raw,
    });
    expect(source).toBeDefined();
    if (source === undefined) return;

    const sourceWire = serializeConfigSource(source);
    expect(sourceWire).toEqual(source);
    expect(sourceWire).not.toBe(source);
    expect(sourceWire.canonicalConfig).not.toBe(source.canonicalConfig);
  });

  it("isolates and freezes map-envelope snapshots", () => {
    const raw = {
      id: "test-map",
      name: "Test Map",
      description: "Snapshot isolation test.",
      recipe: "standard",
      sortIndex: 1,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: { nested: { label: "before" } },
    };
    const snapshot = snapshotMapConfigEnvelope(raw);
    expect(snapshot).toBeDefined();
    if (snapshot === undefined) return;

    raw.config.nested.label = "after";

    expect(snapshot.config).toEqual({ nested: { label: "before" } });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.config)).toBe(true);
    expect(Object.isFrozen(snapshot.config.nested)).toBe(true);
  });

  it("does not accept catalog config bytes on the external Run in Game source", () => {
    const catalogSource = {
      kind: "catalog",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      canonicalConfig: {
        id: "swooper-earthlike",
        name: "Swooper Earthlike",
        description: "Must stay server-resolved.",
        recipe: "standard",
        sortIndex: 1,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config: {},
      },
    };
    const inputSchema = runInGame.start["~orpc"].inputSchema;
    if (inputSchema === undefined) throw new Error("runInGame.start must expose an input schema");

    expect(snapshotRunInGameStartSource(catalogSource)).toBeUndefined();
    const result = inputSchema["~standard"].validate({
      source: catalogSource,
      recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 43 },
      worldSettings: { mapSize: "MAPSIZE_STANDARD" },
    });
    expect("issues" in result).toBe(true);
  });

  it("serializes an internal catalog source as a path-only external request", () => {
    const source = snapshotConfigSource({
      kind: "catalog",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      canonicalConfig: {
        id: "swooper-earthlike",
        name: "Swooper Earthlike",
        description: "Resolved catalog fixture.",
        recipe: "standard",
        sortIndex: 1,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config: {},
      },
    });
    expect(source).toBeDefined();
    if (source === undefined) return;

    expect(serializeRunInGameStartSource(source)).toEqual({
      kind: "catalog",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
    });
  });

  it("returns fresh frozen setup defaults and normalized snapshots", () => {
    const firstDefault = createDefaultRunInGameSetupConfig();
    const secondDefault = createDefaultRunInGameSetupConfig();
    const firstNormalizedDefault = normalizeRunInGameSetupConfig(undefined);
    const secondNormalizedDefault = normalizeRunInGameSetupConfig(undefined);
    const normalized = normalizeRunInGameSetupConfig({
      gameOptions: { Difficulty: "DIFFICULTY_PRINCE" },
      playerOptions: [{ playerId: 1, options: { PlayerLeader: "LEADER_TEST" } }],
    });

    expect(firstDefault).not.toBe(secondDefault);
    expect(firstDefault.playerOptions).not.toBe(secondDefault.playerOptions);
    expect(firstNormalizedDefault).not.toBe(secondNormalizedDefault);
    expect(Object.isFrozen(firstDefault)).toBe(true);
    expect(Object.isFrozen(firstDefault.gameOptions)).toBe(true);
    expect(Object.isFrozen(firstDefault.playerOptions)).toBe(true);
    expect(Object.isFrozen(firstDefault.playerOptions[0])).toBe(true);
    expect(Object.isFrozen(firstNormalizedDefault)).toBe(true);
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.gameOptions)).toBe(true);
    expect(Object.isFrozen(normalized.playerOptions[0]?.options)).toBe(true);
  });
});
