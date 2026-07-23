import type { MapInfo } from "@civ7/adapter";
import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintOffsetsByParity,
  type NaturalWonderCatalogEntry,
  NO_FEATURE_TYPE,
  resolveNaturalWonderMaterializationDirection,
} from "@civ7/map-policy";
import placement from "@mapgen/domain/placement";
import type { MapContext } from "@swooper/mapgen-core";
import type { Static, StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import type { CurrentEnginePlacementTypes } from "../../../../current-engine-surface.js";

import { DerivePlacementInputsStepContract } from "./config.js";

type DerivePlacementInputsConfig = Static<typeof DerivePlacementInputsStepContract.schema>;
type DerivePlacementInputsOps = StepRuntimeOps<
  NonNullable<typeof DerivePlacementInputsStepContract.ops>
>;
type PlacementInputsV1 = Static<
  typeof import("../../artifacts/placement-inputs.artifact.js").artifact.schema
>;
type PlanNaturalWondersOutput = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

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
      naturalWonderPlaceFirst?: boolean;
    }
  | undefined
>;
const FEATURE_TAGS_BY_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;

/** Placement inputs, natural-wonder intent, and the exact surfaces evaluated to produce it. */
export type PlacementInputsBuildResult = {
  inputs: PlacementInputsV1;
  naturalWonderPlan: PlanNaturalWondersOutput;
  naturalWonderPlanSurfaces: {
    terrainType: Int32Array;
    biomeType: Int32Array;
    featureType: Int32Array;
    blockedMask: Uint8Array;
  };
};

/** Current Civ7 facts admitted once at the placement-input step boundary. */
export type PlacementInputEngineEvidence = Readonly<{
  mapInfo: MapInfo;
  naturalWonderCatalog: readonly NaturalWonderCatalogEntry[];
  currentPlacementTypes: CurrentEnginePlacementTypes;
}>;

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

/**
 * Builds placement inputs from map info, authored config, admitted engine catalogs,
 * and pipeline artifacts — and runs the natural-wonder planner.
 *
 * This is the boundary step (`kind:mod`) that lets the pure planner stay
 * engine-/policy-free: it resolves each catalog wonder's MATERIALIZATION
 * direction and parity-keyed footprint offsets from `@civ7/map-policy`
 * (`resolveNaturalWonderMaterializationDirection` /
 * `getNaturalWonderFootprintOffsetsByParity`) and passes them across as plain
 * contract DATA in `featureCatalog`. Wonders whose placement class has no
 * footprint are dropped here (the `if (!footprintOffsetsByParity) return []`),
 * so the op never sees an unstampable shape.
 *
 * It also forwards already-computed physical signals (vegetation, moisture,
 * temperature, fertility, discharge, slope) — never recomputed — and the engine
 * terrain/biome/feature surfaces (terrain is a DECLARED readback, while biome and
 * feature are artifact evidence) plus the polar-water
 * `naturalWonderBlockedMask`. Returns the assembled inputs and the planner's
 * `naturalWonderPlan` (the intent that `place-natural-wonders` later stamps).
 */
export function buildPlacementInputs(
  context: MapContext,
  config: DerivePlacementInputsConfig,
  ops: DerivePlacementInputsOps,
  physical: {
    topography: {
      landMask: Uint8Array;
      elevation: Int16Array;
    };
    hydrography: {
      riverClass: Uint8Array;
      discharge: Float32Array;
      slopeClass: Uint8Array;
    };
    lakePlan: {
      lakeMask: Uint8Array;
    };
    biomeClassification: {
      vegetationDensity: Float32Array;
    };
    climateIndices: {
      effectiveMoisture: Float32Array;
      surfaceTemperature: Float32Array;
      aridityIndex: Float32Array;
    };
    pedology: {
      fertility: Float32Array;
    };
  },
  engineEvidence: PlacementInputEngineEvidence
): PlacementInputsBuildResult {
  const { mapInfo, naturalWonderCatalog, currentPlacementTypes } = engineEvidence;
  const { width, height } = context.setup.dimensions;
  const baseStarts = {
    playersLandmass1: mapInfo.PlayersLandmass1 ?? 4,
    playersLandmass2: mapInfo.PlayersLandmass2 ?? 4,
  };
  const wondersPlan = ops.wonders({ mapInfo }, config.wonders);
  const plannedNaturalWonderCatalog = naturalWonderCatalog.flatMap((entry) => {
    const featureType = entry.featureType | 0;
    const policy = FEATURE_POLICIES[String(featureType)];
    const materializationDirection = resolveNaturalWonderMaterializationDirection(
      policy,
      entry.direction | 0
    );
    const footprintOffsetsByParity = getNaturalWonderFootprintOffsetsByParity(
      policy,
      materializationDirection
    );
    if (!footprintOffsetsByParity) return [];
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
        ...(policy?.naturalWonderPlaceFirst ? { placeFirst: true } : {}),
        ...(policy?.placementClass ? { placementClass: policy.placementClass } : {}),
        ...(policy?.naturalWonderTiles ? { naturalWonderTiles: policy.naturalWonderTiles } : {}),
        featureTags: [...(FEATURE_TAGS_BY_FEATURE_TYPE[String(featureType)] ?? [])],
        footprintOffsetsByParity: {
          even: [...footprintOffsetsByParity.even],
          odd: [...footprintOffsetsByParity.odd],
        },
      },
    ];
  });
  const { terrainType, biomeType, featureType } = currentPlacementTypes;
  const naturalWonderBlockedMask = buildNaturalWonderBlockedMask(width, height);
  const naturalWonderPlan = ops.naturalWonders(
    {
      width,
      height,
      wondersCount: wondersPlan.wondersCount,
      landMask: physical.topography.landMask,
      elevation: physical.topography.elevation,
      aridityIndex: physical.climateIndices.aridityIndex,
      riverClass: physical.hydrography.riverClass,
      lakeMask: physical.lakePlan.lakeMask,
      // Forwarded physical suitability signals (already-computed; not recomputed).
      vegetationDensity: physical.biomeClassification.vegetationDensity,
      effectiveMoisture: physical.climateIndices.effectiveMoisture,
      surfaceTemperature: physical.climateIndices.surfaceTemperature,
      fertility: physical.pedology.fertility,
      discharge: physical.hydrography.discharge,
      slopeClass: physical.hydrography.slopeClass,
      coastTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      mountainTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN,
      iceFeatureType: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ICE,
      terrainType,
      biomeType,
      featureType,
      noFeatureType: NO_FEATURE_TYPE,
      naturalWonderBlockedMask,
      featureCatalog: plannedNaturalWonderCatalog,
    },
    config.naturalWonders
  );
  return {
    inputs: {
      mapInfo,
      starts: baseStarts,
      wonders: wondersPlan,
      placementConfig: config,
    },
    naturalWonderPlan,
    naturalWonderPlanSurfaces: {
      terrainType,
      biomeType,
      featureType,
      blockedMask: naturalWonderBlockedMask,
    },
  };
}
