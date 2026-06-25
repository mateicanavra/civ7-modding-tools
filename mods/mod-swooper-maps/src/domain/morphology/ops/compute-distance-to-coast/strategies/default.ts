import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import ComputeDistanceToCoastContract from "../contract.js";

const UNREACHED = 65535;

export const defaultStrategy = createStrategy(ComputeDistanceToCoastContract, "default", {
  run: (input) => {
    const { width, height } = input;
    const size = Math.max(0, (width | 0) * (height | 0));
    const coastal = input.coastal as Uint8Array;
    if (coastal.length !== size) {
      throw new Error("[DistanceToCoast] coastal mask must match width*height.");
    }

    const distance = new Uint16Array(size);
    distance.fill(UNREACHED);

    // Multi-source BFS: every coastal seed starts at distance 0; the frontier
    // floods outward one hex ring at a time. Because all seeds enter the queue
    // up front and edge weights are uniform, the first time a tile is written it
    // already holds its minimum distance.
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;

    for (let i = 0; i < size; i++) {
      if ((coastal[i] | 0) !== 1) continue;
      distance[i] = 0;
      queue[tail++] = i;
    }

    while (head < tail) {
      const idx = queue[head++]!;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      const dist = distance[idx] ?? 0;

      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        const next = (dist + 1) as number;
        if (distance[ni] <= next) return;
        distance[ni] = next;
        queue[tail++] = ni;
      });
    }

    return { distanceToCoast: distance };
  },
});
