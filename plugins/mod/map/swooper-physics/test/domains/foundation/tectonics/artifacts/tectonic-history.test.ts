import { describe, expect, it } from "bun:test";

import { artifacts } from "../../../../../src/domain/foundation/modules/tectonics/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const SYNTHETIC_CELL_COUNT = 2;
const ERA_COUNT = 5;
const VALIDATION_CONTEXT = { dimensions: TEST_MAP_SIZE.dimensions };

function historyEra() {
  return {
    boundaryType: new Uint8Array(SYNTHETIC_CELL_COUNT),
    upliftPotential: new Uint8Array(SYNTHETIC_CELL_COUNT),
    collisionPotential: new Uint8Array(SYNTHETIC_CELL_COUNT),
    subductionPotential: new Uint8Array(SYNTHETIC_CELL_COUNT),
    riftPotential: new Uint8Array(SYNTHETIC_CELL_COUNT),
    shearStress: new Uint8Array(SYNTHETIC_CELL_COUNT),
    volcanism: new Uint8Array(SYNTHETIC_CELL_COUNT),
    fracture: new Uint8Array(SYNTHETIC_CELL_COUNT),
  };
}

function validHistory() {
  return {
    eraCount: ERA_COUNT,
    eras: Array.from({ length: ERA_COUNT }, historyEra),
    plateIdByEra: Array.from({ length: ERA_COUNT }, () => new Int16Array(SYNTHETIC_CELL_COUNT)),
    upliftTotal: new Uint8Array(SYNTHETIC_CELL_COUNT),
    collisionTotal: new Uint8Array(SYNTHETIC_CELL_COUNT),
    subductionTotal: new Uint8Array(SYNTHETIC_CELL_COUNT),
    fractureTotal: new Uint8Array(SYNTHETIC_CELL_COUNT),
    volcanismTotal: new Uint8Array(SYNTHETIC_CELL_COUNT),
    upliftRecentFraction: new Uint8Array(SYNTHETIC_CELL_COUNT),
    collisionRecentFraction: new Uint8Array(SYNTHETIC_CELL_COUNT),
    subductionRecentFraction: new Uint8Array(SYNTHETIC_CELL_COUNT),
    lastActiveEra: new Uint8Array(SYNTHETIC_CELL_COUNT),
    lastCollisionEra: new Uint8Array(SYNTHETIC_CELL_COUNT),
    lastSubductionEra: new Uint8Array(SYNTHETIC_CELL_COUNT),
  };
}

function validationMessages(value: unknown): string {
  return artifacts.tectonicHistory
    .validate(value, VALIDATION_CONTEXT)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation tectonic-history artifact", () => {
  it("keeps era fields and plate membership aligned to the declared history", () => {
    const history = validHistory();
    expect(artifacts.tectonicHistory.validate(history, VALIDATION_CONTEXT)).toEqual([]);

    expect(
      validationMessages({
        ...history,
        eras: history.eras.slice(1),
      })
    ).toContain("eras length must match eraCount");
    expect(
      validationMessages({
        ...history,
        plateIdByEra: history.plateIdByEra.slice(1),
      })
    ).toContain("plateIdByEra length must match eraCount");
  });
});
