import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static, StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintOffsets,
  type DiscoveryCatalogEntry,
} from "@civ7/adapter";
import {
  OFFICIAL_RESOURCE_CORPUS,
  type OfficialAgeType,
} from "../../../../../../domain/resources/index.js";
import placement from "@mapgen/domain/placement";
import type { PlacementInputsV1 } from "../../placement-inputs.js";
import { getStandardRuntime } from "../../../../runtime.js";

import DerivePlacementInputsContract from "./contract.js";

type DerivePlacementInputsConfig = Static<typeof DerivePlacementInputsContract.schema>;
type DerivePlacementInputsOps = StepRuntimeOps<NonNullable<typeof DerivePlacementInputsContract.ops>>;
type PlanFloodplainsOutput = Static<typeof placement.ops.planFloodplains["output"]>;
type PlanStartsOutput = Static<typeof placement.ops.planStarts["output"]>;
type PlanWondersOutput = Static<typeof placement.ops.planWonders["output"]>;

const DEFAULT_RESOURCE_AGE: OfficialAgeType = "AGE_ANTIQUITY";
const KNOWN_RESOURCE_AGES = new Set<OfficialAgeType>(
  OFFICIAL_RESOURCE_CORPUS.flatMap((entry) => entry.validAges)
);
const FEATURE_VALID_TERRAIN_TYPE_INDICES =
  CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as Record<
    string,
    readonly number[] | undefined
  >;
const FEATURE_VALID_BIOME_TYPE_INDICES =
  CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices as Record<
    string,
    readonly number[] | undefined
  >;
const FEATURE_POLICIES = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  {
    noLake: boolean;
    minimumElevation?: number;
    placementClass?: string;
    naturalWonderTiles?: number;
    naturalWonderDirection?: number;
  } | undefined
>;
const FEATURE_TAGS_BY_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;

export type PlacementPlanBundle = {
  artifact: DeepReadonly<PlacementInputsV1>;
  starts: DeepReadonly<PlanStartsOutput>;
  wonders: DeepReadonly<PlanWondersOutput>;
  floodplains: DeepReadonly<PlanFloodplainsOutput>;
};

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

function isKnownResourceAge(value: unknown): value is OfficialAgeType {
  return typeof value === "string" && KNOWN_RESOURCE_AGES.has(value as OfficialAgeType);
}

export function resolveActiveResourceAge(): OfficialAgeType {
  const runtime = globalThis as typeof globalThis & {
    Game?: { age?: unknown };
    GameInfo?: { Ages?: { lookup?: (age: number) => { AgeType?: unknown } | null } };
  };
  const gameAge = runtime.Game?.age;
  const ageInfo =
    typeof gameAge === "number" && Number.isFinite(gameAge)
      ? runtime.GameInfo?.Ages?.lookup?.(gameAge)
      : null;
  const activeAge = ageInfo?.AgeType;
  return isKnownResourceAge(activeAge) ? activeAge : DEFAULT_RESOURCE_AGE;
}

export function filterResourceCandidatesForAge(
  candidateResourceTypes: readonly number[],
  activeAge: OfficialAgeType
): number[] {
  const allowedStaticSlots = new Set(
    OFFICIAL_RESOURCE_CORPUS
      .filter(
        (entry) =>
          entry.validAges.includes(activeAge) &&
          entry.placeability.status === "placeable" &&
          entry.strategyRequired.status === "required"
      )
      .map((entry) => entry.staticResourceRowSlot)
  );

  return candidateResourceTypes.filter((resourceType) => allowedStaticSlots.has(resourceType));
}

