import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { BIOME_SYMBOL_ORDER } from "@mapgen/domain/ecology";
import type { BiomeClassificationArtifact } from "../../artifacts.js";
import BiomeEdgeRefineStepContract from "./contract.js";

const GROUP_BIOMES = "Ecology / Biomes";
const TILE_SPACE_ID = "tile.hexOddR" as const;
const BIOME_COLORS: Array<[number, number, number, number]> = [
  [240, 248, 255, 230],
  [196, 204, 214, 230],
  [34, 139, 34, 230],
  [189, 183, 107, 230],
  [50, 205, 50, 230],
  [34, 197, 94, 230],
  [16, 120, 70, 230],
  [237, 201, 175, 230],
];

function labelBiome(symbol: string): string {
  return symbol
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export default createStep(BiomeEdgeRefineStepContract, {
  run: (context, config, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read(context);

    const { width, height } = context.dimensions;
    const topography = deps.artifacts.topography.read(context);

    const refined = ops.refine(
      {
        width,
        height,
        biomeIndex: classification.biomeIndex,
        landMask: topography.landMask,
      },
      config.refine
    );

    // Publish-once mutable handle posture:
    // - `biomes` publishes `artifact:ecology.biomeClassification` once.
    // - `biome-edge-refine` refines the *same* artifact buffers in-place by mutating `biomeIndex`.
    // Downstream consumers must treat this artifact as ordering-sensitive, not as an immutable snapshot.
    //
    // Guardrail: mods/mod-swooper-maps/test/ecology/biome-edge-refine-mutability.test.ts
    const mutable = classification as BiomeClassificationArtifact;
    mutable.biomeIndex.set(refined.biomeIndex);

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.biomeIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: mutable.biomeIndex,
      meta: defineVizMeta("ecology.biome.biomeIndex", {
        label: "Biome Index",
        group: GROUP_BIOMES,
        categories: BIOME_SYMBOL_ORDER.map((symbol, index) => ({
          value: index,
          label: labelBiome(symbol),
          color: BIOME_COLORS[index] ?? [148, 163, 184, 220],
        })),
      }),
    });
  },
});
