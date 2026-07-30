import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation/router";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";

const { computePlateTopology } = foundation.projection.ops;

describe("compute-plate-topology wrapped adjacency", () => {
  it("refuses a raster without an admitted plate before deriving topology", () => {
    const syntheticDimensions = { width: 6, height: 2 } as const;

    let refusal: unknown;
    try {
      computePlateTopology.run(
        { ...syntheticDimensions, plateIds: new Int16Array(12).fill(-1) },
        computePlateTopology.defaultConfig
      );
    } catch (error) {
      refusal = error;
    }

    expect(refusal).toBeInstanceOf(OperationInputAdmissionError);
    expect(refusal).toMatchObject({
      issues: [
        expect.objectContaining({
          keyword: "~refine",
          message: "Plate topology requires at least one nonnegative plate id.",
        }),
      ],
    });
  });

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
