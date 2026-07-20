import { describe, expect, it } from "bun:test";
import { artifactModules as foundationArtifactModules } from "@mapgen/domain/foundation/artifacts";

const { plateGraph, plateTopology } = foundationArtifactModules;

function validPlateGraph() {
  return {
    cellToPlate: new Int16Array([0, 1, 0]),
    plates: [
      { id: 0, role: "tectonic", kind: "major", seedX: 1, seedY: 2 },
      { id: 1, role: "polarCap", kind: "minor", seedX: 3, seedY: 4 },
    ],
  } as const;
}

function validPlateTopology() {
  return {
    plateCount: 2,
    plates: [
      { id: 0, area: 2, centroid: { x: 1, y: 2 }, neighbors: [1] },
      { id: 1, area: 1, centroid: { x: 3, y: 4 }, neighbors: [0] },
    ],
  } as const;
}

function validationMessages(
  validate: (value: unknown) => readonly { message: string }[],
  value: unknown
): string {
  return validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation plate identity artifacts", () => {
  it("admits only the closed plate-role vocabulary", () => {
    const valid = validPlateGraph();
    expect(plateGraph.validate(valid)).toEqual([]);
    expect(
      validationMessages(plateGraph.validate, {
        ...valid,
        plates: [{ ...valid.plates[0], role: "other" }, valid.plates[1]],
      })
    ).toContain("role");
  });

  it("requires topology node ids to be unique and index-aligned", () => {
    const valid = validPlateTopology();
    expect(plateTopology.validate(valid)).toEqual([]);
    expect(
      validationMessages(plateTopology.validate, {
        ...valid,
        plates: [{ ...valid.plates[0], id: 1 }, valid.plates[1]],
      })
    ).toContain("id must match its index");
  });

  it("requires plate topology cardinality to match plateCount", () => {
    const valid = validPlateTopology();
    expect(
      validationMessages(plateTopology.validate, {
        ...valid,
        plateCount: 3,
      })
    ).toContain("plates length must match plateCount");
  });
});
