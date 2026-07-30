import { describe, expect, it } from "bun:test";
import morphology from "../../../../../../src/domain/morphology/router.js";

const { computeSubstrate } = morphology.terrain.ops;

describe("compute-substrate material response", () => {
  it("changes erodibilityK when crust/material differs (uplift/rift held constant)", () => {
    const syntheticDimensions = { width: 2, height: 1 } as const;
    const { width, height } = syntheticDimensions;

    const upliftPotential = new Uint8Array([128, 128]);
    const riftPotential = new Uint8Array([0, 0]);
    const boundaryCloseness = new Uint8Array([0, 0]);
    const boundaryType = new Uint8Array([0, 0]);
    const crustType = new Uint8Array([1, 0]);
    const crustAge = new Uint8Array([0, 0]);

    const result = computeSubstrate.run(
      {
        width,
        height,
        upliftPotential,
        riftPotential,
        boundaryCloseness,
        boundaryType,
        crustType,
        crustAge,
      },
      computeSubstrate.defaultConfig
    );

    expect(result.erodibilityK[0]).not.toBe(result.erodibilityK[1]);
  });
});
