import {
  COAST_TERRAIN,
  FLAT_TERRAIN,
  OCEAN_TERRAIN,
  defineVizMeta,
  logLandmassAscii,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  CIV7_COAST_CLASSIFICATION_POLICY_V0,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
  applyCiv7CoastClassificationPolicy,
} from "@civ7/map-policy";
import PlotCoastsStepContract from "./plotCoasts.contract.js";
import { assertWaterDriftWithinPolicy } from "../../../projection-policies/noWaterDrift.js";
import { mapMorphologyArtifacts } from "../artifacts.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(PlotCoastsStepContract, {
  artifacts: implementArtifacts(
    [
      mapMorphologyArtifacts.coastClassification,
      mapMorphologyArtifacts.coastEngineTerrainSnapshot,
    ],
    {
      coastClassification: {},
      coastEngineTerrainSnapshot: {},
    }
  ),
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));

    // 0=land, 1=coast, 2=ocean
    const baseWaterClass = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Coasts are shallow shelf water derived from Morphology truth (our analogue of Civ's
        // validateAndFixTerrain + expandCoasts pipeline). We intentionally avoid Civ's coast expansion.
        const isLand = topography.landMask[idx] === 1;
        const isCoast =
          !isLand &&
          (coastlineMetrics.coastalWater[idx] === 1 || coastlineMetrics.shelfMask[idx] === 1);
        baseWaterClass[idx] = isLand
          ? WATER_CLASS_LAND
          : isCoast
            ? WATER_CLASS_COAST
            : WATER_CLASS_OCEAN;
      }
    }

    const coastPolicy = applyCiv7CoastClassificationPolicy({
      width,
      height,
      waterClass: baseWaterClass,
    });
    const waterClass = coastPolicy.waterClass;

    deps.artifacts.coastClassification.publish(context, {
      width,
      height,
      baseWaterClass,
      waterClass,
      policyCoastMask: coastPolicy.policyCoastMask,
      coastBufferTiles: coastPolicy.coastBufferTiles,
      promotedOceanToCoast: coastPolicy.promotedOceanToCoast,
    });

    context.trace.event(() => ({
      type: "map.morphology.coasts.policy",
      policy: "civ7.coastClassification.v0",
      coastBufferTiles: coastPolicy.coastBufferTiles,
      promotedOceanToCoast: coastPolicy.promotedOceanToCoast,
      source: CIV7_COAST_CLASSIFICATION_POLICY_V0.source,
    }));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const cls = waterClass[idx] | 0;
        const terrain = cls === WATER_CLASS_LAND
          ? FLAT_TERRAIN
          : cls === WATER_CLASS_COAST
            ? COAST_TERRAIN
            : OCEAN_TERRAIN;
        context.adapter.setTerrainType(x, y, terrain);
      }
    }

    const engineAfterCoasts = snapshotEngineHeightfield(context);
    if (engineAfterCoasts) {
      deps.artifacts.coastEngineTerrainSnapshot.publish(context, {
        stage: "map-morphology/plot-coasts",
        width,
        height,
        landMask: engineAfterCoasts.landMask,
        terrain: engineAfterCoasts.terrain,
        elevation: engineAfterCoasts.elevation,
      });
    }

    // Map-stage layers: coastline metrics are computed from Morphology truth (tile-space) and should match
    // the engine terrain projection (land=flat, coastal water=coast, deep water=ocean).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.waterClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: waterClass,
      meta: defineVizMeta("map.morphology.coasts.waterClass", {
        label: "Water Class (Stamped)",
        group: GROUP_MAP_MORPHOLOGY,
        description:
          "What the engine actually receives after Morphology coast projection (0=land, 1=coast, 2=ocean).",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Land", color: [156, 163, 175, 200] },
          { value: 1, label: "Coast", color: [56, 189, 248, 235] },
          { value: 2, label: "Ocean", color: [37, 99, 235, 235] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalLand,
      meta: defineVizMeta("map.morphology.coasts.coastalLand", {
        label: "Coastal Land (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalWater,
      meta: defineVizMeta("map.morphology.coasts.coastalWater", {
        label: "Coastal Water (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.shelfMask,
      meta: defineVizMeta("map.morphology.coasts.shelfMask", {
        label: "Shelf Mask (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertWaterDriftWithinPolicy(context, topography.landMask, "map-morphology/plot-coasts");
  },
});
