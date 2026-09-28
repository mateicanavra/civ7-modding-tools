import type { RiverDirection } from "@civ7/adapter";

/** Converts one physical adjacent receiver into the adapter's geographic symbols. */
export function riverDirectionToReceiver(width: number, height: number, sourceCell: number, receiverCell: number): RiverDirection {
  const size = width * height;
  if (!Number.isInteger(sourceCell) || !Number.isInteger(receiverCell) || sourceCell < 0 || receiverCell < 0 || sourceCell >= size || receiverCell >= size || sourceCell === receiverCell) {
    throw new Error(`Invalid authored river edge ${sourceCell}->${receiverCell}.`);
  }
  const x = sourceCell % width;
  const y = Math.floor(sourceCell / width);
  const parity = y % 2;
  // Civ7's north is increasing Y. Grid helper iteration positions are not native directions.
  const neighbors: readonly (readonly [RiverDirection, number, number])[] = [
    ["EAST", 1, 0], ["NORTHEAST", parity, 1], ["NORTHWEST", parity - 1, 1],
    ["WEST", -1, 0], ["SOUTHWEST", parity - 1, -1], ["SOUTHEAST", parity, -1],
  ];
  for (const [direction, dx, dy] of neighbors) {
    const nextY = y + dy;
    if (nextY < 0 || nextY >= height) continue;
    const nextX = (x + dx + width) % width;
    if (nextY * width + nextX === receiverCell) return direction;
  }
  throw new Error(`Nonadjacent authored river edge ${sourceCell}->${receiverCell}.`);
}

/** Pure lossless lowering: no routing, eligibility filtering, quota, or class demotion. */
export function projectAuthoredRiverNetwork(input: Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
}>) {
  const { width, height } = input;
  const size = width * height;
  for (const key of ["landMask", "lakeMask", "riverClass", "flowDir"] as const) {
    if (input[key].length !== size) throw new Error(`Authored river ${key} must cover the map.`);
  }
  const plannedMinorRiverMask = new Uint8Array(size);
  const plannedMajorRiverMask = new Uint8Array(size);
  const writes: { sourceCell: number; receiverCell: number; direction: RiverDirection; riverClass: "MINOR" | "NAVIGABLE" }[] = [];
  let plannedMinorRiverTileCount = 0;
  let plannedMajorRiverTileCount = 0;
  for (let sourceCell = 0; sourceCell < size; sourceCell++) {
    const riverClass = input.riverClass[sourceCell];
    if (riverClass === 0) continue;
    if (riverClass !== 1 && riverClass !== 2) throw new Error(`Invalid physical river class at ${sourceCell}.`);
    if (input.landMask[sourceCell] !== 1 || input.lakeMask[sourceCell] !== 0) {
      throw new Error(`Authored river source ${sourceCell} must be exposed land; wet connectivity is not a river write.`);
    }
    const receiverCell = input.flowDir[sourceCell]!;
    const direction = riverDirectionToReceiver(width, height, sourceCell, receiverCell);
    if (riverClass === 1) {
      plannedMinorRiverMask[sourceCell] = 1;
      plannedMinorRiverTileCount++;
    } else {
      plannedMajorRiverMask[sourceCell] = 1;
      plannedMajorRiverTileCount++;
    }
    writes.push({ sourceCell, receiverCell, direction, riverClass: riverClass === 1 ? "MINOR" : "NAVIGABLE" });
  }
  return {
    model: "certified-sill-spill" as const,
    width, height,
    riverMask: Uint8Array.from(plannedMajorRiverMask),
    nativeMinorRiverMask: Uint8Array.from(plannedMinorRiverMask),
    plannedMinorRiverMask, plannedMajorRiverMask,
    plannedMinorRiverTileCount, plannedMajorRiverTileCount,
    authoredSourceCount: writes.length,
    writes,
  };
}
