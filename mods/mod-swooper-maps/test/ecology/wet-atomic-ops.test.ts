import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

const createFeatureKeyField = (size: number) => new Int16Array(size).fill(-1);

describe("wet feature atomic ops (contract + basic behavior)", () => {
  it("planWetPlacementMarsh places marsh on near-river temperate land", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const temperateHumid = BIOME_SYMBOL_TO_INDEX.temperateHumid ?? 4;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementMarsh, {
      strategy: "default",
      config: { chances: { FEATURE_MARSH: 100 } },
    });

    const result = ecology.ops.planWetPlacementMarsh.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(temperateHumid),
        surfaceTemperature: new Float32Array(size).fill(12),
        landMask: new Uint8Array(size).fill(1),
        navigableRiverMask: new Uint8Array(size).fill(0),
        featureKeyField: createFeatureKeyField(size),
        nearRiverMask: new Uint8Array(size).fill(1),
        isolatedRiverMask: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.placements.length).toBe(size);
    expect(result.placements[0]?.feature).toBe("FEATURE_MARSH");
  });

  it("planWetPlacementTundraBog places bog on cold near-river land", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const tundra = BIOME_SYMBOL_TO_INDEX.tundra ?? 1;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementTundraBog, {
      strategy: "default",
      config: { chances: { FEATURE_TUNDRA_BOG: 100 } },
    });

    const result = ecology.ops.planWetPlacementTundraBog.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(tundra),
        surfaceTemperature: new Float32Array(size).fill(0),
        landMask: new Uint8Array(size).fill(1),
        navigableRiverMask: new Uint8Array(size).fill(0),
        featureKeyField: createFeatureKeyField(size),
        nearRiverMask: new Uint8Array(size).fill(1),
        isolatedRiverMask: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.placements.length).toBe(size);
    expect(result.placements[0]?.feature).toBe("FEATURE_TUNDRA_BOG");
  });

  it("planWetPlacementMangrove places mangrove on warm coastal land", () => {
    const width = 2;
    const height = 1;
    const size = width * height;
    const tropicalSeasonal = BIOME_SYMBOL_TO_INDEX.tropicalSeasonal ?? 6;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementMangrove, {
      strategy: "default",
      config: { chances: { FEATURE_MANGROVE: 100 } },
    });

    const result = ecology.ops.planWetPlacementMangrove.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(tropicalSeasonal),
        surfaceTemperature: new Float32Array(size).fill(24),
        landMask: new Uint8Array([1, 0]),
        navigableRiverMask: new Uint8Array(size).fill(0),
        featureKeyField: createFeatureKeyField(size),
        nearRiverMask: new Uint8Array(size).fill(0),
        isolatedRiverMask: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.placements.length).toBe(1);
    expect(result.placements[0]?.feature).toBe("FEATURE_MANGROVE");
  });

  it("planWetPlacementOasis places oasis on desert inland land", () => {
    const width = 2;
    const height = 1;
    const size = width * height;
    const desert = BIOME_SYMBOL_TO_INDEX.desert ?? 7;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementOasis, {
      strategy: "default",
      config: { chances: { FEATURE_OASIS: 100 } },
    });

    const result = ecology.ops.planWetPlacementOasis.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(desert),
        surfaceTemperature: new Float32Array(size).fill(35),
        landMask: new Uint8Array(size).fill(1),
        navigableRiverMask: new Uint8Array(size).fill(0),
        featureKeyField: createFeatureKeyField(size),
        nearRiverMask: new Uint8Array(size).fill(0),
        isolatedRiverMask: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.placements.length).toBe(1);
    expect(result.placements[0]?.feature).toBe("FEATURE_OASIS");
  });

  it("planWetPlacementWateringHole places watering hole on inland non-oasis biomes", () => {
    const width = 2;
    const height = 1;
    const size = width * height;
    const temperateHumid = BIOME_SYMBOL_TO_INDEX.temperateHumid ?? 4;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementWateringHole, {
      strategy: "default",
      config: { chances: { FEATURE_WATERING_HOLE: 100 } },
    });

    const result = ecology.ops.planWetPlacementWateringHole.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(temperateHumid),
        surfaceTemperature: new Float32Array(size).fill(20),
        landMask: new Uint8Array(size).fill(1),
        navigableRiverMask: new Uint8Array(size).fill(0),
        featureKeyField: createFeatureKeyField(size),
        nearRiverMask: new Uint8Array(size).fill(0),
        isolatedRiverMask: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.placements.length).toBe(1);
    expect(result.placements[0]?.feature).toBe("FEATURE_WATERING_HOLE");
  });
});
