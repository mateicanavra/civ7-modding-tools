import { describe, expect, it } from "bun:test";
import {
  assertFeatureIntentCandidatesAvailable,
  deriveFeatureOccupancy,
} from "../../../../../../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
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

  it("checks only prior-family collisions without mutating or re-admitting candidates", () => {
    const dimensions = TEST_MAP_SIZE.dimensions;
    const prior = { x: 1, y: 1 };
    const occupancy = deriveFeatureOccupancy(dimensions, [prior]);
    const occupancyBefore = occupancy.slice();
    const candidates = [
      { x: 2, y: 2 },
      { x: 2, y: 2 },
      { x: -1, y: 0 },
    ] as const;

    expect(() =>
      assertFeatureIntentCandidatesAvailable(dimensions, occupancy, candidates)
    ).not.toThrow();
    expect(occupancy).toEqual(occupancyBefore);
    expect(candidates).toEqual([
      { x: 2, y: 2 },
      { x: 2, y: 2 },
      { x: -1, y: 0 },
    ]);
    expect(() => assertFeatureIntentCandidatesAvailable(dimensions, occupancy, [prior])).toThrow(
      "occupied tile"
    );
    expect(occupancy).toEqual(occupancyBefore);
  });
});
