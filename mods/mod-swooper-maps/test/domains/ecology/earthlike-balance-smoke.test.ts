import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../src/recipes/standard/runtime.js";
import { artifacts as ecologyArtifacts } from "../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { standardConfig } from "../../support/standard-config.js";

describe("Earthlike ecology balance (smoke)", () => {
  it(
    "has land and biome variety",
    () => {
      const width = 32;
      const height = 20;
      const seed = 1018;

      const mapInfo = {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -80,
        MaxLatitude: 80,
        PlayersLandmass1: 4,
        PlayersLandmass2: 4,
        StartSectorRows: 4,
        StartSectorCols: 4,
      };

      const setup = admitMapSetup({
        mapSeed: seed,
        dimensions: { width, height },
        latitudeBounds: {
          topLatitude: mapInfo.MaxLatitude,
          bottomLatitude: mapInfo.MinLatitude,
        },
      });

      const adapter = createMockAdapter({
        width,
        height,
        mapInfo,
        mapSizeId: 1,
        rng: createLabelRng(seed),
      });

      const context = createMapContext({ setup, adapter });
      initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });

      standardRecipe.run(context, standardConfig, { log: () => {} });

      const classification = context.artifacts.get(ecologyArtifacts.biomeClassification.id);
      if (
        !classification ||
        typeof classification !== "object" ||
        !("biomeIndex" in classification) ||
        !(classification.biomeIndex instanceof Uint8Array)
      ) {
        throw new Error("Missing biomeIndex.");
      }
      const biomeIndex = classification.biomeIndex;

      let landCount = 0;
      const landBiomes = new Set<number>();

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (adapter.isWater(x, y)) continue;
          landCount++;
          const idx = y * width + x;
          const biome = biomeIndex[idx] ?? 255;
          landBiomes.add(biome);
        }
      }

      expect(landCount).toBeGreaterThan(0);
      expect(landBiomes.size).toBeGreaterThanOrEqual(2);
    },
    { timeout: 15_000 }
  );
});
