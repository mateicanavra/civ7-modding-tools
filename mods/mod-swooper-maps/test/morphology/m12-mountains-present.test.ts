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
import computeSeaLevel from "../../src/domain/morphology/ops/compute-sea-level/index.js";
import planRidges from "../../src/domain/morphology/ops/plan-ridges/index.js";
import planFoothills from "../../src/domain/morphology/ops/plan-foothills/index.js";

function derivePlateMotion(mesh: any, plateGraph: any, rngSeed: number) {
  const mantlePotential = computeMantlePotential.run({ mesh, rngSeed }, computeMantlePotential.defaultConfig)
    .mantlePotential;
  const mantleForcing = computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
    .mantleForcing;
  return computePlateMotion.run({ mesh, plateGraph, mantleForcing }, computePlateMotion.defaultConfig).plateMotion;
}

describe("m12 mountains: ridge planning produces some non-volcano mountains", () => {
  it("produces a non-zero mountain mask on an earthlike-ish run", () => {
    const width = 96;
    const height = 72;
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

    const landMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      landMask[i] = baseTopography.elevation[i]! > seaLevel ? 1 : 0;
    }
    const beltAge = new Uint8Array(size);

    const fractalMountain = new Int16Array(size);
    const fractalHill = new Int16Array(size);
    fractalMountain.fill(255);
    fractalHill.fill(255);

    const ridges = planRidges.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        upliftPotential: plates.upliftPotential,
        riftPotential: plates.riftPotential,
        tectonicStress: plates.tectonicStress,
        beltAge,
        fractalMountain,
      },
      {
        ...planRidges.defaultConfig,
        config: {
          ...planRidges.defaultConfig.config,
          // Retuned for mantle-derived motion to preserve mountain presence.
          tectonicIntensity: 1.7,
          mountainThreshold: 0.59,
          hillThreshold: 0.44,
          upliftWeight: 0.28,
          fractalWeight: 0.72,
          riftDepth: 0.27,
          boundaryWeight: 0.18,
          boundaryGate: 0.11,
          boundaryExponent: 1.18,
          interiorPenaltyWeight: 0.09,
          convergenceBonus: 0.6,
          transformPenalty: 0.65,
          riftPenalty: 0.78,
          hillBoundaryWeight: 0.32,
          hillRiftBonus: 0.36,
          hillConvergentFoothill: 0.36,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.18,
        },
      }
    );

    const foothills = planFoothills.run(
      {
        width,
        height,
        landMask,
        mountainMask: ridges.mountainMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        upliftPotential: plates.upliftPotential,
        riftPotential: plates.riftPotential,
        tectonicStress: plates.tectonicStress,
        beltAge,
        fractalHill,
      },
      {
        ...planFoothills.defaultConfig,
        config: {
          ...planFoothills.defaultConfig.config,
          tectonicIntensity: 1.7,
          mountainThreshold: 0.59,
          hillThreshold: 0.44,
          upliftWeight: 0.28,
          fractalWeight: 0.72,
          riftDepth: 0.27,
          boundaryWeight: 0.18,
          boundaryGate: 0.11,
          boundaryExponent: 1.18,
          interiorPenaltyWeight: 0.09,
          convergenceBonus: 0.6,
          transformPenalty: 0.65,
          riftPenalty: 0.78,
          hillBoundaryWeight: 0.32,
          hillRiftBonus: 0.36,
          hillConvergentFoothill: 0.36,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.18,
        },
      }
    );

    let landTiles = 0;
    let mountainTiles = 0;
    let hillTiles = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      landTiles++;
      if (ridges.mountainMask[i] === 1) mountainTiles++;
      else if (foothills.hillMask[i] === 1) hillTiles++;
    }

    expect(landTiles).toBeGreaterThan(0);
    expect(mountainTiles).toBeGreaterThan(0);
    expect(mountainTiles + hillTiles).toBeGreaterThan(0);
  });
});
