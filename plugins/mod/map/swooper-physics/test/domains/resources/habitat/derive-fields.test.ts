import { describe, expect, it } from "bun:test";
import {
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatFieldsOutput,
  RESOURCE_HABITAT_SIGNALS,
} from "../../../../src/domain/resources/index.js";
import resources from "../../../../src/domain/resources/router.js";

import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

describe("derive-habitat-fields operation contract", () => {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;

  function syntheticInput() {
    const landMask = new Uint8Array(size);
    const elevation = new Int16Array(size);
    const surfaceTemperature = new Float32Array(size);
    const aridityIndex = new Float32Array(size);
    const effectiveMoisture = new Float32Array(size);
    const vegetationDensity = new Float32Array(size);
    const fertility = new Float32Array(size);
    const coastalWater = new Uint8Array(size);
    const shelfWater = new Uint8Array(size);
    const riverClass = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const isLand = x >= 2;
      landMask[i] = isLand ? 1 : 0;
      if (!isLand && x === 1) coastalWater[i] = 1;
      if (!isLand) shelfWater[i] = 1;
      elevation[i] = isLand ? 100 + ((i * 37) % 500) : -50;
      surfaceTemperature[i] = -5 + ((i * 13) % 40);
      aridityIndex[i] = ((i * 7) % 100) / 240; // matches the observed uncalibrated range
      effectiveMoisture[i] = ((i * 11) % 100) / 100;
      vegetationDensity[i] = ((i * 5) % 100) / 100;
      fertility[i] = ((i * 3) % 100) / 100;
      if (isLand && i % 9 === 0) riverClass[i] = 1;
    }
    return {
      width,
      height,
      landMask,
      lakeMask: new Uint8Array(size),
      coastalWater,
      shelfWater,
      riverClass,
      surfaceTemperature,
      aridityIndex,
      effectiveMoisture,
      vegetationDensity,
      fertility,
      elevation,
      hillMask: new Uint8Array(size),
      mountainMask: new Uint8Array(size),
    };
  }

  function mixedWaterInput() {
    const input = { ...syntheticInput(), seaIceCover: new Uint8Array(size) };
    input.surfaceTemperature.fill(10);
    input.riverClass.fill(0);
    for (let y = 8; y <= 19; y++) {
      for (let x = 8; x <= 27; x++) {
        const i = y * width + x;
        input.landMask[i] = 0;
        input.lakeMask[i] = 1;
      }
    }
    input.riverClass[12 * width + 28] = 2;
    // Submerged river routing is not a shore-river preference.
    input.riverClass[12 * width + 16] = 1;
    input.surfaceTemperature[10 * width + 20] = -4;
    input.seaIceCover[14 * width + 20] = 128;
    input.surfaceTemperature[16 * width + 20] = -3.9;
    input.seaIceCover[16 * width + 20] = 127;
    input.surfaceTemperature[16 * width + 32] = -5;
    input.seaIceCover[16 * width + 32] = 255;
    return input;
  }

  function derive(input: Parameters<typeof resources.habitat.ops.deriveHabitatFields.run>[0]) {
    return runAdmittedOperationForTest(
      resources.habitat.ops.deriveHabitatFields,
      input,
      structuredClone(resources.habitat.ops.deriveHabitatFields.defaultConfig)
    );
  }

  it("covers every field used by canonical resource habitat signals", () => {
    const declared = new Set<string>(HABITAT_MASK_FIELD_NAMES);
    for (const [resourceType, signal] of RESOURCE_HABITAT_SIGNALS) {
      for (const field of [...signal.primary, ...signal.suppress]) {
        expect(declared.has(field), `${resourceType} -> ${field}`).toBe(true);
      }
    }
  });

  it("bounds every resource-family habitat intensity to its declared unit interval", () => {
    const result = runAdmittedOperationForTest(
      resources.habitat.ops.deriveHabitatFields,
      syntheticInput(),
      structuredClone(resources.habitat.ops.deriveHabitatFields.defaultConfig)
    ) as HabitatFieldsOutput;

    for (const field of HABITAT_INTENSITY_FIELD_NAMES) {
      for (const value of result[field]) {
        expect(value, field).toBeGreaterThanOrEqual(0);
        expect(value, field).toBeLessThanOrEqual(1);
      }
    }
  });

  it("keeps marine lanes on water and terrestrial lanes on land (E2.4 marine lane)", () => {
    const input = syntheticInput();
    const result = runAdmittedOperationForTest(
      resources.habitat.ops.deriveHabitatFields,
      input,
      structuredClone(resources.habitat.ops.deriveHabitatFields.defaultConfig)
    ) as HabitatFieldsOutput;
    let coastalCount = 0;
    for (let i = 0; i < size; i++) {
      if (result.coastalWaterMask![i] === 1) {
        coastalCount++;
        expect(input.landMask[i]).toBe(0);
      }
      if (result.openGrassPlainsMask![i] === 1) {
        expect(input.landMask[i]).toBe(1);
      }
    }
    expect(coastalCount).toBeGreaterThan(0);
  });

  it("admits only exposed non-lake major corridors and suppresses their frozen aquatic baseline", () => {
    const input = { ...syntheticInput(), seaIceCover: new Uint8Array(size) };
    input.surfaceTemperature.fill(10);
    input.riverClass.fill(0);
    const major = 4 * width + 8;
    const larger = 4 * width + 16;
    const minor = 4 * width + 24;
    const dry = 4 * width + 32;
    const submergedSea = 4 * width + 1;
    const submergedLake = 8 * width + 8;
    const exposedLake = 8 * width + 16;
    const frozenTemperature = 12 * width + 8;
    const frozenCover = 12 * width + 16;
    const unfrozenEdge = 12 * width + 24;
    input.landMask[submergedLake] = 0;
    input.lakeMask[submergedLake] = 1;
    input.lakeMask[exposedLake] = 1;
    input.surfaceTemperature[frozenTemperature] = -4;
    input.seaIceCover[frozenCover] = 128;
    input.surfaceTemperature[unfrozenEdge] = -3.9;
    input.seaIceCover[unfrozenEdge] = 127;
    const baseline = derive(input);
    for (const plot of [
      major,
      submergedSea,
      submergedLake,
      exposedLake,
      frozenTemperature,
      frozenCover,
      unfrozenEdge,
    ]) input.riverClass[plot] = 2;
    input.riverClass[larger] = 3;
    input.riverClass[minor] = 1;

    const result = derive(input);
    for (let i = 0; i < size; i++) {
      expect(result.majorRiverMask[i]).toBe(
        Number(input.landMask[i] === 1 && input.lakeMask[i] !== 1 && input.riverClass[i]! >= 2)
      );
    }
    for (const plot of [major, larger, unfrozenEdge]) {
      expect(result.majorRiverMask[plot]).toBe(1);
      expect(result.iceMask[plot]).toBe(0);
      expect(result.aquaticIntensity[plot]).toBe(Math.fround(0.4));
    }
    for (const plot of [minor, dry, submergedSea, submergedLake, exposedLake]) {
      expect(result.majorRiverMask[plot]).toBe(0);
    }
    for (const plot of [minor, dry, exposedLake]) expect(result.aquaticIntensity[plot]).toBe(0);
    for (const plot of [frozenTemperature, frozenCover]) {
      expect(result.majorRiverMask[plot]).toBe(1);
      expect(result.iceMask[plot]).toBe(1);
      expect(result.aquaticIntensity[plot]).toBe(0);
    }
    for (const field of HABITAT_INTENSITY_FIELD_NAMES) {
      if (field === "aquaticIntensity") continue;
      expect(result[field], field).toEqual(baseline[field]);
      for (const plot of [major, frozenTemperature, frozenCover]) {
        expect(result[field][plot], field).toBeGreaterThan(0);
      }
    }
  });

  it("weights unfrozen physical finite water by interior, exposed shore, and shore river", () => {
    const input = mixedWaterInput();
    const result = derive(input);
    const interior = 12 * width + 15;
    const shore = 12 * width + 8;
    const shoreRiver = 12 * width + 27;
    const frozenTemperature = 10 * width + 20;
    const frozenCover = 14 * width + 20;
    const unfrozenEdge = 16 * width + 20;
    const dry = 16 * width + 32;

    expect(result.aquaticIntensity[interior]).toBe(Math.fround(0.4));
    expect(result.aquaticIntensity[shore]).toBe(Math.fround(0.7));
    expect(result.aquaticIntensity[shoreRiver]).toBe(1);
    expect(result.aquaticIntensity[unfrozenEdge]).toBe(Math.fround(0.4));
    for (const frozen of [frozenTemperature, frozenCover]) {
      expect(result.lakeMask[frozen]).toBe(1);
      expect(result.iceMask[frozen]).toBe(1);
      expect(result.aquaticIntensity[frozen]).toBe(0);
    }
    expect(result.iceMask[unfrozenEdge]).toBe(0);
    expect(result.lakeMask[dry]).toBe(0);
    expect(result.iceMask[dry]).toBe(0);
    expect(result.aquaticIntensity[dry]).toBe(0);

    for (let i = 0; i < size; i++) {
      if (input.lakeMask[i] !== 1) continue;
      for (const field of [
        "coastalWaterMask",
        "shelfMask",
        "warmShallowWaterMask",
        "coldProductiveWaterMask",
        "reefOrProtectedShallowsMask",
        "estuaryMask",
        "navigableRiverMouthMask",
      ] as const) {
        expect(result[field][i], field).toBe(0);
      }
    }
  });

  it("uses periodic X, odd-row hex adjacency, and bounded Y for finite-water bonuses", () => {
    const input = syntheticInput();
    input.landMask.fill(0);
    input.riverClass.fill(0);
    input.surfaceTemperature.fill(10);
    const seam = 8 * width;
    const oddRow = 9 * width + 16;
    const evenRow = 12 * width + 24;
    const north = 32;
    for (const plot of [seam, oddRow, evenRow, north]) input.lakeMask[plot] = 1;
    for (const land of [8 * width + width - 1, 10 * width + 17, 13 * width + 23]) {
      input.landMask[land] = 1;
      input.riverClass[land] = 1;
    }
    input.landMask[(height - 1) * width + 32] = 1;
    input.riverClass[(height - 1) * width + 32] = 2;

    const result = derive(input);
    for (const plot of [seam, oddRow, evenRow]) expect(result.aquaticIntensity[plot]).toBe(1);
    expect(result.aquaticIntensity[north]).toBe(Math.fround(0.4));
  });

  it("preserves the marine predicates and intensity formula on mixed physical water", () => {
    const input = mixedWaterInput();
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 1 || input.lakeMask[i] === 1) continue;
      input.coastalWater[i] = i % 2;
      input.shelfWater[i] = i % 3 === 0 ? 1 : 0;
      input.surfaceTemperature[i] = [-4, 10, 20, 24][i % 4]!;
      input.seaIceCover[i] = i % 5 === 0 ? 128 : 0;
    }
    input.riverClass[4 * width + 2] = 2;
    const result = derive(input);

    for (let i = 0; i < size; i++) {
      const sea = input.landMask[i] !== 1 && input.lakeMask[i] !== 1;
      const coast = sea && input.coastalWater[i] === 1;
      const shelf = sea && input.shelfWater[i] === 1;
      const temperature = input.surfaceTemperature[i]!;
      expect(result.coastalWaterMask[i]).toBe(Number(coast));
      expect(result.coastalMarineMask[i]).toBe(Number(coast));
      expect(result.shelfMask[i]).toBe(Number(shelf));
      expect(result.warmShallowWaterMask[i]).toBe(Number((coast || shelf) && temperature >= 19));
      expect(result.coldProductiveWaterMask[i]).toBe(Number((coast || shelf) && temperature <= 12));
      expect(result.reefOrProtectedShallowsMask[i]).toBe(Number((coast || shelf) && temperature >= 22));
      const neighbors = getHexNeighborIndicesOddQ(i % width, (i / width) | 0, width, height);
      for (const [field, minClass] of [
        ["estuaryMask", 1],
        ["navigableRiverMouthMask", 2],
      ] as const) {
        expect(result[field][i]).toBe(
          Number(coast && neighbors.some(
            (n) => input.landMask[n] === 1 && input.riverClass[n]! >= minClass
          ))
        );
      }
      if (!sea) continue;
      expect(result.iceMask[i]).toBe(Number(input.seaIceCover[i]! >= 128 || temperature <= -4));
      expect(result.aquaticIntensity[i]).toBe(
        Math.fround(Math.min(1, 0.4 + (coast ? 0.3 : 0) + (shelf ? 0.3 : 0)))
      );
    }
  });

  it("leaves every other habitat field unchanged by finite-water climate and marine hints", () => {
    const input = mixedWaterInput();
    const before = derive(input);
    for (let i = 0; i < size; i++) {
      if (input.lakeMask[i] !== 1) continue;
      input.surfaceTemperature[i] = 24;
      input.seaIceCover[i] = 0;
      input.coastalWater[i] = 1;
      input.shelfWater[i] = 1;
    }
    const after = derive(input);
    for (const field of HABITAT_MASK_FIELD_NAMES) {
      if (field === "iceMask") continue;
      expect(after[field], field).toEqual(before[field]);
    }
    for (const field of HABITAT_INTENSITY_FIELD_NAMES) {
      if (field === "aquaticIntensity") continue;
      expect(after[field], field).toEqual(before[field]);
    }
  });
});
