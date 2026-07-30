import { describe, expect, it } from "bun:test";

import { EVENT_TYPE } from "../../../../../../src/domain/foundation/modules/tectonics/model/atoms/index.js";
import foundation from "../../../../../../src/domain/foundation/router.js";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { computeTectonicProvenance } = foundation.tectonics.ops;
const SYNTHETIC_CELL_COUNT = 2;
const ERA_COUNT = 5;

type CellValues = readonly [number, number];

function provenanceEra(values?: {
  boundaryType?: CellValues;
  boundaryPolarity?: CellValues;
  boundaryIntensity?: CellValues;
  riftPotential?: CellValues;
  volcanism?: CellValues;
  riftOriginPlate?: CellValues;
  volcanismOriginPlate?: CellValues;
  volcanismEventType?: CellValues;
}) {
  return {
    boundaryType: new Uint8Array(values?.boundaryType ?? [0, 0]),
    boundaryPolarity: new Int8Array(values?.boundaryPolarity ?? [0, 0]),
    boundaryIntensity: new Uint8Array(values?.boundaryIntensity ?? [0, 0]),
    riftPotential: new Uint8Array(values?.riftPotential ?? [0, 0]),
    volcanism: new Uint8Array(values?.volcanism ?? [0, 0]),
    riftOriginPlate: new Int16Array(values?.riftOriginPlate ?? [-1, -1]),
    volcanismOriginPlate: new Int16Array(values?.volcanismOriginPlate ?? [-1, -1]),
    volcanismEventType: new Uint8Array(values?.volcanismEventType ?? [0, 0]),
  };
}

function identityTraces() {
  return Array.from({ length: ERA_COUNT }, () => new Uint32Array([0, 1]));
}

function computeLineage(eras: ReturnType<typeof provenanceEra>[], tracerIndex = identityTraces()) {
  return computeTectonicProvenance.run(
    {
      mesh: { cellCount: SYNTHETIC_CELL_COUNT },
      plateGraph: { cellToPlate: new Int16Array([10, 11]) },
      eras,
      tracerIndex,
      eraCount: ERA_COUNT,
    },
    computeTectonicProvenance.defaultConfig
  ).tectonicProvenance.provenance;
}

describe("foundation/compute-tectonic-provenance", () => {
  it("resets lineage only for rifts that reach the era-relative threshold", () => {
    const eras = Array.from({ length: ERA_COUNT }, () => provenanceEra());
    eras[2] = provenanceEra({
      boundaryType: [BOUNDARY_TYPE.divergent, BOUNDARY_TYPE.divergent],
      boundaryIntensity: [50, 100],
      riftPotential: [50, 100],
      riftOriginPlate: [20, 21],
    });

    const provenance = computeLineage(eras);

    expect(Array.from(provenance.originEra)).toEqual([0, 2]);
    expect(Array.from(provenance.originPlateId)).toEqual([10, 21]);
    expect(Array.from(provenance.crustAge)).toEqual([255, 128]);
    expect(Array.from(provenance.lastBoundaryEra)).toEqual([2, 2]);
    expect(Array.from(provenance.lastBoundaryType)).toEqual([
      BOUNDARY_TYPE.divergent,
      BOUNDARY_TYPE.divergent,
    ]);
  });

  it("records convergent polarity and resets lineage at a strong subduction arc", () => {
    const eras = Array.from({ length: ERA_COUNT }, () => provenanceEra());
    eras[3] = provenanceEra({
      boundaryType: [BOUNDARY_TYPE.convergent, BOUNDARY_TYPE.none],
      boundaryPolarity: [-1, 0],
      boundaryIntensity: [150, 0],
      volcanism: [100, 0],
      volcanismOriginPlate: [7, -1],
      volcanismEventType: [EVENT_TYPE.convergenceSubduction, 0],
    });

    const provenance = computeLineage(eras);

    expect(Array.from(provenance.originEra)).toEqual([3, 0]);
    expect(Array.from(provenance.originPlateId)).toEqual([7, 11]);
    expect(Array.from(provenance.crustAge)).toEqual([64, 255]);
    expect(Array.from(provenance.lastBoundaryEra)).toEqual([3, 255]);
    expect(Array.from(provenance.lastBoundaryPolarity)).toEqual([-1, 0]);
    expect(Array.from(provenance.lastBoundaryIntensity)).toEqual([150, 0]);
  });

  it("advects established origin lineage through tracer correspondence", () => {
    const eras = Array.from({ length: ERA_COUNT }, () => provenanceEra());
    eras[0] = provenanceEra({
      volcanism: [100, 0],
      volcanismOriginPlate: [7, -1],
      volcanismEventType: [EVENT_TYPE.intraplateHotspot, 0],
    });
    const traces = identityTraces();
    traces[1] = new Uint32Array([1, 0]);

    const provenance = computeLineage(eras, traces);

    expect(Array.from(provenance.originPlateId)).toEqual([11, 7]);
  });
});
