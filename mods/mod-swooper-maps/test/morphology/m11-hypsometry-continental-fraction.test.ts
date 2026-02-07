import { describe, expect, it } from "bun:test";

import computeMesh from "../../src/domain/foundation/ops/compute-mesh/index.js";
import computeCrust from "../../src/domain/foundation/ops/compute-crust/index.js";
import computeMantlePotential from "../../src/domain/foundation/ops/compute-mantle-potential/index.js";
import computeMantleForcing from "../../src/domain/foundation/ops/compute-mantle-forcing/index.js";
import computePlateGraph from "../../src/domain/foundation/ops/compute-plate-graph/index.js";
import computePlateMotion from "../../src/domain/foundation/ops/compute-plate-motion/index.js";
import computeTectonicSegments from "../../src/domain/foundation/ops/compute-tectonic-segments/index.js";
import computeTectonicHistory from "../../src/domain/foundation/ops/compute-tectonic-history/index.js";
import computePlatesTensors from "../../src/domain/foundation/ops/compute-plates-tensors/index.js";

import computeBaseTopography from "../../src/domain/morphology/ops/compute-base-topography/index.js";
import computeLandmask from "../../src/domain/morphology/ops/compute-landmask/index.js";
import computeSeaLevel from "../../src/domain/morphology/ops/compute-sea-level/index.js";

function share(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function derivePlateMotion(mesh: any, plateGraph: any, rngSeed: number) {
  const mantlePotential = computeMantlePotential.run({ mesh, rngSeed }, computeMantlePotential.defaultConfig)
    .mantlePotential;
  const mantleForcing = computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
    .mantleForcing;
  return computePlateMotion.run({ mesh, plateGraph, mantleForcing }, computePlateMotion.defaultConfig).plateMotion;
}

describe("m11 hypsometry: continentalFraction does not collapse water coverage", () => {
  it("keeps non-trivial water coverage while meeting continentalFraction target", () => {
    const width = 80;
    const height = 60;
    const size = width * height;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };

    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 19, cellsPerPlate: 7, relaxationSteps: 6, referenceArea: 16000, plateScalePower: 1 },
      },
      ctx as any
    );
    const mesh = computeMesh.run({ width, height, rngSeed: 1 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run({ mesh, rngSeed: 2 }, computeMantlePotential.defaultConfig)
      .mantlePotential;
    const mantleForcing = computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
      .mantleForcing;
    const crust = computeCrust.run({ mesh, mantleForcing, rngSeed: 2 }, computeCrust.defaultConfig).crust;

    const plateGraphConfig = computePlateGraph.normalize(
      { strategy: "default", config: { plateCount: 19, referenceArea: 16000, plateScalePower: 1 } },
      ctx as any
    );
    const plateGraph = computePlateGraph.run({ mesh, crust, rngSeed: 3 }, plateGraphConfig).plateGraph;

    const plateMotion = derivePlateMotion(mesh, plateGraph, 4);
    const segments = computeTectonicSegments.run(
      { mesh, crust, plateGraph, plateMotion },
      computeTectonicSegments.defaultConfig
    ).segments;

    const history = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, segments },
      {
        ...computeTectonicHistory.defaultConfig,
        config: {
          ...computeTectonicHistory.defaultConfig.config,
          eraWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
          driftStepsByEra: [2, 2, 2, 2, 2],
          beltInfluenceDistance: 8,
          beltDecay: 0.55,
          activityThreshold: 1,
        },
      }
    );

    const projection = computePlatesTensors.run(
      {
        width,
        height,
        mesh,
        crust,
        plateGraph,
        plateMotion,
        tectonics: history.tectonics,
        tectonicHistory: history.tectonicHistory,
      },
      {
        ...computePlatesTensors.defaultConfig,
        config: {
          ...computePlatesTensors.defaultConfig.config,
          boundaryInfluenceDistance: 12,
          boundaryDecay: 0.5,
          movementScale: 65,
          rotationScale: 80,
        },
      }
    );
    const plates = projection.plates;
    const crustTiles = projection.crustTiles;

    const crustType = new Uint8Array(size);
    const crustBaseElevation = new Float32Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const inLatBand = y > height * 0.2 && y < height * 0.8;
        const inLonBand = x > width * 0.15 && x < width * 0.85;
        const isContinental = inLatBand && inLonBand;
        crustType[idx] = isContinental ? 1 : 0;
        const base = crustTiles.baseElevation[idx] ?? 0;
        crustBaseElevation[idx] = isContinental ? Math.min(1, base + 0.25) : base;
      }
    }

    const baseTopography = computeBaseTopography.run(
      {
        width,
        height,
        crustBaseElevation,
        boundaryCloseness: plates.boundaryCloseness,
        upliftPotential: plates.upliftPotential,
        riftPotential: plates.riftPotential,
        rngSeed: 4,
      },
      computeBaseTopography.defaultConfig
    );

    const seaLevel = computeSeaLevel.run(
      {
        width,
        height,
        elevation: baseTopography.elevation,
        crustType,
        boundaryCloseness: plates.boundaryCloseness,
        upliftPotential: plates.upliftPotential,
        rngSeed: 5,
      },
      {
        ...computeSeaLevel.defaultConfig,
        config: {
          ...computeSeaLevel.defaultConfig.config,
          targetWaterPercent: 63,
          targetScalar: 1,
          variance: 0,
          boundaryShareTarget: 0.08,
          continentalFraction: 0.39,
        },
      }
    ).seaLevel;

    const landmask = computeLandmask.run(
      {
        width,
        height,
        elevation: baseTopography.elevation,
        seaLevel,
        boundaryCloseness: plates.boundaryCloseness,
        crustType,
        crustBaseElevation,
        crustAge: crustTiles.age,
        provenanceOriginEra: projection.tectonicProvenanceTiles.originEra,
        provenanceDriftDistance: projection.tectonicProvenanceTiles.driftDistance,
      },
      computeLandmask.defaultConfig
    );

    let land = 0;
    let water = 0;
    let continentalLand = 0;
    for (let i = 0; i < size; i++) {
      const isLand = landmask.landMask[i] === 1;
      if (isLand) {
        land++;
        if ((crustType[i] ?? 0) === 1) continentalLand++;
      } else {
        water++;
      }
    }

    const waterShare = share(water, size);
    const continentalShare = share(continentalLand, land);

    // Regression guard: previously, continentalFraction could drive targetWaterPercent to ~0,
    // producing near-all-land maps (glacier-scrape oceans).
    expect(waterShare).toBeGreaterThan(0.2);
    expect(waterShare).toBeLessThan(0.9);

    // Soft check: ensure the resulting land skew is not overwhelmingly oceanic.
    expect(continentalShare).toBeGreaterThanOrEqual(0.35);
  });
});
