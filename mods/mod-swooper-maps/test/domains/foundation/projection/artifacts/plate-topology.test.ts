import { describe, expect, it } from "bun:test";
import { artifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";

const { plateTopology } = artifacts;

function validPlateTopology() {
  return {
    plateCount: 2,
    plates: [
      { id: 0, area: 2, centroid: { x: 1, y: 2 }, neighbors: [1] },
      { id: 1, area: 1, centroid: { x: 3, y: 4 }, neighbors: [0] },
    ],
  } as const;
}

function validationMessages(value: unknown): string {
  return plateTopology
    .validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation plate-topology artifact", () => {
  it("requires topology node ids to be unique and index-aligned", () => {
    const valid = validPlateTopology();
    expect(plateTopology.validate(valid)).toEqual([]);
    expect(
      validationMessages({
        ...valid,
        plates: [{ ...valid.plates[0], id: 1 }, valid.plates[1]],
      })
    ).toContain("id must match its index");
  });

  it("requires topology cardinality to match plateCount", () => {
    const valid = validPlateTopology();
    expect(validationMessages({ ...valid, plateCount: 3 })).toContain(
      "plates length must match plateCount"
    );
  });
});
