import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import ComputeCoastalAdjacencyContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeCoastalAdjacencyContract, "default", {
  run: (input) => {
    const { width, height } = input;
    const size = width * height;
    const landMask = input.landMask as Uint8Array;

    const coastalLand = new Uint8Array(size);
    const coastalWater = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const isLand = landMask[i] === 1;
        let hasOpposite = false;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          if (hasOpposite) return;
          const ni = ny * width + nx;
          if ((landMask[ni] === 1) !== isLand) hasOpposite = true;
        });
        if (!hasOpposite) continue;
        if (isLand) coastalLand[i] = 1;
        else coastalWater[i] = 1;
      }
    }

    return { coastalLand, coastalWater };
  },
});
