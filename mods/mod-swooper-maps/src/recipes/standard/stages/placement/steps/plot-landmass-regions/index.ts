import { balancedHemisphereMeridian, hemisphereSlotForColumn } from "@civ7/map-policy";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { artifactModules as standardArtifactModules } from "../../../../artifacts/index.js";
import { PLACEMENT_VIZ_GROUP, transparentNoneCategory } from "../../viz.js";
import PlotLandmassRegionsStepContract from "./contract.js";

type RegionSlot = 0 | 1 | 2;

const GROUP_GAMEPLAY = PLACEMENT_VIZ_GROUP;

function computeWrappedIntervalCenter(west: number, east: number, width: number): number {
  if (width <= 0) return 0;
  const w = ((west % width) + width) % width;
  const e = ((east % width) + width) % width;
  if (w <= e) return Math.floor((w + e) / 2);
  const length = width - w + (e + 1);
  return (w + Math.floor(length / 2)) % width;
}

/**
 * Area-weighted circular mean column of a landmass (robust across the X seam).
 * Uses accumulated cos/sin of each land tile's column angle; falls back to the
 * bbox interval center when the circular mean is undefined (e.g. a landmass
 * spread evenly around the cylinder).
 */
function circularCentroidColumn(
  cosSum: number | undefined,
  sinSum: number | undefined,
  bbox: { west: number; east: number },
  width: number
): number {
  const c = cosSum ?? 0;
  const s = sinSum ?? 0;
  if (Math.abs(c) < 1e-9 && Math.abs(s) < 1e-9) {
    return computeWrappedIntervalCenter(bbox.west, bbox.east, width);
  }
  let angle = Math.atan2(s, c);
  if (angle < 0) angle += 2 * Math.PI;
  return width > 0 ? Math.round((angle / (2 * Math.PI)) * width) % width : 0;
}

function resolveSlotByTile(input: {
  width: number;
  height: number;
  landMask: Uint8Array;
  landmassIdByTile: Int32Array;
  landmasses: ReadonlyArray<{ id: number; bbox: { west: number; east: number } }>;
}): Uint8Array {
  const { width, height, landMask, landmassIdByTile, landmasses } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  if (landMask.length !== size) {
    throw new Error(`Expected landMask length ${size} (received ${landMask.length}).`);
  }
  if (landmassIdByTile.length !== size) {
    throw new Error(
      `Expected landmassIdByTile length ${size} (received ${landmassIdByTile.length}).`
    );
  }

  // Pass 1: per-column settleable-land histogram (drives the balanced meridian)
  // plus per-landmass circular column accumulators (drive whole-landmass
  // assignment). WHY: the legacy `bbox-center < width/2` midline ignored land
  // area, so an asymmetric map (one dominant continent, or land massed on one
  // side of the seam) put most settleable land in one region while the player
  // split stayed a fixed 4/4 — crowding half the civs into a sliver. We instead
  // pick the meridian that halves real land and assign each landmass whole.
  const columnLand = new Float64Array(width);
  const cosSum = new Float64Array(landmasses.length);
  const sinSum = new Float64Array(landmasses.length);
  const radiansPerColumn = width > 0 ? (2 * Math.PI) / width : 0;
  for (let i = 0; i < size; i++) {
    if ((landMask[i] | 0) !== 1) continue;
    const y = (i / width) | 0;
    const x = i - y * width;
    columnLand[x] = (columnLand[x] ?? 0) + 1;
    const landmassId = landmassIdByTile[i] ?? -1;
    if (landmassId >= 0 && landmassId < landmasses.length) {
      cosSum[landmassId] = (cosSum[landmassId] ?? 0) + Math.cos(x * radiansPerColumn);
      sinSum[landmassId] = (sinSum[landmassId] ?? 0) + Math.sin(x * radiansPerColumn);
    }
  }

  const { meridianOffset } = balancedHemisphereMeridian(columnLand, width);

  // Assign each landmass WHOLE by its circular column centroid relative to the
  // balanced meridian. Keeping continents intact preserves the
  // Homelands/Distant-Lands semantic (a homeland is a continent; distant lands
  // are across the ocean). Residual imbalance when one continent exceeds half
  // the land is absorbed by capacity-proportional player allocation (D2).
  const slotByLandmass = new Uint8Array(landmasses.length);
  for (const mass of landmasses) {
    const centroidX = circularCentroidColumn(cosSum[mass.id], sinSum[mass.id], mass.bbox, width);
    slotByLandmass[mass.id] = hemisphereSlotForColumn(centroidX, meridianOffset, width);
  }

  const out = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if ((landMask[i] | 0) !== 1) {
      out[i] = 0;
      continue;
    }
    const landmassId = landmassIdByTile[i] ?? -1;
    if (landmassId < 0 || landmassId >= slotByLandmass.length) {
      out[i] = 0;
      continue;
    }
    out[i] = slotByLandmass[landmassId] ?? 0;
  }

  return out;
}

/**
 * Maps final landmasses into seam-safe west/east region slots, applies those
 * slots to Civ7, and publishes the exact per-tile projection metadata.
 */
export default createStep(PlotLandmassRegionsStepContract, {
  artifacts: [
    standardArtifactModules.projectionMeta,
    standardArtifactModules.landmassRegionSlotByTile,
  ],
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const { width, height } = context.dimensions;
    const slotByTile = resolveSlotByTile({
      width,
      height,
      landMask: topography.landMask as Uint8Array,
      landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
      landmasses: landmasses.landmasses,
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "placement.landmassRegions.regionSlot",
      spaceId: "tile.hexOddQ",
      dims: { width, height },
      format: "u8",
      values: slotByTile,
      meta: defineVizMeta("placement.landmassRegions.regionSlot", {
        label: "Landmass Region Slot",
        group: GROUP_GAMEPLAY,
        palette: "categorical",
        categories: [
          // Transparent None (audit presentation defect a): the previous
          // alpha-210 slate wash painted all water/unassigned tiles opaque.
          transparentNoneCategory(),
          { value: 1, label: "West", color: [59, 130, 246, 230] },
          { value: 2, label: "East", color: [239, 68, 68, 230] },
        ],
      }),
    });

    const westRegionId = context.adapter.getLandmassId("WEST");
    const eastRegionId = context.adapter.getLandmassId("EAST");
    const noneRegionId = context.adapter.getLandmassId("NONE");

    const size = Math.max(0, (width | 0) * (height | 0));
    for (let i = 0; i < size; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      const slot = (slotByTile[i] ?? 0) as RegionSlot;
      const regionId = slot === 1 ? westRegionId : slot === 2 ? eastRegionId : noneRegionId;
      context.adapter.setLandmassRegionId(x, y, regionId);
    }

    deps.artifacts.projectionMeta.publish(context, {
      width,
      height,
      wrapX: true,
      wrapY: false,
    });
    deps.artifacts.landmassRegionSlotByTile.publish(context, { slotByTile });
  },
});
