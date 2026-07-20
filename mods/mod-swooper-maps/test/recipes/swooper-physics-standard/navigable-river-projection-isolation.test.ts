import { describe, expect, it } from "bun:test";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring/contracts";

import { artifactModules as hydrographyArtifactModules } from "../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifactModules as mapRiversArtifactModules } from "../../../src/recipes/standard/stages/map-rivers/artifacts/index.js";
import {
  createStandardRecipeTestConfig,
  runStandardRecipeTestMap,
} from "./fixtures/standard-recipe.js";

function runRiverProjection(input: {
  riverDensity: "sparse" | "normal" | "dense";
  navigableRiverDensity: "sparse" | "normal" | "dense";
}) {
  const recipeConfig = createStandardRecipeTestConfig();
  recipeConfig["hydrology-hydrography"].knobs.riverDensity = input.riverDensity;
  recipeConfig["map-rivers"].knobs.navigableRiverDensity = input.navigableRiverDensity;
  const { context } = runStandardRecipeTestMap({ seed: 123, recipeConfig });

  return {
    hydrography: readValidatedArtifact(context, hydrographyArtifactModules.hydrography),
    projected: readValidatedArtifact(context, mapRiversArtifactModules.projectedNavigableRivers),
    readback: readValidatedArtifact(context, mapRiversArtifactModules.engineProjectionRivers),
  };
}

describe("navigable river projection isolation", () => {
  it("keeps physical river density and Civ-visible selection as independent controls", () => {
    const matrix = {
      sparse: {
        sparse: runRiverProjection({
          riverDensity: "sparse",
          navigableRiverDensity: "sparse",
        }),
        dense: runRiverProjection({
          riverDensity: "sparse",
          navigableRiverDensity: "dense",
        }),
      },
      dense: {
        sparse: runRiverProjection({
          riverDensity: "dense",
          navigableRiverDensity: "sparse",
        }),
        dense: runRiverProjection({
          riverDensity: "dense",
          navigableRiverDensity: "dense",
        }),
      },
    } as const;

    for (const physicalDensity of ["sparse", "dense"] as const) {
      const sparseVisible = matrix[physicalDensity].sparse;
      const denseVisible = matrix[physicalDensity].dense;
      expect(sparseVisible.hydrography).toEqual(denseVisible.hydrography);
      expect(sparseVisible.projected.riverMask).not.toEqual(denseVisible.projected.riverMask);
      expect(sparseVisible.projected.selectedTileCount).toBeLessThan(
        denseVisible.projected.selectedTileCount
      );
    }

    for (const visibleDensity of ["sparse", "dense"] as const) {
      const sparsePhysical = matrix.sparse[visibleDensity];
      const densePhysical = matrix.dense[visibleDensity];
      expect(sparsePhysical.hydrography.riverClass).not.toEqual(
        densePhysical.hydrography.riverClass
      );
      expect(sparsePhysical.projected.targetMajorTileFraction).toBe(
        densePhysical.projected.targetMajorTileFraction
      );
    }

    for (const physicalDensity of ["sparse", "dense"] as const) {
      for (const visibleDensity of ["sparse", "dense"] as const) {
        const result = matrix[physicalDensity][visibleDensity];
        expect(result.readback.riverMask).toEqual(result.projected.riverMask);
      }
    }
  }, 30_000);
});
