/** Converts one physical adjacent receiver into the adapter's geographic symbols. */
export function riverDirectionToReceiver(
  width: number,
  height: number,
  sourceCell: number,
  receiverCell: number
) {
  const size = width * height;
  if (
    !Number.isInteger(sourceCell) ||
    !Number.isInteger(receiverCell) ||
    sourceCell < 0 ||
    receiverCell < 0 ||
    sourceCell >= size ||
    receiverCell >= size ||
    sourceCell === receiverCell
  ) {
    throw new Error(`Invalid authored river edge ${sourceCell}->${receiverCell}.`);
  }
  const x = sourceCell % width;
  const y = Math.floor(sourceCell / width);
  const parity = y % 2;
  // Civ7's north is increasing Y. Grid helper iteration positions are not native directions.
  const neighbors = [
    ["EAST", 1, 0],
    ["NORTHEAST", parity, 1],
    ["NORTHWEST", parity - 1, 1],
    ["WEST", -1, 0],
    ["SOUTHWEST", parity - 1, -1],
    ["SOUTHEAST", parity, -1],
  ] as const;
  for (const [direction, dx, dy] of neighbors) {
    const nextY = y + dy;
    if (nextY < 0 || nextY >= height) continue;
    const nextX = (x + dx + width) % width;
    if (nextY * width + nextX === receiverCell) return direction;
  }
  throw new Error(`Nonadjacent authored river edge ${sourceCell}->${receiverCell}.`);
}
