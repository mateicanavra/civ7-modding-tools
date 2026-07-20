import { describe, expect, it } from "bun:test";
import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { artifacts as morphologyArtifacts } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { runStandardRecipeTestMap } from "../../../recipes/swooper-physics-standard/fixtures/standard-recipe.js";

describe("morphology/compute-shelf-mask margin depth", () => {
  it("uses a shallower shelf break at active margins than passive margins", () => {
    const seed = 12345;
    const { context, preset } = runStandardRecipeTestMap({
      presetId: "MAPSIZE_TINY",
      seed,
    });
    const { width, height } = preset.dimensions;

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
      | { landMask?: Uint8Array; bathymetry?: Int16Array }
      | undefined;
    if (!(topography?.landMask instanceof Uint8Array)) {
      throw new Error("Missing topography.landMask.");
    }
    if (!(topography.bathymetry instanceof Int16Array)) {
      throw new Error("Missing topography.bathymetry.");
    }
    const shelf = context.artifacts.get(morphologyArtifacts.shelf.id) as
      | { distanceToCoast?: Uint16Array }
      | undefined;
    if (!(shelf?.distanceToCoast instanceof Uint16Array)) {
      throw new Error("Missing shelf.distanceToCoast.");
    }
    const beltDrivers = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as
      | { boundaryCloseness?: Uint8Array; boundaryType?: Uint8Array }
      | undefined;
    if (!(beltDrivers?.boundaryCloseness instanceof Uint8Array)) {
      throw new Error("Missing beltDrivers.boundaryCloseness.");
    }
    if (!(beltDrivers.boundaryType instanceof Uint8Array)) {
      throw new Error("Missing beltDrivers.boundaryType.");
    }

    const { computeShelfMask } = morphologyDomain.ops;
    const result = runAdmittedOperationForTest(
      computeShelfMask,
      {
        width,
        height,
        landMask: topography.landMask,
        bathymetry: topography.bathymetry,
        distanceToCoast: shelf.distanceToCoast,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      structuredClone(computeShelfMask.defaultConfig)
    );

    let activeBreakSum = 0;
    let activeBreakCount = 0;
    let passiveBreakSum = 0;
    let passiveBreakCount = 0;
    for (let i = 0; i < width * height; i++) {
      if ((topography.landMask[i] | 0) === 1) continue;
      const breakDepth = result.shelfBreakDepthByTile[i] | 0;
      if ((result.activeMarginMask[i] | 0) === 1) {
        activeBreakSum += breakDepth;
        activeBreakCount += 1;
      } else {
        passiveBreakSum += breakDepth;
        passiveBreakCount += 1;
      }
    }

    expect(activeBreakCount).toBeGreaterThan(0);
    expect(passiveBreakCount).toBeGreaterThan(0);
    expect(activeBreakSum / activeBreakCount).toBeGreaterThan(passiveBreakSum / passiveBreakCount);
  });
});
