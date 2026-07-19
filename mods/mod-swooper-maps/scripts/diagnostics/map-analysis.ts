import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

/**
 * Summarizes the Swooper binary land mask used by product reports.
 * Only the canonical value `1` counts as land; every other cell remains water evidence.
 */
export function landmaskStats(values: Uint8Array): Readonly<{
  land: number;
  water: number;
  pctLand: number;
}> {
  let land = 0;
  for (let index = 0; index < values.length; index++) {
    if (values[index] === 1) land++;
  }
  const water = values.length - land;
  return { land, water, pctLand: values.length > 0 ? land / values.length : 0 };
}

/**
 * Measures Swooper landmasses with the engine's odd-Q hex adjacency.
 * The binary mask must cover the declared grid exactly; wrapping is intentionally not inferred.
 */
export function connectedComponentsLandOddQ(
  values: Uint8Array,
  width: number,
  height: number
): Readonly<{
  landComponents: number;
  largestLandComponent: number;
  largestLandFrac: number;
  totalLand: number;
}> {
  const size = width * height;
  if (values.length !== size) {
    throw new Error(`Connected-component size mismatch: values=${values.length} dims=${size}`);
  }

  const visited = new Uint8Array(size);
  const componentSizes: number[] = [];
  const queue: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (visited[index]) continue;
      if (values[index] !== 1) {
        visited[index] = 1;
        continue;
      }

      visited[index] = 1;
      queue.length = 0;
      queue.push(index);

      let count = 0;
      while (queue.length > 0) {
        const current = queue.pop();
        if (current === undefined) break;
        count++;
        const currentY = Math.floor(current / width);
        const currentX = current - currentY * width;
        forEachHexNeighborOddQ(currentX, currentY, width, height, (neighborX, neighborY) => {
          const neighborIndex = neighborY * width + neighborX;
          if (visited[neighborIndex]) return;
          visited[neighborIndex] = 1;
          if (values[neighborIndex] === 1) queue.push(neighborIndex);
        });
      }
      componentSizes.push(count);
    }
  }

  componentSizes.sort((left, right) => right - left);
  const totalLand = componentSizes.reduce((total, count) => total + count, 0);
  const largestLandComponent = componentSizes[0] ?? 0;
  return {
    landComponents: componentSizes.length,
    largestLandComponent,
    largestLandFrac: totalLand > 0 ? largestLandComponent / totalLand : 0,
    totalLand,
  };
}
