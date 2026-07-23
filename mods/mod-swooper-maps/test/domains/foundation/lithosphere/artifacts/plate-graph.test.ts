import { describe, expect, it } from "bun:test";
import { artifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";

const { plateGraph } = artifacts;

function validPlateGraph() {
  return {
    cellToPlate: new Int16Array([0, 1, 0]),
    plates: [
      { id: 0, role: "tectonic", kind: "major", seedX: 1, seedY: 2 },
      { id: 1, role: "polarCap", kind: "minor", seedX: 3, seedY: 4 },
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

describe("foundation plate-graph artifact", () => {
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
});
