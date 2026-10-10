import { describe, expect, it } from "bun:test";
import { buildClimateRefineVizProjections } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/viz.js";

describe("climate-refine index projections", () => {
  it("projects separately published atmospheric and plant indices without deriving local water again", () => {
    const width = 2;
    const height = 1;
    const dimensions = { width, height };
    const climateIndices = {
      surfaceTemperatureC: new Float32Array([10, 20]),
      pet: new Float32Array([50, 60]),
      effectiveMoisture: new Float32Array([20, 30]),
      aridityIndex: new Float32Array([0.7, 0.8]),
      plantEffectiveMoisture: new Float32Array([120, 230]),
      plantWaterStress: new Float32Array([0.1, 0.2]),
      freezeIndex: new Float32Array([0, 0.3]),
    };
    const before = structuredClone(climateIndices);
    const projections = buildClimateRefineVizProjections({
      climateField: { rainfall: new Uint8Array([10, 20]), humidity: new Uint8Array([30, 40]) },
      climateIndices,
      cryosphere: {
        snowCover: new Uint8Array(2), seaIceCover: new Uint8Array(2), albedo: new Uint8Array(2),
        groundIce01: new Float32Array(2), permafrost01: new Float32Array(2), meltPotential01: new Float32Array(2),
      },
      diagnostics: {
        rainShadowIndex: new Float32Array(2), continentalityIndex: new Float32Array(2), convergenceIndex: new Float32Array(2),
      },
    }, dimensions);
    for (const key of ["effectiveMoisture", "aridityIndex", "plantEffectiveMoisture", "plantWaterStress"] as const) {
      const grids = projections.filter((projection) =>
        projection.kind === "grid" && projection.dataTypeKey === `hydrology.climate.indices.${key}`);
      expect(grids).toHaveLength(1);
      const grid = grids[0]!;
      if (grid.kind !== "grid") throw new Error("Expected scalar index grid.");
      expect(grid.field.format).toBe("f32");
      expect(grid.field.values).toBe(climateIndices[key]);
      expect(grid.dims).toEqual(dimensions);
      expect(grid.spaceId).toBe("tile.hexOddQ");
      expect(grid.meta?.group).toBe("Hydrology / Climate Indices");
      expect(grid.meta?.visibility).toBe("debug");
    }
    expect(climateIndices).toEqual(before);
  });
});
