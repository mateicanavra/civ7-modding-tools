import { describe, expect, it } from "bun:test";

import { artifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const SYNTHETIC_CELL_COUNT = 2;
const ERA_COUNT = 5;
const VALIDATION_CONTEXT = { dimensions: TEST_MAP_SIZE.dimensions };

function validProvenance() {
  return {
    version: 1,
    eraCount: ERA_COUNT,
    cellCount: SYNTHETIC_CELL_COUNT,
    tracerIndex: Array.from({ length: ERA_COUNT }, () => new Uint32Array(SYNTHETIC_CELL_COUNT)),
    provenance: {
      originEra: new Uint8Array(SYNTHETIC_CELL_COUNT),
      originPlateId: new Int16Array(SYNTHETIC_CELL_COUNT),
      lastBoundaryEra: new Uint8Array(SYNTHETIC_CELL_COUNT),
      lastBoundaryType: new Uint8Array(SYNTHETIC_CELL_COUNT),
      lastBoundaryPolarity: new Int8Array(SYNTHETIC_CELL_COUNT),
      lastBoundaryIntensity: new Uint8Array(SYNTHETIC_CELL_COUNT),
      crustAge: new Uint8Array(SYNTHETIC_CELL_COUNT),
    },
  };
}

describe("foundation tectonic-provenance artifact", () => {
  it("keeps one tracer correspondence for every declared era", () => {
    const provenance = validProvenance();
    expect(artifacts.tectonicProvenance.validate(provenance, VALIDATION_CONTEXT)).toEqual([]);

    const messages = artifacts.tectonicProvenance
      .validate(
        {
          ...provenance,
          tracerIndex: provenance.tracerIndex.slice(1),
        },
        VALIDATION_CONTEXT
      )
      .map((issue) => issue.message);

    expect(messages).toContain("tracerIndex length must match eraCount");
  });
});
