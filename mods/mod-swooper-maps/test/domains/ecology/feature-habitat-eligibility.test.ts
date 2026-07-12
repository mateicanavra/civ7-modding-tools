import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOpSelectionOrThrow } from "../../support/compiler-helpers.js";

describe("ecology feature habitat eligibility", () => {
  it("partitions reef-family habitats by shelf, coast distance, temperature, and depth", () => {
    const width = 4;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const warm = new Float32Array(size).fill(28);
    const cold = new Float32Array(size).fill(8);
    const shallow = new Int16Array(size).fill(-10);
    const coldReefDepth = new Int16Array(size).fill(-300);
    const shelfMask = new Uint8Array([1, 0, 1, 1]);
    const openOceanMask = new Uint8Array([0, 1, 0, 0]);
    const lakeMask = new Uint8Array([1, 0, 0, 0]);
    const coastalWater = new Uint8Array([1, 0, 1, 1]);
    const distanceToCoast = new Uint8Array([1, 5, 1, 1]);

    const reef = ecology.ops.scoreReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOpSelectionOrThrow(ecology.ops.scoreReef, ecology.ops.scoreReef.defaultConfig)
    ).score01;
    const atoll = ecology.ops.scoreReefAtoll.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        openOceanMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreReefAtoll,
        ecology.ops.scoreReefAtoll.defaultConfig
      )
    ).score01;
    const lotus = ecology.ops.scoreReefLotus.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        lakeMask,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreReefLotus,
        ecology.ops.scoreReefLotus.defaultConfig
      )
    ).score01;
    const coldReef = ecology.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: coldReefDepth,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOpSelectionOrThrow(ecology.ops.scoreColdReef, {
        ...ecology.ops.scoreColdReef.defaultConfig,
        config: {
          ...ecology.ops.scoreColdReef.defaultConfig.config,
          minDepthM: 120,
          peakDepthM: 300,
          maxDepthM: 520,
        },
      })
    ).score01;
    const abyssalColdReef = ecology.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: new Int16Array(size).fill(-2000),
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreColdReef,
        ecology.ops.scoreColdReef.defaultConfig
      )
    ).score01;

    expect(reef[0]).toBeGreaterThan(0.5);
    expect(reef[1]).toBe(0);
    expect(atoll[0]).toBe(0);
    expect(atoll[1]).toBeGreaterThan(0.5);
    expect(lotus[0]).toBeGreaterThan(0.5);
    expect(lotus[1]).toBe(0);
    expect(coldReef[0]).toBeGreaterThan(0.5);
    expect(abyssalColdReef[0]).toBe(0);
  });

  it("requires hydromorphic or isolated water-source substrate before wet feature scoring", () => {
    const width = 2;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const hydromorphicMask = new Uint8Array([0, 1]);
    const intertidalCoastMask = new Uint8Array([0, 1]);
    const isolatedWaterPointMask = new Uint8Array([0, 1]);
    const water01 = new Float32Array(size).fill(0.85);
    const fertility01 = new Float32Array(size).fill(0.7);
    const surfaceTemperature = new Float32Array(size).fill(14);
    const mangroveTemperature = new Float32Array(size).fill(24);
    const coldTemperature = new Float32Array(size).fill(0);
    const aridityIndex = new Float32Array(size).fill(0.25);
    const dryAridityIndex = new Float32Array(size).fill(0.8);
    const aridWaterPointWater01 = new Float32Array(size).fill(0.7);
    const freezeIndex = new Float32Array(size).fill(0.8);

    const marsh = ecology.ops.scoreWetMarsh.run(
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
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreWetMarsh,
        ecology.ops.scoreWetMarsh.defaultConfig
      )
    ).score01;
    const bog = ecology.ops.scoreWetTundraBog.run(
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
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreWetTundraBog,
        ecology.ops.scoreWetTundraBog.defaultConfig
      )
    ).score01;
    const mangrove = ecology.ops.scoreWetMangrove.run(
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
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreWetMangrove,
        ecology.ops.scoreWetMangrove.defaultConfig
      )
    ).score01;
    const oasis = ecology.ops.scoreWetOasis.run(
      {
        width,
        height,
        landMask,
        isolatedWaterPointMask,
        water01: aridWaterPointWater01,
        aridityIndex: dryAridityIndex,
        surfaceTemperature: mangroveTemperature,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreWetOasis,
        ecology.ops.scoreWetOasis.defaultConfig
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

  it("keeps cold and dry vegetation habitats from being double-penalized by shared biomass stress", () => {
    const width = 2;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const fertility01 = new Float32Array(size).fill(0.6);

    const taiga = ecology.ops.scoreVegetationTaiga.run(
      {
        width,
        height,
        landMask,
        energy01: new Float32Array([0.28, 0.8]),
        water01: new Float32Array([0.48, 0.48]),
        waterStress01: new Float32Array([0.1, 0.1]),
        coldStress01: new Float32Array([0.65, 0.05]),
        biomass01: new Float32Array([0.12, 0.12]),
        fertility01,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreVegetationTaiga,
        ecology.ops.scoreVegetationTaiga.defaultConfig
      )
    ).score01;

    const sagebrush = ecology.ops.scoreVegetationSagebrushSteppe.run(
      {
        width,
        height,
        landMask,
        energy01: new Float32Array([0.55, 0.55]),
        water01: new Float32Array([0.2, 0.8]),
        waterStress01: new Float32Array([0.75, 0.05]),
        coldStress01: new Float32Array(size),
        biomass01: new Float32Array([0.12, 0.12]),
        fertility01,
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.scoreVegetationSagebrushSteppe,
        ecology.ops.scoreVegetationSagebrushSteppe.defaultConfig
      )
    ).score01;

    expect(taiga[0]).toBeGreaterThan(0.1);
    expect(taiga[1]).toBeLessThan(taiga[0]);
    expect(sagebrush[0]).toBeGreaterThan(0.05);
    expect(sagebrush[1]).toBe(0);
  });
});
