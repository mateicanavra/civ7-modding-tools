import {
  applyCiv7CoastRingPolicy,
  CIV7_COAST_RING_POLICY_V0,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
} from "@civ7/map-policy";
import { logLandmassAscii, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertWaterDriftWithinPolicy } from "../../../../projection-policies/noWaterDrift.js";
import { resolveStandardProjectionTerrainTypes } from "../../../../projection-policies/standardProjectionEngineTypes.js";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
import { PlotCoastsStepContract } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Classifies and stamps coasts from topography and shelf truth, publishing the
 * engine snapshot and classification required by continent validation.
 */
export const PlotCoastsStep = createStep(PlotCoastsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const { width, height } = context.setup.dimensions;
    const terrainTypes = resolveStandardProjectionTerrainTypes(context.adapter);
    const size = width * height;

    // 0=land, 1=coast, 2=ocean
    const baseWaterClass = new Uint8Array(size);
    const sourceCoastMask = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Coast is the physically-derived continental shelf (margin-aware, depth-gated)
        // plus the guaranteed shoreline ring. No uniform distance band overrides it.
        const isLand = topography.landMask[idx] === 1;
        const isCoast = !isLand && (shelf.coastalWater[idx] === 1 || shelf.shelfMask[idx] === 1);
        if (isCoast) sourceCoastMask[idx] = 1;
        baseWaterClass[idx] = isLand
          ? WATER_CLASS_LAND
          : isCoast
            ? WATER_CLASS_COAST
            : WATER_CLASS_OCEAN;
      }
    }

    // Coast-ring invariant: every land tile must border at least one coast tile — no land
    // may sit against deep ocean (the live engine renders floating cliff plateaus) and
    // coastal settlement legality requires the adjacency. The shelf covers most of this
    // already; the ring policy heals the residue (e.g. ocean around island peaks injected
    // after coastline metrics) with a single land-adjacent ring using engine odd-R adjacency.
    // This is NOT a coast-width control — width is the shelf (see compute-shelf-mask).
    const coastRing = applyCiv7CoastRingPolicy({
      width,
      height,
      waterClass: baseWaterClass,
    });
    const waterClass = coastRing.waterClass;
    const coastRingMask = coastRing.coastRingMask;
    const promotedOceanToCoast = coastRing.promotedOceanToCoast;

    const coastClassification = {
      width,
      height,
      baseWaterClass,
      sourceCoastMask,
      waterClass,
      coastRingMask,
      promotedOceanToCoast,
    };
    deps.artifacts.coastClassification.publish(context, coastClassification);

    context.trace.event(() => ({
      type: "map.morphology.coasts.policy",
      policy: "civ7.coastRing.v0",
      promotedOceanToCoast,
      source: CIV7_COAST_RING_POLICY_V0.source,
    }));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const cls = waterClass[idx] | 0;
        const terrain =
          cls === WATER_CLASS_LAND
            ? terrainTypes.flat
            : cls === WATER_CLASS_COAST
              ? terrainTypes.coast
              : terrainTypes.ocean;
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

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertWaterDriftWithinPolicy(context, topography.landMask, "map-morphology/plot-coasts");
    return {
      coastClassification,
      coastalLand: shelf.coastalLand,
      coastalWater: shelf.coastalWater,
      shelfMask: shelf.shelfMask,
    };
  },
  viz: ({ result, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.waterClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.coastClassification.waterClass },
      meta: defineStandardVizCategoryMeta(
        "map.morphology.coasts.waterClass",
        [
          { value: 0, label: "Land", color: STANDARD_VIZ_COLORS.land },
          { value: 1, label: "Coast", color: STANDARD_VIZ_COLORS.water.coast },
          { value: 2, label: "Ocean", color: STANDARD_VIZ_COLORS.water.ocean },
        ],
        {
          label: "Water Class (Engine)",
          group: GROUP_MAP_MORPHOLOGY,
          description:
            "Water class stamped into engine terrain (0=land, 1=coast, 2=ocean): the continental shelf plus the guaranteed land-adjacent coast ring.",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.sourceCoastMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.coastClassification.sourceCoastMask },
      meta: defineStandardVizCategoryMeta(
        "map.morphology.coasts.sourceCoastMask",
        [
          { value: 0, label: "Not source coast", color: STANDARD_VIZ_COLORS.absent },
          { value: 1, label: "Source coast", color: STANDARD_VIZ_COLORS.water.coast },
        ],
        {
          label: "Source Coast Mask",
          group: GROUP_MAP_MORPHOLOGY,
          description:
            "Pre-policy water tiles selected for coast terrain from the post-island shelf artifact (coastalWater or shelfMask).",
          visibility: "default",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.coastRingMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.coastClassification.coastRingMask },
      meta: defineStandardVizCategoryMeta(
        "map.morphology.coasts.coastRingMask",
        [
          { value: 0, label: "Not ring-added", color: STANDARD_VIZ_COLORS.absent },
          { value: 1, label: "Ring-added coast", color: STANDARD_VIZ_COLORS.water.coast },
        ],
        {
          label: "Coast Ring Additions",
          group: GROUP_MAP_MORPHOLOGY,
          description:
            "Ocean tiles promoted to coast by the land-adjacent coast-ring guarantee (the residue not already covered by the shelf).",
          visibility: "debug",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.coastalLand },
      meta: defineStandardVizMeta("map.morphology.coasts.coastalLand", "category.distinct", {
        label: "Coastal Land (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.coastalWater },
      meta: defineStandardVizMeta("map.morphology.coasts.coastalWater", "category.distinct", {
        label: "Coastal Water (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.coasts.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.shelfMask },
      meta: defineStandardVizMeta("map.morphology.coasts.shelfMask", "category.distinct", {
        label: "Shelf Mask (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    },
  ],
});
