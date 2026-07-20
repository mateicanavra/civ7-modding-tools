import { describe, expect, it } from "bun:test";
import { artifactModules as foundationArtifactModules } from "@mapgen/domain/foundation/artifacts";

const { tectonicEvents } = foundationArtifactModules;

function validEvent() {
  return {
    eventType: 1,
    plateA: 0,
    plateB: 1,
    polarity: -1,
    intensityUplift: 10,
    intensityRift: 20,
    intensityShear: 30,
    intensityVolcanism: 40,
    intensityFracture: 50,
    driftU: -3,
    driftV: 4,
    seedCells: [0, 1],
    originPlateId: 0,
  };
}

function validationMessages(value: unknown): string {
  return tectonicEvents
    .validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation tectonic-event artifact", () => {
  it("keeps event drift inside the signed byte evidence range", () => {
    const valid = validEvent();
    expect(tectonicEvents.validate([valid])).toEqual([]);
    expect(validationMessages([{ ...valid, driftU: -128 }])).toContain("driftU");
    expect(validationMessages([{ ...valid, driftV: 128 }])).toContain("driftV");
  });

  it("admits only nonnegative event seed cells", () => {
    const valid = validEvent();
    expect(validationMessages([{ ...valid, seedCells: [-1] }])).toContain("seedCells");
  });
});
