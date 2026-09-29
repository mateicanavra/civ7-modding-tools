import { describe, expect, it } from "bun:test";
import {
  normalizeOperationSelectionForTest,
  runAdmittedOperationForTest,
  validateSchemaValueForTest,
} from "@swooper/mapgen-core/testing";

import hydrologyContract from "../../../../../../src/domain/hydrology/index.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeThermalState } = hydrology.climate.ops;
const selection = {
  strategy: "insolation-lapse-rate",
  config: {
    baseTemperatureC: 20,
    insolationScaleC: 40,
    lapseRateCPerElevationUnit: -0.15,
    landCoolingC: 2,
    minC: -40,
    maxC: 50,
  },
} as const;

function runThermal(
  input: Readonly<{
    elevation: Int16Array;
    seaLevel: number;
    landMask: Uint8Array;
    insolation?: Float32Array;
    sstC?: Float32Array;
  }>
) {
  const result = runAdmittedOperationForTest(
    computeThermalState,
    {
      model: "insolation-lapse-rate",
      width: input.elevation.length,
      height: 1,
      insolation: new Float32Array(input.elevation.length).fill(0.5),
      ...input,
    },
    selection
  );
  if (result.model !== "insolation-lapse-rate") throw new Error("Expected legacy thermal result.");
  return result.surfaceTemperatureC;
}

describe("hydrology/compute-thermal-state insolation-lapse-rate", () => {
  it("requires an explicit sea-level datum", () => {
    expect(() =>
      validateSchemaValueForTest(
        hydrologyContract.climate.ops.computeThermalState.input,
        {
          model: "insolation-lapse-rate",
          width: 1,
          height: 1,
          insolation: new Float32Array([0.5]),
          elevation: new Int16Array([0]),
          landMask: new Uint8Array([1]),
        },
        "/thermal"
      )
    ).toThrow(/seaLevel/);
  });

  it("admits empirical relief cooling only within the authored range", () => {
    for (const lapseRateCPerElevationUnit of [-0.5, -0.15, -0.0065, 0]) {
      const admitted = normalizeOperationSelectionForTest(computeThermalState, {
        ...selection,
        config: { ...selection.config, lapseRateCPerElevationUnit },
      });
      expect(admitted.config.lapseRateCPerElevationUnit).toBe(lapseRateCPerElevationUnit);
    }
    for (const lapseRateCPerElevationUnit of [-0.5001, 0.0001]) {
      expect(() =>
        normalizeOperationSelectionForTest(computeThermalState, {
          ...selection,
          config: { ...selection.config, lapseRateCPerElevationUnit },
        })
      ).toThrow(/lapseRateCPerElevationUnit/);
    }
  });

  it("preserves temperature when elevation and datum shift together", () => {
    const elevation = new Int16Array([-60, -20, -10, 30, 80, 180]);
    const input = {
      elevation,
      seaLevel: -20,
      landMask: new Uint8Array([0, 0, 1, 1, 1, 1]),
      insolation: new Float32Array([0, 0.25, 0.5, 0.75, 1, 0.5]),
    };
    const first = runThermal(input);
    const second = runThermal({
      ...input,
      elevation: elevation.map((value) => value + 237),
      seaLevel: input.seaLevel + 237,
    });

    expect(second).toEqual(first);
    expect(runThermal(input)).toEqual(first);
    expect(elevation).toEqual(new Int16Array([-60, -20, -10, 30, 80, 180]));
  });

  it("cools land by exactly 15 C per 100 relief units above sea level", () => {
    const temperature = runThermal({
      elevation: new Int16Array([17, 37, 117]),
      seaLevel: 17,
      landMask: new Uint8Array([1, 1, 1]),
      insolation: new Float32Array([0.75, 0.75, 0.75]),
    });

    expect(Array.from(temperature)).toEqual([28, 25, 13]);
  });

  it("clamps below-datum land height to zero instead of warming depressions", () => {
    const temperature = runThermal({
      elevation: new Int16Array([-30, 19, 20, 21]),
      seaLevel: 20,
      landMask: new Uint8Array([1, 1, 1, 1]),
    });

    expect(Array.from(temperature.slice(0, 3))).toEqual([18, 18, 18]);
    expect(temperature[3]).toBeCloseTo(17.85, 5);
  });

  it("uses sea-level forcing over water without bathymetric warming", () => {
    const temperature = runThermal({
      elevation: new Int16Array([50, 0, -500]),
      seaLevel: 50,
      landMask: new Uint8Array([0, 0, 0]),
      insolation: new Float32Array([0.75, 0.75, 0.75]),
    });

    expect(Array.from(temperature)).toEqual([30, 30, 30]);
  });

  it("bounds authoritative water SST while ignoring it on land", () => {
    const temperature = runThermal({
      elevation: new Int16Array([-100, 0, 50, 150]),
      seaLevel: 50,
      landMask: new Uint8Array([0, 0, 0, 1]),
      sstC: new Float32Array([-100, 12, 100, 100]),
    });

    expect(Array.from(temperature)).toEqual([-40, 12, 50, 3]);
  });

  it("bounds insolation and relief temperatures without SST", () => {
    const result = runAdmittedOperationForTest(
      computeThermalState,
      {
        model: "insolation-lapse-rate",
        width: 3,
        height: 1,
        elevation: new Int16Array([1000, 0, 0]),
        seaLevel: 0,
        landMask: new Uint8Array([1, 1, 0]),
        insolation: new Float32Array([0, 1, 1]),
      },
      { ...selection, config: { ...selection.config, baseTemperatureC: 60 } }
    );
    if (result.model !== "insolation-lapse-rate")
      throw new Error("Expected legacy thermal result.");
    const temperature = result.surfaceTemperatureC;

    expect(Array.from(temperature)).toEqual([-40, 50, 50]);
  });
});
