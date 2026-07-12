import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import morphologyDomain from "@mapgen/domain/morphology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../src/recipes/standard/runtime.js";
import { artifacts as morphologyArtifacts } from "../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { runOpValidated } from "../../support/compiler-helpers.js";
import { standardConfig } from "../../support/standard-config.js";

describe("morphology/compute-shelf-mask margin depth", () => {
  it("uses a shallower shelf break at active margins than passive margins", () => {
    const width = 64;
    const height = 40;
    const seed = 12345;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -70,
      MaxLatitude: 70,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

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
    const result = runOpValidated(
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
