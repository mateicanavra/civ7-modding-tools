import { describe, expect, it } from "bun:test";
import { artifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";

const { tectonicHistory, tectonicProvenance } = artifacts;
const SYNTHETIC_CELL_COUNT = 3;
const MINIMUM_ERA_COUNT = 5;

function u8(): Uint8Array {
  return new Uint8Array(SYNTHETIC_CELL_COUNT);
}

function i8(): Int8Array {
  return new Int8Array(SYNTHETIC_CELL_COUNT);
}

function i16(): Int16Array {
  return new Int16Array(SYNTHETIC_CELL_COUNT);
}

function u32(): Uint32Array {
  return new Uint32Array(SYNTHETIC_CELL_COUNT);
}

function validHistoryEra() {
  return {
    boundaryType: u8(),
    upliftPotential: u8(),
    collisionPotential: u8(),
    subductionPotential: u8(),
    riftPotential: u8(),
    shearStress: u8(),
    volcanism: u8(),
    fracture: u8(),
  };
}

function validTectonicHistory(eraCount = MINIMUM_ERA_COUNT) {
  return {
    eraCount,
    eras: Array.from({ length: eraCount }, validHistoryEra),
    plateIdByEra: Array.from({ length: eraCount }, i16),
    upliftTotal: u8(),
    collisionTotal: u8(),
    subductionTotal: u8(),
    fractureTotal: u8(),
    volcanismTotal: u8(),
    upliftRecentFraction: u8(),
    collisionRecentFraction: u8(),
    subductionRecentFraction: u8(),
    lastActiveEra: u8(),
    lastCollisionEra: u8(),
    lastSubductionEra: u8(),
  };
}

function validTectonicProvenance(eraCount = MINIMUM_ERA_COUNT) {
  return {
    version: 1,
    eraCount,
    cellCount: SYNTHETIC_CELL_COUNT,
    tracerIndex: Array.from({ length: eraCount }, u32),
    provenance: {
      originEra: u8(),
      originPlateId: i16(),
      lastBoundaryEra: u8(),
      lastBoundaryType: u8(),
      lastBoundaryPolarity: i8(),
      lastBoundaryIntensity: u8(),
      crustAge: u8(),
    },
  };
}

function validationMessages(
  validate: (value: unknown) => readonly { message: string }[],
  value: unknown
): string {
  return validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation tectonic-history artifacts", () => {
  it("closes history and provenance to five through eight eras", () => {
    expect(tectonicHistory.validate(validTectonicHistory())).toEqual([]);
    expect(tectonicProvenance.validate(validTectonicProvenance())).toEqual([]);

    expect(validationMessages(tectonicHistory.validate, validTectonicHistory(4))).toContain(
      "eraCount"
    );
    expect(validationMessages(tectonicProvenance.validate, validTectonicProvenance(9))).toContain(
      "eraCount"
    );
  });

  it("keeps history fields and plate membership cardinality aligned in every era", () => {
    const history = validTectonicHistory();
    expect(
      validationMessages(tectonicHistory.validate, {
        ...history,
        eras: [
          { ...history.eras[0], upliftPotential: new Uint8Array(SYNTHETIC_CELL_COUNT - 1) },
          ...history.eras.slice(1),
        ],
      })
    ).toContain("upliftPotential");

    expect(
      validationMessages(tectonicHistory.validate, {
        ...history,
        plateIdByEra: [
          i16(),
          new Int16Array(SYNTHETIC_CELL_COUNT - 1),
          ...history.plateIdByEra.slice(2),
        ],
      })
    ).toContain("plateIdByEra");
  });

  it("keeps provenance tracers and scalar constructors aligned with each era", () => {
    const provenance = validTectonicProvenance();
    expect(
      validationMessages(tectonicProvenance.validate, {
        ...provenance,
        tracerIndex: provenance.tracerIndex.slice(1),
      })
    ).toContain("tracerIndex length must match eraCount");
    expect(
      validationMessages(tectonicProvenance.validate, {
        ...provenance,
        provenance: { ...provenance.provenance, originPlateId: u8() },
      })
    ).toContain("originPlateId");
  });
});
