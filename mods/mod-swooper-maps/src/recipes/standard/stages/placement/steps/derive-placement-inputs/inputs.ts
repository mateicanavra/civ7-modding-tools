import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static, StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import type { DiscoveryCatalogEntry } from "@civ7/adapter";
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

function sanitizeDiscoveryCandidates(values: DiscoveryCatalogEntry[]): DiscoveryCatalogEntry[] {
  const unique = new Set<string>();
  const candidates: DiscoveryCatalogEntry[] = [];
  for (const raw of values) {
    if (!Number.isFinite(raw?.discoveryVisualType) || !Number.isFinite(raw?.discoveryActivationType)) continue;
    const discoveryVisualType = (raw.discoveryVisualType as number) | 0;
    const discoveryActivationType = (raw.discoveryActivationType as number) | 0;
    if (discoveryVisualType < 0 || discoveryActivationType < 0) continue;
    const key = `${discoveryVisualType}:${discoveryActivationType}`;
    if (unique.has(key)) continue;
    unique.add(key);
    candidates.push({
      discoveryVisualType,
      discoveryActivationType,
    });
  }
  return candidates;
}

/** Builds placement inputs from map info, authored config, and adapter-owned catalogs. */
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
  const discoveryCatalog = sanitizeDiscoveryCandidates(context.adapter.getDiscoveryCatalog());
  const noResourceSentinel = context.adapter.NO_RESOURCE | 0;
  const candidateResourceTypes = sanitizeResourceCandidates(
    context.adapter.getPlaceableResourceTypes(),
    noResourceSentinel
  );
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
      candidateDiscoveries: discoveryCatalog,
    },
    config.discoveries
  );
  const floodplainsPlan = ops.floodplains({}, config.floodplains);
  const resourcesPlan = ops.resources(
    {
      width,
      height,
      noResourceSentinel,
      candidateResourceTypes,
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
