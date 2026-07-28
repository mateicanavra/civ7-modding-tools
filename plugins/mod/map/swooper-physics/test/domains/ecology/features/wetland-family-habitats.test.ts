import { describe, expect, it } from "bun:test";
import ecology from "../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology wetland-family habitats", () => {
  it("requires hydromorphic, intertidal, or isolated water-source substrate", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const hydromorphicMask = new Uint8Array(size);
    hydromorphicMask[1] = 1;
    const intertidalCoastMask = new Uint8Array(size);
    intertidalCoastMask[1] = 1;
    const isolatedWaterPointMask = new Uint8Array(size);
    isolatedWaterPointMask[1] = 1;
    const water01 = new Float32Array(size).fill(0.85);
    const fertility01 = new Float32Array(size).fill(0.7);
    const surfaceTemperature = new Float32Array(size).fill(14);
    const mangroveTemperature = new Float32Array(size).fill(24);
    const coldTemperature = new Float32Array(size);
    const aridityIndex = new Float32Array(size).fill(0.25);
    const dryAridityIndex = new Float32Array(size).fill(0.8);
    const aridWaterPointWater01 = new Float32Array(size).fill(0.7);
    const freezeIndex = new Float32Array(size).fill(0.8);

    const marsh = ecology.features.ops.scoreWetMarsh.run(
      {
        width,
        height,
        landMask,
        hydromorphicMask,
        water01,
        fertility01,
        surfaceTemperature,
        aridityIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetMarsh,
        ecology.features.ops.scoreWetMarsh.defaultConfig
      )
    ).score01;
    const bog = ecology.features.ops.scoreWetTundraBog.run(
      {
        width,
        height,
        landMask,
        hydromorphicMask,
        water01,
        fertility01,
        surfaceTemperature: coldTemperature,
        freezeIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetTundraBog,
        ecology.features.ops.scoreWetTundraBog.defaultConfig
      )
    ).score01;
    const mangrove = ecology.features.ops.scoreWetMangrove.run(
      {
        width,
        height,
        landMask,
        intertidalCoastMask,
        water01,
        fertility01,
        surfaceTemperature: mangroveTemperature,
        aridityIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetMangrove,
        ecology.features.ops.scoreWetMangrove.defaultConfig
      )
    ).score01;
    const oasis = ecology.features.ops.scoreWetOasis.run(
      {
        width,
        height,
        landMask,
        isolatedWaterPointMask,
        water01: aridWaterPointWater01,
        aridityIndex: dryAridityIndex,
        surfaceTemperature: mangroveTemperature,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetOasis,
        ecology.features.ops.scoreWetOasis.defaultConfig
      )
    ).score01;

    expect(marsh[0]).toBe(0);
    expect(marsh[1]).toBeGreaterThan(0.2);
    expect(bog[0]).toBe(0);
    expect(bog[1]).toBeGreaterThan(0.2);
    expect(mangrove[0]).toBe(0);
    expect(mangrove[1]).toBeGreaterThan(0.2);
    expect(oasis[0]).toBe(0);
    expect(oasis[1]).toBeGreaterThan(0.05);
  });
});
