import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation/router";

const { computePlateTopology } = foundation.projection.ops;

describe("compute-plate-topology wrapped adjacency", () => {
  it("counts plate area and joins plates across the horizontal seam", () => {
    const syntheticDimensions = { width: 6, height: 2 } as const;
    const plateIds = new Int16Array([0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2]);

    const { plateTopology } = computePlateTopology.run(
      { ...syntheticDimensions, plateIds },
      computePlateTopology.defaultConfig
    );

    expect(plateTopology.plateCount).toBe(3);
    expect(
      plateTopology.plates.map(({ id, area, neighbors }) => ({ id, area, neighbors }))
    ).toEqual([
      { id: 0, area: 4, neighbors: [1, 2] },
      { id: 1, area: 4, neighbors: [0, 2] },
      { id: 2, area: 4, neighbors: [0, 1] },
    ]);
  });
});
