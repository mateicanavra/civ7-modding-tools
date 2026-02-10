import { createStrategy } from "@swooper/mapgen-core/authoring";
import FeaturesApplyContract from "../contract.js";
type Placement = { x: number; y: number; feature: string; weight?: number };

export const defaultStrategy = createStrategy(FeaturesApplyContract, "default", {
  run: (input, config) => {
    // Stamping is strict in M3: no probabilistic gating and no silent drops.
    // Any collision (multiple placements for a tile) is treated as a bug and fails loudly.
    const seen = new Map<number, Placement[]>();
    const merge = (placements: Placement[]) => {
      for (const placement of placements) {
        const x = placement.x | 0;
        const y = placement.y | 0;
        const key = y * 65536 + x;
        const list = seen.get(key) ?? [];
        if (list.length >= config.maxPerTile) {
          throw new Error(
            `features-apply collision: tile=(${x},${y}) has >${config.maxPerTile} placements (example feature=${placement.feature})`
          );
        }
        list.push({ ...placement, x, y });
        seen.set(key, list);
      }
    };
    merge(input.ice);
    merge(input.reefs);
    merge(input.wetlands);
    merge(input.vegetation);

    // Deterministic application order: sort by tile key (y-major, then x), preserving merge order within a tile.
    const keys = [...seen.keys()].sort((a, b) => a - b);
    const merged: Placement[] = [];
    for (const key of keys) {
      const values = seen.get(key);
      if (values) merged.push(...values);
    }

    return { placements: merged };
  },
});
