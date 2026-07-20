import { describe, expect, it } from "bun:test";
import { RESOURCE_HABITAT_SIGNALS } from "@mapgen/domain/resources/model/policy/habitat-eligibility.js";
import {
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatFieldsOutput,
} from "@mapgen/domain/resources/model/schemas/habitat-fields.schema.js";
import resources from "@mapgen/domain/resources/ops";

import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../map-size.js";

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

  it("covers every habitat signal field the family planners declare", () => {
    const declared = new Set<string>(HABITAT_MASK_FIELD_NAMES);
    for (const [resourceType, signal] of RESOURCE_HABITAT_SIGNALS) {
      for (const field of [...signal.primary, ...signal.suppress]) {
        expect(declared.has(field), `${resourceType} -> ${field}`).toBe(true);
      }
    }
  });

  it("bounds every resource-family habitat intensity to its declared unit interval", () => {
    const result = runAdmittedOperationForTest(
      resources.ops.deriveHabitatFields,
      syntheticInput(),
      structuredClone(resources.ops.deriveHabitatFields.defaultConfig)
    ) as HabitatFieldsOutput;

    for (const field of HABITAT_INTENSITY_FIELD_NAMES) {
      for (const value of result[field]) {
        expect(value, field).toBeGreaterThanOrEqual(0);
        expect(value, field).toBeLessThanOrEqual(1);
      }
    }
  });

  it("keeps aquatic lanes on water and terrestrial lanes on land (E2.4 marine lane)", () => {
    const input = syntheticInput();
    const result = runAdmittedOperationForTest(
      resources.ops.deriveHabitatFields,
      input,
      structuredClone(resources.ops.deriveHabitatFields.defaultConfig)
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
});
