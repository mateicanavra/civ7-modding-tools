import { describe, expect, it } from "bun:test";
import { artifactModules as foundationArtifactModules } from "@mapgen/domain/foundation/artifacts";

const { mantlePotential } = foundationArtifactModules;
const SYNTHETIC_CELL_COUNT = 3;
const SYNTHETIC_SOURCE_COUNT = 2;

function validMantlePotential() {
  return {
    version: 1,
    cellCount: SYNTHETIC_CELL_COUNT,
    potential: new Float32Array(SYNTHETIC_CELL_COUNT),
    sourceCount: SYNTHETIC_SOURCE_COUNT,
    sourceType: new Int8Array(SYNTHETIC_SOURCE_COUNT),
    sourceCell: new Uint32Array(SYNTHETIC_SOURCE_COUNT),
    sourceAmplitude: new Float32Array(SYNTHETIC_SOURCE_COUNT),
    sourceRadius: new Float32Array(SYNTHETIC_SOURCE_COUNT),
  };
}

function validationMessages(value: unknown): string {
  return mantlePotential
    .validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation mantle-potential artifact", () => {
  it("closes sourceCount over every parallel source array", () => {
    const valid = validMantlePotential();
    expect(mantlePotential.validate(valid)).toEqual([]);

    for (const [field, value] of [
      ["sourceType", new Int8Array(1)],
      ["sourceCell", new Uint32Array(1)],
      ["sourceAmplitude", new Float32Array(1)],
      ["sourceRadius", new Float32Array(1)],
    ] as const) {
      expect(validationMessages({ ...valid, [field]: value })).toContain(field);
    }

    expect(validationMessages({ ...valid, sourceCount: -1 })).toContain("sourceCount");
  });
});
