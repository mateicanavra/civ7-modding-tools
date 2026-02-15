import computeEraPlateMembership from "../../src/domain/foundation/ops/compute-era-plate-membership/index.js";
import computeEraTectonicFields from "../../src/domain/foundation/ops/compute-era-tectonic-fields/index.js";
import computeHotspotEvents from "../../src/domain/foundation/ops/compute-hotspot-events/index.js";
import computePlateMotion from "../../src/domain/foundation/ops/compute-plate-motion/index.js";
import computeSegmentEvents from "../../src/domain/foundation/ops/compute-segment-events/index.js";
import computeTectonicHistoryRollups from "../../src/domain/foundation/ops/compute-tectonic-history-rollups/index.js";
import computeTectonicProvenance from "../../src/domain/foundation/ops/compute-tectonic-provenance/index.js";
import computeTectonicSegments from "../../src/domain/foundation/ops/compute-tectonic-segments/index.js";
import computeTectonicsCurrent from "../../src/domain/foundation/ops/compute-tectonics-current/index.js";
import computeTracerAdvection from "../../src/domain/foundation/ops/compute-tracer-advection/index.js";

const OROGENY_ERA_GAIN_MIN = 0.85;
const OROGENY_ERA_GAIN_MAX = 1.15;

function mergeConfig(base, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) {
    return base;
  }
  return {
    ...base,
    config: {
      ...base.config,
      ...overrides,
    },
  };
}

export function runTectonicHistoryChain(params) {
  const { mesh, crust, mantleForcing, plateGraph, plateMotion, config } = params;

  const eraPlateMembership = computeEraPlateMembership.run(
    { mesh, plateGraph, plateMotion },
    mergeConfig(computeEraPlateMembership.defaultConfig, {
      ...(config?.eraWeights ? { eraWeights: config.eraWeights } : {}),
      ...(config?.driftStepsByEra ? { driftStepsByEra: config.driftStepsByEra } : {}),
    })
  );

  const eraFieldsChain = [];
  for (let era = 0; era < eraPlateMembership.eraCount; era++) {
    const eraPlateId =
      eraPlateMembership.plateIdByEra[era] ??
      eraPlateMembership.plateIdByEra[eraPlateMembership.plateIdByEra.length - 1];
    if (!eraPlateId) continue;

    const eraPlateGraph = {
      ...plateGraph,
      cellToPlate: eraPlateId,
    };

    const eraPlateMotion = computePlateMotion
      .run({ mesh, plateGraph: eraPlateGraph, mantleForcing }, computePlateMotion.defaultConfig)
      .plateMotion;

    const eraSegments = computeTectonicSegments
      .run({ mesh, crust, plateGraph: eraPlateGraph, plateMotion: eraPlateMotion }, computeTectonicSegments.defaultConfig)
      .segments;

    const segmentEvents = computeSegmentEvents
      .run({ mesh, crust, segments: eraSegments }, computeSegmentEvents.defaultConfig)
      .events;

    const hotspotEvents = computeHotspotEvents
      .run({ mesh, mantleForcing, eraPlateId }, computeHotspotEvents.defaultConfig)
      .events;

    const eraWeight = eraPlateMembership.eraWeights[era] ?? 0;
    const eraT = eraPlateMembership.eraCount > 1 ? era / (eraPlateMembership.eraCount - 1) : 0;
    const eraGain = OROGENY_ERA_GAIN_MIN + (OROGENY_ERA_GAIN_MAX - OROGENY_ERA_GAIN_MIN) * eraT;

    const eraFields = computeEraTectonicFields.run(
      {
        mesh,
        segmentEvents,
        hotspotEvents,
        weight: eraWeight,
        eraGain,
      },
      mergeConfig(computeEraTectonicFields.defaultConfig, {
        ...(config?.beltInfluenceDistance !== undefined
          ? { beltInfluenceDistance: config.beltInfluenceDistance }
          : {}),
        ...(config?.beltDecay !== undefined ? { beltDecay: config.beltDecay } : {}),
      })
    );

    eraFieldsChain.push(eraFields.eraFields);
  }

  const historyResult = computeTectonicHistoryRollups.run(
    {
      eras: eraFieldsChain,
      plateIdByEra: eraPlateMembership.plateIdByEra,
    },
    mergeConfig(computeTectonicHistoryRollups.defaultConfig, {
      ...(config?.activityThreshold !== undefined ? { activityThreshold: config.activityThreshold } : {}),
    })
  );

  const newestEra =
    eraFieldsChain[eraPlateMembership.eraCount - 1] ?? eraFieldsChain[eraFieldsChain.length - 1];
  if (!newestEra) {
    throw new Error("[Foundation helper] failed to build tectonic era chain.");
  }

  const tectonics = computeTectonicsCurrent
    .run({ newestEra, upliftTotal: historyResult.tectonicHistory.upliftTotal }, computeTectonicsCurrent.defaultConfig)
    .tectonics;

  const tracerResult = computeTracerAdvection.run(
    { mesh, mantleForcing, eras: eraFieldsChain, eraCount: eraPlateMembership.eraCount },
    computeTracerAdvection.defaultConfig
  );

  const provenanceResult = computeTectonicProvenance.run(
    {
      mesh,
      plateGraph,
      eras: eraFieldsChain,
      tracerIndex: tracerResult.tracerIndex,
      eraCount: eraPlateMembership.eraCount,
    },
    computeTectonicProvenance.defaultConfig
  );

  return {
    tectonicHistory: historyResult.tectonicHistory,
    tectonics,
    tectonicProvenance: provenanceResult.tectonicProvenance,
    tracerIndex: tracerResult.tracerIndex,
    eraFieldsChain,
    eraPlateMembership,
  };
}
