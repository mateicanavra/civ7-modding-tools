import { afterEach, describe, expect, it } from "bun:test";

import {
  type Civ7MapGenerationSetupCaptureInput,
  captureCiv7MapGenerationSetup,
} from "../src/index.js";

const configurationDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Configuration");
const playersDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Players");

afterEach(() => {
  restoreGlobal("Configuration", configurationDescriptor);
  restoreGlobal("Players", playersDescriptor);
});

describe("Civ7 GenerateMap setup capture", () => {
  it("captures one detached immutable setup without bulk or inferred reads", () => {
    const gameReads: string[] = [];
    const mapReads: string[] = [];
    const customPayload = {
      weights: [{ value: 2 }],
    };
    installGlobal("Configuration", {
      getGameValue(key: string): unknown {
        gameReads.push(key);
        if (key === "RandomSeed") return -29;
        if (key === "Ruleset") return "RULESET_STANDARD";
        if (key === "Crises") return ["CRISIS_ONE", "CRISIS_TWO"];
        return undefined;
      },
      getMapValue(key: string): unknown {
        mapReads.push(key);
        if (key === "SeaLevel") return "SEA_LEVEL_HIGH";
        if (key === "CustomPayload") return customPayload;
        if (key === "Broken") throw new Error("not available in this map");
        return undefined;
      },
    });
    installGlobal("Players", {
      getAliveMajorIds: () => [7, 2, 11],
    });

    const dimensions = { width: 106, height: 66 };
    const latitudeBounds = { topLatitude: 90, bottomLatitude: -90 };
    const mapInfo = {
      GridWidth: 106,
      GridHeight: 66,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 7,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 6,
      PlayersLandmass2: 6,
      StartSectorRows: 4,
      StartSectorCols: 3,
      UnmodeledLiveRowField: "not retained",
    };

    const captured = captureCiv7MapGenerationSetup({
      mapSeed: 17,
      dimensions,
      latitudeBounds,
      mapSizeId: "MAPSIZE_HUGE",
      mapInfo,
      requestedMapOptionKeys: ["SeaLevel", "CustomPayload", "Missing", "Broken"],
      requestedGameOptionKeys: ["Ruleset", "Crises", "Missing"],
    });

    dimensions.width = 1;
    latitudeBounds.topLatitude = 45;
    mapInfo.PlayersLandmass1 = 1;
    customPayload.weights[0]!.value = 99;

    expect(gameReads).toEqual(["RandomSeed", "Ruleset", "Crises", "Missing"]);
    expect(mapReads).toEqual(["SeaLevel", "CustomPayload", "Missing", "Broken"]);
    expect(captured).toEqual({
      mapSeed: 17,
      gameSeed: -29,
      dimensions: { width: 106, height: 66 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      mapSizeId: "MAPSIZE_HUGE",
      mapInfo: {
        GridWidth: 106,
        GridHeight: 66,
        MinLatitude: -90,
        MaxLatitude: 90,
        NumNaturalWonders: 7,
        LakeGenerationFrequency: 25,
        PlayersLandmass1: 6,
        PlayersLandmass2: 6,
        StartSectorRows: 4,
        StartSectorCols: 3,
      },
      aliveMajorPlayerIds: [7, 2, 11],
      startSlotCapacity: { west: 6, east: 6, total: 12 },
      options: {
        map: [
          { status: "available", key: "SeaLevel", value: "SEA_LEVEL_HIGH" },
          {
            status: "available",
            key: "CustomPayload",
            value: { weights: [{ value: 2 }] },
          },
          { status: "unavailable", key: "Missing", reason: "value-unavailable" },
          { status: "unavailable", key: "Broken", reason: "read-failed" },
        ],
        game: [
          { status: "available", key: "Ruleset", value: "RULESET_STANDARD" },
          {
            status: "available",
            key: "Crises",
            value: ["CRISIS_ONE", "CRISIS_TWO"],
          },
          { status: "unavailable", key: "Missing", reason: "value-unavailable" },
        ],
      },
    });
    expect(Object.isFrozen(captured)).toBe(true);
    expect(Object.isFrozen(captured.dimensions)).toBe(true);
    expect(Object.isFrozen(captured.mapInfo)).toBe(true);
    expect(Object.isFrozen(captured.aliveMajorPlayerIds)).toBe(true);
    expect(Object.isFrozen(captured.options.map)).toBe(true);
    const payloadEvidence = captured.options.map[1];
    expect(payloadEvidence?.status).toBe("available");
    if (
      payloadEvidence?.status !== "available" ||
      payloadEvidence.value === null ||
      typeof payloadEvidence.value !== "object"
    ) {
      throw new Error("Expected captured custom payload evidence.");
    }
    expect(Object.isFrozen(payloadEvidence.value)).toBe(true);
    expect(Object.isFrozen(Reflect.get(payloadEvidence.value, "weights"))).toBe(true);
    expect(Reflect.has(captured, "Configuration")).toBe(false);
    expect(Reflect.has(captured, "Players")).toBe(false);
  });

  it("preserves an exact empty alive-major observation instead of synthesizing slot ids", () => {
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === "RandomSeed" ? 23 : undefined),
    });
    installGlobal("Players", { getAliveMajorIds: () => [] });

    const captured = captureCiv7MapGenerationSetup(
      captureInput({
        mapSizeId: "42",
        requestedMapOptionKeys: ["Unavailable"],
      })
    );

    expect(captured.mapSizeId).toBe("42");
    expect(captured.aliveMajorPlayerIds).toEqual([]);
    expect(captured.startSlotCapacity).toEqual({ west: 5, east: 3, total: 8 });
    expect(captured.options.map).toEqual([
      {
        status: "unavailable",
        key: "Unavailable",
        reason: "configuration-api-unavailable",
      },
    ]);
  });

  it("fails closed for coerced seeds, malformed ids, duplicate players, and missing capacity", () => {
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === "RandomSeed" ? "23" : undefined),
      getMapValue: () => undefined,
    });
    installGlobal("Players", { getAliveMajorIds: () => [3, 1] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 game seed must be a signed 32-bit integer without coercion"
    );

    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === "RandomSeed" ? 23 : undefined),
      getMapValue: () => undefined,
    });
    installGlobal("Players", { getAliveMajorIds: () => [3, 1, 3] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 alive-major player ids must be unique"
    );

    installGlobal("Players", { getAliveMajorIds: () => [3, "1"] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 alive-major player ids must be integers between 0 and 63"
    );

    expect(() =>
      captureCiv7MapGenerationSetup({
        ...captureInput(),
        mapSeed: "17",
      } as unknown as Civ7MapGenerationSetupCaptureInput)
    ).toThrow("Civ7 map seed must be a signed 32-bit integer without coercion");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapSizeId: " MAPSIZE_STANDARD",
        })
      )
    ).toThrow("Civ7 mapSizeId must be a non-empty unpadded string or safe integer");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          requestedGameOptionKeys: ["Ruleset", "Ruleset"],
        })
      )
    ).toThrow("Civ7 requested game option keys must contain unique keys");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapInfo: {
            PlayersLandmass1: 5,
          },
        })
      )
    ).toThrow("Civ7 mapInfo.PlayersLandmass2 must be a non-negative safe integer");
  });

  it("marks non-snapshotable explicitly requested values unavailable", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === "RandomSeed" ? 23 : undefined),
      getMapValue: (key: string) => (key === "Cyclic" ? cyclic : Number.NaN),
    });
    installGlobal("Players", { getAliveMajorIds: () => [0] });

    const captured = captureCiv7MapGenerationSetup(
      captureInput({
        requestedMapOptionKeys: ["Cyclic", "NaN"],
      })
    );

    expect(captured.options.map).toEqual([
      { status: "unavailable", key: "Cyclic", reason: "value-not-snapshotable" },
      { status: "unavailable", key: "NaN", reason: "value-not-snapshotable" },
    ]);
  });
});

function captureInput(
  overrides: Partial<Civ7MapGenerationSetupCaptureInput> = {}
): Civ7MapGenerationSetupCaptureInput {
  return {
    mapSeed: 17,
    dimensions: { width: 84, height: 54 },
    latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    mapSizeId: "MAPSIZE_STANDARD",
    mapInfo: {
      GridWidth: 84,
      GridHeight: 54,
      MinLatitude: -90,
      MaxLatitude: 90,
      PlayersLandmass1: 5,
      PlayersLandmass2: 3,
    },
    requestedMapOptionKeys: [],
    requestedGameOptionKeys: [],
    ...overrides,
  };
}

function installGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

function restoreGlobal(name: string, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor === undefined) {
    Reflect.deleteProperty(globalThis, name);
    return;
  }
  Object.defineProperty(globalThis, name, descriptor);
}
