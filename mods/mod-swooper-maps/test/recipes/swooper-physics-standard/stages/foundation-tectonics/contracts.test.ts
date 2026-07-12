import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation";
import TectonicsStepContract from "../../../../../src/recipes/standard/stages/foundation-tectonics/steps/tectonics.contract.js";

describe("foundation tectonics contracts", () => {
  it("binds the authored tectonics operation set to foundation contracts", () => {
    const ops = TectonicsStepContract.ops;
    expect(ops).toBeDefined();
    if (!ops) throw new Error("Tectonics step must declare its operation bindings.");

    expect(Object.keys(ops).sort()).toEqual([
      "computeEraPlateMembership",
      "computeEraTectonicFields",
      "computeHotspotEvents",
      "computePlateMotion",
      "computeSegmentEvents",
      "computeTectonicHistoryRollups",
      "computeTectonicProvenance",
      "computeTectonicSegments",
      "computeTectonicsCurrent",
      "computeTracerAdvection",
    ]);
    expect(ops.computePlateMotion).toBe(foundation.ops.computePlateMotion);
    expect(ops.computeTectonicSegments).toBe(foundation.ops.computeTectonicSegments);
    expect(ops.computeEraPlateMembership).toBe(foundation.ops.computeEraPlateMembership);
    expect(ops.computeSegmentEvents).toBe(foundation.ops.computeSegmentEvents);
    expect(ops.computeHotspotEvents).toBe(foundation.ops.computeHotspotEvents);
    expect(ops.computeEraTectonicFields).toBe(foundation.ops.computeEraTectonicFields);
    expect(ops.computeTectonicHistoryRollups).toBe(foundation.ops.computeTectonicHistoryRollups);
    expect(ops.computeTectonicsCurrent).toBe(foundation.ops.computeTectonicsCurrent);
    expect(ops.computeTracerAdvection).toBe(foundation.ops.computeTracerAdvection);
    expect(ops.computeTectonicProvenance).toBe(foundation.ops.computeTectonicProvenance);
  });
});
