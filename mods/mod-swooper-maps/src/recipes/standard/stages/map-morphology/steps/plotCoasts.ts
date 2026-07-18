import {
  applyCiv7CoastRingPolicy,
  CIV7_COAST_RING_POLICY_V0,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
} from "@civ7/map-policy";
import {
  COAST_TERRAIN,
  defineVizMeta,
  FLAT_TERRAIN,
  logLandmassAscii,
  OCEAN_TERRAIN,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertWaterDriftWithinPolicy } from "../../../projection-policies/noWaterDrift.js";
import PlotCoastsStepContract from "./plotCoasts.contract.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Classifies and stamps coasts from topography and shelf truth, publishing the
 * engine snapshot and classification required by continent validation.
 */
export default createStep(PlotCoastsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));

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

    deps.artifacts.coastClassification.publish(context, {
      width,
      height,
      baseWaterClass,
      sourceCoastMask,
      waterClass,
      coastRingMask,
      promotedOceanToCoast,
    });

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
        label: "Water Class (Engine)",
        group: GROUP_MAP_MORPHOLOGY,
        description:
          "Water class stamped into engine terrain (0=land, 1=coast, 2=ocean): the continental shelf plus the guaranteed land-adjacent coast ring.",
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
      dataTypeKey: "map.morphology.coasts.sourceCoastMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: sourceCoastMask,
      meta: defineVizMeta("map.morphology.coasts.sourceCoastMask", {
        label: "Source Coast Mask",
        group: GROUP_MAP_MORPHOLOGY,
        description:
          "Pre-policy water tiles selected for coast terrain from the post-island shelf artifact (coastalWater or shelfMask).",
        visibility: "default",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Not source coast", color: [15, 23, 42, 40] },
          { value: 1, label: "Source coast", color: [14, 165, 233, 235] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastRingMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastRingMask,
      meta: defineVizMeta("map.morphology.coasts.coastRingMask", {
        label: "Coast Ring Additions",
        group: GROUP_MAP_MORPHOLOGY,
        description:
          "Ocean tiles promoted to coast by the land-adjacent coast-ring guarantee (the residue not already covered by the shelf).",
        visibility: "debug",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Not ring-added", color: [15, 23, 42, 40] },
          { value: 1, label: "Ring-added coast", color: [125, 211, 252, 235] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: shelf.coastalLand,
      meta: defineVizMeta("map.morphology.coasts.coastalLand", {
        label: "Coastal Land (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: shelf.coastalWater,
      meta: defineVizMeta("map.morphology.coasts.coastalWater", {
        label: "Coastal Water (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: shelf.shelfMask,
      meta: defineVizMeta("map.morphology.coasts.shelfMask", {
        label: "Shelf Mask (Post-island Shelf)",
        group: GROUP_MAP_MORPHOLOGY,
        visibility: "debug",
      }),
    });

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertWaterDriftWithinPolicy(context, topography.landMask, "map-morphology/plot-coasts");
  },
});
