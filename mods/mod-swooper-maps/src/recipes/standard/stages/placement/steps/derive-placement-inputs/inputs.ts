import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static, StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import type { DiscoveryCatalogEntry } from "@civ7/adapter";
import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintOffsets,
  resolveNaturalWonderMaterializationDirection,
} from "@civ7/map-policy";
import placement from "@mapgen/domain/placement";
import type { PlacementInputsV1 } from "../../placement-inputs.js";
import { getStandardRuntime } from "../../../../runtime.js";

import DerivePlacementInputsContract from "./contract.js";

type DerivePlacementInputsConfig = Static<typeof DerivePlacementInputsContract.schema>;
type DerivePlacementInputsOps = StepRuntimeOps<
  NonNullable<typeof DerivePlacementInputsContract.ops>
>;
type PlanNaturalWondersOutput = Static<(typeof placement.ops.planNaturalWonders)["output"]>;
type PlanDiscoveriesOutput = Static<(typeof placement.ops.planDiscoveries)["output"]>;

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
  | {
      noLake: boolean;
      minimumElevation?: number;
      placementClass?: string;
      naturalWonderTiles?: number;
      naturalWonderDirection?: number;
    }
  | undefined
>;
const FEATURE_TAGS_BY_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;

export type PlacementInputsBuildResult = {
  inputs: PlacementInputsV1;
  naturalWonderPlan: PlanNaturalWondersOutput;
  discoveryPlan: PlanDiscoveriesOutput;
};

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

/**
 * DECLARED engine-surface read (ADR-009): per-tile terrain for natural-wonder
 * planning. Terrain is the one wonder-planning field that cannot be
 * reconstructed from pipeline artifacts — `validateAndFixTerrain` runs inside
 * the features projection step and applies engine-only terrain maintenance
 * (e.g. coast materialization) after every artifact-published terrain intent.
 * This mirrors the declared resource legality surface read in plan-resources:
 * the planner must see exactly what the stamp-time engine oracle will see.
 * Biome and feature surfaces ARE artifact/field-reconstructed (see
 * buildPlacementInputs); terrain stays a declared readback, not a silent one.
 */
function readDeclaredEngineTerrainSurface(context: ExtendedMapContext): Uint8Array {
  const { width, height } = context.dimensions;
  const size = width * height;
  const terrainType = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    terrainType[i] = Math.max(0, context.adapter.getTerrainType(x, y) | 0);
  }
  return terrainType;
}

/**
 * Engine biome surface reconstructed from the ecology biomeBindings artifact.
 * `plot-biomes` stamps exactly `engineBiomeId` per tile and nothing rebinds
 * biomes between that projection and placement planning, so the artifact is
 * the engine biome surface without a readback.
 */
function buildEngineBiomeSurface(engineBiomeId: Uint16Array, size: number): Uint8Array {
  if (engineBiomeId.length !== size) {
    throw new Error(
      `[Placement] biomeBindings.engineBiomeId length ${engineBiomeId.length} != map size ${size}.`
    );
  }
  const biomeType = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    biomeType[i] = engineBiomeId[i] ?? 0;
  }
  return biomeType;
}

/**
 * Engine feature surface from the declared `field:featureType` dependency.
 * The features projection step reifies the engine feature surface into this
 * field after stamping + terrain validation, so placement planning consumes a
 * declared field edge instead of an undeclared per-tile adapter readback.
 */
function readDeclaredFeatureField(context: ExtendedMapContext, size: number): Int16Array {
  const featureType = context.fields?.featureType;
  if (!(featureType instanceof Int16Array) || featureType.length !== size) {
    throw new Error("[Placement] Missing or invalid field:featureType for placement planning.");
  }
  return featureType;
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

/** Builds placement inputs from map info, authored config, adapter-owned catalogs, and pipeline artifacts. */
export function buildPlacementInputs(
  context: ExtendedMapContext,
  config: DerivePlacementInputsConfig,
  ops: DerivePlacementInputsOps,
  physical: {
    topography: {
      landMask: Uint8Array;
      elevation: Int16Array;
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
    biomeBindings: {
      engineBiomeId: Uint16Array;
    };
    pedology: {
      fertility: Float32Array;
    };
  }
): PlacementInputsBuildResult {
  const runtime = getStandardRuntime(context);
  const { width, height } = context.dimensions;
  const size = width * height;
  const baseStarts = {
    playersLandmass1: runtime.playersLandmass1,
    playersLandmass2: runtime.playersLandmass2,
  };
  const wondersPlan = ops.wonders({ mapInfo: runtime.mapInfo }, config.wonders);
  const naturalWonderCatalog = context.adapter.getNaturalWonderCatalog().flatMap((entry) => {
    const featureType = entry.featureType | 0;
    const policy = FEATURE_POLICIES[String(featureType)];
    const materializationDirection = resolveNaturalWonderMaterializationDirection(
      policy ?? {},
      entry.direction | 0
    );
    const footprintOffsets = getNaturalWonderFootprintOffsets(
      policy ?? {},
      materializationDirection
    );
    if (!footprintOffsets) return [];
    return [
      {
        featureType,
        direction: materializationDirection,
        validTerrainTypes: [...(FEATURE_VALID_TERRAIN_TYPE_INDICES[String(featureType)] ?? [])],
        validBiomeTypes: [...(FEATURE_VALID_BIOME_TYPE_INDICES[String(featureType)] ?? [])],
        ...(policy?.minimumElevation !== undefined
          ? { minimumElevation: policy.minimumElevation }
          : {}),
        ...(policy?.noLake ? { noLake: true } : {}),
        ...(policy?.placementClass ? { placementClass: policy.placementClass } : {}),
        ...(policy?.naturalWonderTiles ? { naturalWonderTiles: policy.naturalWonderTiles } : {}),
        featureTags: [...(FEATURE_TAGS_BY_FEATURE_TYPE[String(featureType)] ?? [])],
        footprintOffsets: [...footprintOffsets],
      },
    ];
  });
  const discoveryCatalog = sanitizeDiscoveryCandidates(context.adapter.getDiscoveryCatalog());
  const terrainType = readDeclaredEngineTerrainSurface(context);
  const biomeType = buildEngineBiomeSurface(
    physical.biomeBindings.engineBiomeId as Uint16Array,
    size
  );
  const featureType = readDeclaredFeatureField(context, size);
  const naturalWonderBlockedMask = buildNaturalWonderBlockedMask(width, height);
  const naturalWonderPlan = ops.naturalWonders(
    {
      width,
      height,
      wondersCount: wondersPlan.wondersCount,
      landMask: physical.topography.landMask,
      elevation: physical.topography.elevation,
      aridityIndex: physical.biomeClassification.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
      coastTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      mountainTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN,
      iceFeatureType: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ICE,
      terrainType,
      biomeType,
      featureType,
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
      elevation: physical.topography.elevation,
      aridityIndex: physical.biomeClassification.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
      candidateDiscoveries: discoveryCatalog,
    },
    config.discoveries
  );
  return {
    inputs: {
      mapInfo: runtime.mapInfo,
      starts: baseStarts,
      wonders: wondersPlan,
      placementConfig: config,
    },
    naturalWonderPlan,
    discoveryPlan,
  };
}