function sanitizeDiscoveryCandidates(values: DiscoveryCatalogEntry[]): DiscoveryCatalogEntry[] {
  const unique = new Set<string>();
  const candidates: DiscoveryCatalogEntry[] = [];
  for (const raw of values) {
    if (
      !Number.isFinite(raw?.discoveryVisualType) ||
      !Number.isFinite(raw?.discoveryActivationType)
    ) {
      continue;
    }
    const discoveryVisualType = Math.trunc(raw.discoveryVisualType as number);
    const discoveryActivationType = Math.trunc(raw.discoveryActivationType as number);
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

function readEngineSurface(context: ExtendedMapContext): {
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
} {
  const { width, height } = context.dimensions;
  const size = width * height;
  const terrainType = new Uint8Array(size);
  const biomeType = new Uint8Array(size);
  const featureType = new Int16Array(size);
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    terrainType[i] = Math.max(0, context.adapter.getTerrainType(x, y) | 0);
    biomeType[i] = Math.max(0, context.adapter.getBiomeType(x, y) | 0);
    featureType[i] = context.adapter.getFeatureType(x, y) | 0;
  }
  return { terrainType, biomeType, featureType };
}

function buildNaturalWonderBlockedMask(width: number, height: number): Uint8Array {
  const size = width * height;
  const mask = new Uint8Array(size);
  const polarWaterRows = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
  if (polarWaterRows === 0) return mask;
  for (let y = 0; y < height; y++) {
    if (y >= polarWaterRows && y < height - polarWaterRows) continue;
    const rowStart = y * width;
    mask.fill(1, rowStart, rowStart + width);
  }
  return mask;
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
  const naturalWonderCatalog = context.adapter.getNaturalWonderCatalog().map((entry) => {
    const featureType = entry.featureType | 0;
    const policy = FEATURE_POLICIES[String(featureType)];
    return {
      featureType,
      direction: entry.direction | 0,
      validTerrainTypes: [...(FEATURE_VALID_TERRAIN_TYPE_INDICES[String(featureType)] ?? [])],
      validBiomeTypes: [...(FEATURE_VALID_BIOME_TYPE_INDICES[String(featureType)] ?? [])],
      ...(policy?.minimumElevation !== undefined
        ? { minimumElevation: policy.minimumElevation }
        : {}),
      ...(policy?.noLake ? { noLake: true } : {}),
      ...(policy?.placementClass ? { placementClass: policy.placementClass } : {}),
      ...(policy?.naturalWonderTiles ? { naturalWonderTiles: policy.naturalWonderTiles } : {}),
      featureTags: [...(FEATURE_TAGS_BY_FEATURE_TYPE[String(featureType)] ?? [])],
      footprintOffsets: [
        ...(getNaturalWonderFootprintOffsets(policy ?? {}, entry.direction | 0) ?? []),
      ],
    };
  });
  const discoveryCatalog = sanitizeDiscoveryCandidates(context.adapter.getDiscoveryCatalog());
  const noResourceSentinel = context.adapter.NO_RESOURCE | 0;
  const activeResourceAge = resolveActiveResourceAge();
  const candidateResourceTypes = filterResourceCandidatesForAge(
    sanitizeResourceCandidates(context.adapter.getPlaceableResourceTypes(), noResourceSentinel),
    activeResourceAge
  );
  const engineSurface = readEngineSurface(context);
  const naturalWonderBlockedMask = buildNaturalWonderBlockedMask(width, height);
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
      coastTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      mountainTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN,
      iceFeatureType: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ICE,
      terrainType: engineSurface.terrainType,
      biomeType: engineSurface.biomeType,
      featureType: engineSurface.featureType,
      noFeatureType: context.adapter.NO_FEATURE | 0,
      naturalWonderBlockedMask,
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
      rngSeed: context.env.seed | 0,
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

/**
 * Gives product steps a typed view of the derived placement input artifact.
 *
 * The derivation step owns this shape because it is the step that composes the
 * authored config, map runtime, adapter catalogs, and physical fields into the
 * placement input artifact. Product/effect steps consume that artifact through
 * this owner instead of reaching into the terminal placement summary step.
 */
export function buildPlacementPlanInput(
  derivedInputs: DeepReadonly<PlacementInputsV1>
): PlacementPlanBundle {
  return {
    artifact: derivedInputs,
    starts: derivedInputs.starts,
    wonders: derivedInputs.wonders,
    floodplains: derivedInputs.floodplains,
  };
}
