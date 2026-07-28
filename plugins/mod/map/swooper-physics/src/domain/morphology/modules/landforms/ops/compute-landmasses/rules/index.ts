/**
 * Computes seam-aware bounds for columns marked as used.
 */
export function computeCircularBounds(columnsUsed: Uint8Array): { west: number; east: number } {
  const width = columnsUsed.length;

  let usedCount = 0;
  for (let x = 0; x < width; x++) usedCount += (columnsUsed[x] | 0) === 1 ? 1 : 0;
  if (usedCount === 0) return { west: 0, east: 0 };
  if (usedCount === width) return { west: 0, east: width - 1 };

  let bestGapStart = -1;
  let bestGapLen = -1;
  let currentStart = -1;
  let currentLen = 0;

  for (let i = 0; i < width * 2; i++) {
    const x = i % width;
    const used = (columnsUsed[x] | 0) === 1;

    if (!used) {
      if (currentStart === -1) currentStart = i;
      currentLen++;
    } else if (currentStart !== -1) {
      const cappedLen = Math.min(currentLen, width);
      if (cappedLen > bestGapLen) {
        bestGapLen = cappedLen;
        bestGapStart = currentStart;
      }
      currentStart = -1;
      currentLen = 0;
    }
  }

  if (currentStart !== -1) {
    const cappedLen = Math.min(currentLen, width);
    if (cappedLen > bestGapLen) {
      bestGapLen = cappedLen;
      bestGapStart = currentStart;
    }
  }

  if (bestGapStart === -1) {
    return { west: 0, east: width - 1 };
  }

  const gapEnd = bestGapStart + bestGapLen - 1;
  const west = (gapEnd + 1) % width;
  const east = (bestGapStart - 1 + width) % width;
  return { west, east };
}
