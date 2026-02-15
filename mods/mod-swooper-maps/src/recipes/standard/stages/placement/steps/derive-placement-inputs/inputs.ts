import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static, StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import type { PlacementInputsV1 } from "../../placement-inputs.js";
import { getStandardRuntime } from "../../../../runtime.js";

import DerivePlacementInputsContract from "./contract.js";

type DerivePlacementInputsConfig = Static<typeof DerivePlacementInputsContract.schema>;
type DerivePlacementInputsOps = StepRuntimeOps<NonNullable<typeof DerivePlacementInputsContract.ops>>;

function sanitizeResourceCandidates(values: number[], noResourceSentinel: number): number[] {
  const unique = new Set<number>();
  for (const raw of values) {
    if (!Number.isFinite(raw)) continue;
    const value = raw | 0;
    if (value < 0) continue;
    if (value === (noResourceSentinel | 0)) continue;
    unique.add(value);
  }
  return Array.from(unique).sort((a, b) => a - b);
}

<<<<<<< HEAD
/** Builds placement inputs from map info, authored config, and adapter-owned catalogs. */
=======
/** Builds placement inputs from map info, authored config, and adapter-owned catalogs. */
>>>>>>> dfbf677ff (test(placement): add fail-hard and runtime-candidate regressions)
export function buildPlacementInputs(
  context: ExtendedMapContext,
  config: DerivePlacementInputsConfig,
  ops: DerivePlacementInputsOps,
  physical: {
    topography: {
      landMask: Uint8Array;
    };
    hydrography: {
      riverClass: Uint8Array;
    };
    lakePlan: {
      lakeMask: Uint8Array;
    };
    biomeClassification: {
      effectiveMoisture: Float32Array;
      surfaceTemperature: Float32Array;
      aridityIndex: Float32Array;
    };
    pedology: {
      fertility: Float32Array;
    };
  }
): PlacementInputsV1 {
  const runtime = getStandardRuntime(context);
  const { width, height } = context.dimensions;
  const baseStarts = {
    playersLandmass1: runtime.playersLandmass1,
    playersLandmass2: runtime.playersLandmass2,
    startSectorRows: runtime.startSectorRows,
    startSectorCols: runtime.startSectorCols,
    startSectors: runtime.startSectors,
  };
  const startsPlan = ops.starts({ baseStarts }, config.starts);
  const wondersPlan = ops.wonders({ mapInfo: runtime.mapInfo }, config.wonders);
  const naturalWonderCatalog = context.adapter.getNaturalWonderCatalog();
  const defaultDiscoveryPlacement = context.adapter.getDefaultDiscoveryPlacement();
  const noResourceSentinel = context.adapter.NO_RESOURCE | 0;
  let runtimeCandidateResourceTypes: number[] = [];
  try {
    // Adapter controls this catalog; if unavailable, planner falls back to authored candidates.
    runtimeCandidateResourceTypes = sanitizeResourceCandidates(
      context.adapter.getPlaceableResourceTypes(),
      noResourceSentinel
    );
  } catch {
    runtimeCandidateResourceTypes = [];
  }
  const naturalWonderPlan = ops.naturalWonders(
    {
      width,
      height,
      wondersCount: wondersPlan.wondersCount,
      landMask: physical.topography.landMask,
      elevation: context.buffers.heightfield.elevation,
      aridityIndex: physical.biomeClassification.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
      featureCatalog: naturalWonderCatalog,
    },
    config.naturalWonders
  );
  const discoveryPlan = ops.discoveries(
    {
      width,
      height,
      landMask: physical.topography.landMask,
      elevation: context.buffers.heightfield.elevation,
      aridityIndex: physical.biomeClassification.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
      discoveryVisualType: defaultDiscoveryPlacement.discoveryVisualType,
      discoveryActivationType: defaultDiscoveryPlacement.discoveryActivationType,
    },
    config.discoveries
  );
  const floodplainsPlan = ops.floodplains({}, config.floodplains);
  const resourcesPlan = ops.resources(
    {
      width,
      height,
      noResourceSentinel,
      runtimeCandidateResourceTypes,
      landMask: physical.topography.landMask,
      fertility: physical.pedology.fertility,
      effectiveMoisture: physical.biomeClassification.effectiveMoisture,
      surfaceTemperature: physical.biomeClassification.surfaceTemperature,
      aridityIndex: physical.biomeClassification.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
    },
    config.resources
  );

  return {
    mapInfo: runtime.mapInfo,
    starts: startsPlan,
    wonders: wondersPlan,
    naturalWonderPlan,
    discoveryPlan,
    floodplains: floodplainsPlan,
    resources: resourcesPlan,
    placementConfig: config,
  };
}
