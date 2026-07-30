import { describe, expect, it } from "bun:test";
import { deriveFeatureOccupancy } from "../../../../../../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
import { TEST_MAP_SIZE } from "../../../../../../../setup.js";

describe("Ecology feature intent occupancy", () => {
  it("derives the occupied tiles from every admitted upstream intent family", () => {
    const dimensions = TEST_MAP_SIZE.dimensions;
    const first = { x: 1, y: 1 };
    const second = { x: dimensions.width - 2, y: dimensions.height - 2 };

    const occupancy = deriveFeatureOccupancy(dimensions, [first], [second]);

    expect(occupancy[first.y * dimensions.width + first.x]).toBe(1);
    expect(occupancy[second.y * dimensions.width + second.x]).toBe(1);
    expect(occupancy.reduce((count, occupied) => count + occupied, 0)).toBe(2);
  });

  it("refuses two admitted intent families that claim the same tile", () => {
    const dimensions = TEST_MAP_SIZE.dimensions;
    const duplicate = { x: 1, y: 1 };

    expect(() => deriveFeatureOccupancy(dimensions, [duplicate], [duplicate])).toThrow(
      "multiple admitted intents"
    );
  });
});
