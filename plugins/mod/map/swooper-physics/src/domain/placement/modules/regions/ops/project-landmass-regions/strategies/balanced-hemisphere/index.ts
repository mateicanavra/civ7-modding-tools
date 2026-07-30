import { balancedHemisphereMeridian, hemisphereSlotForColumn } from "@civ7/map-policy";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import ProjectLandmassRegionsContract from "../../contract.js";
import BalancedHemisphereDefinition from "./config.js";

function wrappedIntervalCenter(west: number, east: number, width: number): number {
  const normalizedWest = ((west % width) + width) % width;
  const normalizedEast = ((east % width) + width) % width;
  if (normalizedWest <= normalizedEast) {
    return Math.floor((normalizedWest + normalizedEast) / 2);
  }
  const length = width - normalizedWest + normalizedEast + 1;
  return (normalizedWest + Math.floor(length / 2)) % width;
}

function circularCentroidColumn(input: {
  cosSum: number;
  sinSum: number;
  west: number;
  east: number;
  width: number;
}): number {
  if (Math.abs(input.cosSum) < 1e-9 && Math.abs(input.sinSum) < 1e-9) {
    return wrappedIntervalCenter(input.west, input.east, input.width);
  }
  let angle = Math.atan2(input.sinSum, input.cosSum);
  if (angle < 0) angle += 2 * Math.PI;
  return Math.round((angle / (2 * Math.PI)) * input.width) % input.width;
}

/**
 * Assigns connected landmasses whole to the west/east gameplay slots around
 * the meridian that most evenly divides settleable land.
 */
export default createStrategy(ProjectLandmassRegionsContract, BalancedHemisphereDefinition, {
  run: ({ width, height, landMask, landmassIdByTile, landmasses }) => {
    const size = width * height;
    const columnLand = new Float64Array(width);
    const landmassById = new Map(
      landmasses.map((landmass) => [
        landmass.id,
        {
          landmass,
          cosSum: 0,
          sinSum: 0,
        },
      ])
    );
    const radiansPerColumn = (2 * Math.PI) / width;

    for (let plotIndex = 0; plotIndex < size; plotIndex += 1) {
      if ((landMask[plotIndex] ?? 0) !== 1) continue;
      const y = Math.floor(plotIndex / width);
      const x = plotIndex - y * width;
      columnLand[x] = (columnLand[x] ?? 0) + 1;
      const landmassId = landmassIdByTile[plotIndex] ?? -1;
      const entry = landmassById.get(landmassId);
      if (!entry) continue;
      entry.cosSum += Math.cos(x * radiansPerColumn);
      entry.sinSum += Math.sin(x * radiansPerColumn);
    }

    const { meridianOffset } = balancedHemisphereMeridian(columnLand, width);
    const slotByLandmass = new Map<number, 1 | 2>();
    for (const { landmass, cosSum, sinSum } of landmassById.values()) {
      const centroidX = circularCentroidColumn({
        cosSum,
        sinSum,
        west: landmass.west,
        east: landmass.east,
        width,
      });
      slotByLandmass.set(landmass.id, hemisphereSlotForColumn(centroidX, meridianOffset, width));
    }

    const slotByTile = new Uint8Array(size);
    for (let plotIndex = 0; plotIndex < size; plotIndex += 1) {
      if ((landMask[plotIndex] ?? 0) !== 1) continue;
      const landmassId = landmassIdByTile[plotIndex] ?? -1;
      slotByTile[plotIndex] = slotByLandmass.get(landmassId) ?? 0;
    }

    return { slotByTile };
  },
});
