import { describe, expect, it } from "bun:test";
import {
  admitPositiveResourceRegionMinimum,
  resolveResourceRegionMinimumRequirement,
} from "../../../../../src/domain/resources/index.js";

describe("resource regional-minimum policy", () => {
  const minimumPerLandmass = admitPositiveResourceRegionMinimum(3);

  it("admits official minima for non-staples without an engine age-requirement observation", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_FISH",
        minimumPerLandmass,
        landmassUnique: false,
      })
    ).toEqual({ kind: "required", minimumPerLandmass, source: "official-resource" });
  });

  it("refuses landmass-unique admission until regional group assignment is supported", () => {
    for (const minimum of [0, 1, 3]) {
      expect(() =>
        resolveResourceRegionMinimumRequirement({
          resourceType: "RESOURCE_SUGAR",
          minimumPerLandmass: minimum,
          landmassUnique: true,
        })
      ).toThrow(/Cannot admit landmass-unique resource RESOURCE_SUGAR/);
    }
  });

  it("keeps a zero official minimum not applicable", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_FISH",
        minimumPerLandmass: 0,
        landmassUnique: false,
      })
    ).toEqual({ kind: "not-applicable", reason: "no-official-minimum" });
  });

  it("rejects invalid minima rather than rounding or clamping them", () => {
    for (const minimum of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        resolveResourceRegionMinimumRequirement({
          resourceType: "RESOURCE_FISH",
          minimumPerLandmass: minimum,
          landmassUnique: false,
        })
      ).toThrow(/must be a positive integer/);
    }
  });
});
