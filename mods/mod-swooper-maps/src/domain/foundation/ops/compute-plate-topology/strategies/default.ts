import { createStrategy } from "@swooper/mapgen-core/authoring";
import { buildPlateTopology } from "@swooper/mapgen-core/lib/plates";

import ComputePlateTopologyContract from "../contract.js";

/**
 * Undirected-adjacency invariant: if A lists B as a neighbor, B must list A.
 * A break indicates a topology-build bug, not authored data, so it throws.
 */
function validateTopologySymmetry(
  plates: ReadonlyArray<{ id: number; neighbors: number[] }>
): void {
  const neighborSets = new Map<number, Set<number>>();
  for (const p of plates) neighborSets.set(p.id, new Set(p.neighbors));

  for (const p of plates) {
    const s = neighborSets.get(p.id);
    if (!s) continue;
    for (const n of s) {
      const back = neighborSets.get(n);
      if (!back || !back.has(p.id)) {
        throw new Error("[Foundation] Invalid foundation plateTopology neighbor symmetry.");
      }
    }
  }
}

export const defaultStrategy = createStrategy(ComputePlateTopologyContract, "default", {
  run: (input) => {
    const { plateIds, width, height } = input;

    // Plate budget = highest plate id present + 1 (ids are dense 0..N-1).
    let maxId = -1;
    for (let i = 0; i < plateIds.length; i++) {
      const v = plateIds[i] | 0;
      if (v > maxId) maxId = v;
    }
    const plateCount = Math.max(0, maxId + 1);
    if (plateCount <= 0) {
      throw new Error("[Foundation] compute-plate-topology requires at least one plate.");
    }

    const plates = buildPlateTopology(plateIds, width, height, plateCount);
    validateTopologySymmetry(plates);

    return { plateTopology: { plateCount, plates } } as const;
  },
});
