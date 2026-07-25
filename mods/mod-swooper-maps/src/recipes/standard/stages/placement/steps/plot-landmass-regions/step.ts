import { createStep } from "@swooper/mapgen-core/authoring";
import {
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
} from "../../viz.js";
import { config } from "./config.js";

type RegionSlot = 0 | 1 | 2;

/**
 * Maps final landmasses into seam-safe west/east region slots, applies those
 * slots to Civ7, and publishes the exact per-tile region-slot evidence.
 */
export const PlotLandmassRegionsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const { width, height } = context.setup.dimensions;
    const { slotByTile } = ops.regions(
      {
        width,
        height,
        landMask: topography.landMask,
        landmassIdByTile: landmasses.landmassIdByTile,
        landmasses: landmasses.landmasses.map(({ id, bbox }) => ({
          id,
          west: bbox.west,
          east: bbox.east,
        })),
      },
      stepConfig.regions
    );

    const westRegionId = deps.engine.getLandmassId(context, "WEST");
    const eastRegionId = deps.engine.getLandmassId(context, "EAST");
    const noneRegionId = deps.engine.getLandmassId(context, "NONE");

    const size = width * height;
    for (let i = 0; i < size; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      const slot = (slotByTile[i] ?? 0) as RegionSlot;
      const regionId = slot === 1 ? westRegionId : slot === 2 ? eastRegionId : noneRegionId;
      deps.engine.setLandmassRegionId(context, x, y, regionId);
    }

    deps.artifacts.landmassRegionSlotByTile.publish(context, { slotByTile });
    return slotByTile;
  },
  viz: ({ result: slotByTile, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "placement.landmassRegions.regionSlot",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: slotByTile },
      meta: definePlacementVizCategoryMeta(
        "placement.landmassRegions.regionSlot",
        [
          // Transparent None: water and unassigned tiles must not wash out the map.
          transparentNoneCategory(),
          { value: 1, label: "West", color: [59, 130, 246, 230] },
          { value: 2, label: "East", color: [239, 68, 68, 230] },
        ],
        {
          label: "Landmass Region Slot",
        }
      ),
    },
  ],
});
