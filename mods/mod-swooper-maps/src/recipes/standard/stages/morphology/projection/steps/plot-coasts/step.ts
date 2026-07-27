import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_COAST_RING_POLICY_V0,
  deriveCiv7CoastProjection,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
} from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../../viz.js";
import { assertWaterDriftWithinPolicy } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Classifies and stamps coasts from topography and shelf truth, then checks
 * the resulting engine surface without publishing mutable observation state.
 */
export const PlotCoastsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const shelf = deps.artifacts.shelf.read();
    const { width, height } = context.setup.dimensions;

    const coastProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: shelf.shelfMask,
      coastalWater: shelf.coastalWater,
    });
    const { waterClass, promotedOceanToCoast } = coastProjection;

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
            ? CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT
            : cls === WATER_CLASS_COAST
              ? CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST
              : CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN;
        deps.engine.setTerrainType(context, x, y, terrain);
      }
    }

    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      engineWaterMask,
      topography.landMask,
      "map-morphology/plot-coasts"
    );
    return {
      coastProjection,
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
      field: { format: "u8", values: result.coastProjection.waterClass },
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
      field: { format: "u8", values: result.coastProjection.sourceCoastMask },
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
      field: { format: "u8", values: result.coastProjection.coastRingMask },
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
