import { createStrategy } from "@swooper/mapgen-core/authoring";
import FeaturesApplyContract from "../contract.js";

type Placement = { x: number; y: number; feature: string; weight?: number };

type TileBucket = {
  x: number;
  y: number;
  placements: Placement[];
};

export const defaultStrategy = createStrategy(FeaturesApplyContract, "default", {
  run: (input, config) => {
    // Stamping is strict in M3: no probabilistic gating and no silent drops.
    // Any collision (multiple placements for a tile) is treated as a bug and fails loudly.
    // Weight semantics are forbidden: allow only unset/1 so legacy fudging can't leak through.
    const seen = new Map<string, TileBucket>();

    const merge = (placements: Placement[]) => {
      for (const placement of placements) {
        const x = placement.x | 0;
        const y = placement.y | 0;

        if (placement.weight != null && placement.weight !== 1) {
          throw new Error(
            `features-apply rejected non-unit weight: tile=(${x},${y}) feature=${placement.feature} weight=${placement.weight} (expected 1 or unset)`
          );
        }

        const key = `${x},${y}`;
        const tile = seen.get(key) ?? { x, y, placements: [] };
        if (tile.placements.length >= config.maxPerTile) {
          throw new Error(
            `features-apply collision: tile=(${x},${y}) has >${config.maxPerTile} placements (example feature=${placement.feature})`
          );
        }

        // Normalize coords and weight so downstream consumers never see undefined/non-integer coords.
        tile.placements.push({ ...placement, x, y, weight: placement.weight ?? 1 });
        seen.set(key, tile);
      }
    };

    merge(input.ice);
    merge(input.reefs);
    merge(input.wetlands);
    merge(input.vegetation);

    // Deterministic application order: y-major, then x, preserving merge order within a tile.
    const merged: Placement[] = [];
    const tiles = [...seen.values()].sort((a, b) => a.y - b.y || a.x - b.x);
    for (const tile of tiles) merged.push(...tile.placements);

    return { placements: merged };
  },
});
