import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import source from "./earth-huge.json";

/** Pinned authored evidence, not completed-native observations or empirical Earth measurements. */
export const earthReference = source;

/** Fresh lossless source-index buffers; native height never determines the independent water mask. */
export function createEarthReferenceSurface() {
  const { width, height } = source.grid;
  const terrain = [...source.terrainRows.join("")];
  return {
    width,
    height,
    elevation: Int16Array.from(source.nativeElevationRows.flat()),
    landMask: Uint8Array.from(terrain, (code) => (code === "C" || code === "O" ? 0 : 1)),
    sourceShelfMask: Uint8Array.from(terrain, (code) => (code === "C" ? 1 : 0)),
  };
}

/**
 * Source y grows northward; climate y grows southward. For this even-height odd-R grid,
 * the row-parity X correction preserves every hex edge through the reflection.
 */
export function northFirstIndex(sourceCell: number): number {
  const { width, height } = source.grid;
  const y = Math.floor(sourceCell / width);
  const x = sourceCell % width;
  return (height - 1 - y) * width + ((x + (y & 1)) % width);
}

/** Source water components remain witnesses: enclosed coast is not silently certified as marine. */
export function sourceWaterComponents(): number[][] {
  const { width, height, landMask } = createEarthReferenceSurface();
  const visited = new Uint8Array(width * height);
  const components: number[][] = [];
  for (let cell = 0; cell < landMask.length; cell++) {
    if (landMask[cell] || visited[cell]) continue;
    const queue = [cell];
    visited[cell] = 1;
    for (let at = 0; at < queue.length; at++) {
      const current = queue[at]!;
      for (const neighbor of getHexNeighborIndicesOddQ(
        current % width,
        Math.floor(current / width),
        width,
        height
      )) {
        if (landMask[neighbor] || visited[neighbor]) continue;
        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }
    components.push(queue.sort((a, b) => a - b));
  }
  return components.sort((a, b) => b.length - a.length || a[0]! - b[0]!);
}
