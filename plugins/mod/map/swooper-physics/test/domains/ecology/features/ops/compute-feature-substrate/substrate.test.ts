import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

describe("ecology feature substrate", () => {
  it("declares model relief units while preserving the legacy authored M keys and defaults", () => {
    const operation = ecology.features.ops.computeFeatureSubstrate;
    expect(Reflect.get(operation.input.properties.elevation, "description")).toContain("model relief units");
    expect(Reflect.get(operation.input.properties.seaLevel, "description")).toContain("model relief units");
    for (const key of [
      "lowlandMaxElevationAboveSeaM",
      "intertidalMaxElevationAboveSeaM",
    ] as const) {
      expect(Reflect.get(operation.strategies.hydromorphic.config.properties[key], "description")).toContain(
        "model relief units"
      );
      expect(Reflect.get(operation.strategies.hydromorphic.config.properties[key], "description")).toContain("not meters");
    }
    expect(
      ecology.features.ops.computeFeatureSubstrate.defaultConfig.config.lowlandMaxElevationAboveSeaM
    ).toBe(160);
    expect(
      ecology.features.ops.computeFeatureSubstrate.defaultConfig.config.intertidalMaxElevationAboveSeaM
    ).toBe(40);
  });

  it("honors legacy model-unit thresholds, excludes below-datum land, and preserves joint datum translations", () => {
    const syntheticDimensions = { width: 8, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const seaLevel = -40;
    const heightsAboveSea = [-1, 0, 15, 16, 40, 41, 160, 161];
    const landMask = new Uint8Array(size);
    landMask.fill(1, width);
    const elevation = new Int16Array(size).fill(-200);
    elevation.set(heightsAboveSea.map((height) => seaLevel + height), width);
    const input = {
      width,
      height,
      landMask,
      elevation,
      seaLevel,
      riverClass: new Uint8Array(size).fill(RIVER_CLASS_MAJOR),
      navigableRiverMask: new Uint8Array(size),
      discharge: Array<number>(size).fill(160),
      sinkMask: new Uint8Array(size).fill(1),
    };
    const operation = ecology.features.ops.computeFeatureSubstrate;
    const defaultSelection = normalizeOperationSelectionForTest(operation, operation.defaultConfig);
    const defaults = operation.run(input, defaultSelection);
    expect(Array.from(defaults.lowlandMask.slice(width))).toEqual([0, 1, 1, 1, 1, 1, 1, 0]);
    expect(Array.from(defaults.intertidalCoastMask.slice(width))).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);

    const customSelection = normalizeOperationSelectionForTest(operation, {
      ...operation.defaultConfig,
      config: {
        ...operation.defaultConfig.config,
        lowlandMaxElevationAboveSeaM: 40,
        intertidalMaxElevationAboveSeaM: 15,
      },
    });
    const custom = operation.run(input, customSelection);
    expect(Array.from(custom.lowlandMask.slice(width))).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
    expect(Array.from(custom.intertidalCoastMask.slice(width))).toEqual([0, 1, 1, 0, 0, 0, 0, 0]);
    for (const result of [defaults, custom]) {
      expect(result.floodplainMask[width]).toBe(0);
      expect(result.sinkBasinMask[width]).toBe(0);
      expect(result.hydromorphicMask[width]).toBe(0);
    }

    const datumShift = 311;
    const translatedInput = {
      ...input,
      seaLevel: seaLevel + datumShift,
      elevation: Int16Array.from(elevation, (height) => height + datumShift),
    };
    expect(operation.run(translatedInput, defaultSelection)).toEqual(defaults);
    expect(operation.run(translatedInput, customSelection)).toEqual(custom);
  });

  it("does not invent sink substrate when certified inputs omit legacy sink evidence", () => {
    const input = { width: 5, height: 5, riverClass: new Uint8Array(25), navigableRiverMask: new Uint8Array(25), landMask: new Uint8Array(25).fill(1), elevation: new Int16Array(25).fill(10), seaLevel: 0, discharge: Array<number>(25).fill(0) };
    const selection = normalizeOperationSelectionForTest(ecology.features.ops.computeFeatureSubstrate, ecology.features.ops.computeFeatureSubstrate.defaultConfig);
    const without = ecology.features.ops.computeFeatureSubstrate.run(input, selection);
    const sinkMask = new Uint8Array(25);
    sinkMask[12] = 1;
    const legacy = ecology.features.ops.computeFeatureSubstrate.run({ ...input, sinkMask }, selection);
    expect(without.sinkBasinMask[12]).toBe(0);
    expect(legacy.sinkBasinMask[12]).toBe(1);
  });
  it("separates minor river adjacency from projected navigable terrain", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    riverClass[1] = RIVER_CLASS_MINOR;
    navigableRiverMask[4] = 1;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      ecology.features.ops.computeFeatureSubstrate.defaultConfig
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(40),
        seaLevel: 0,
        discharge: Array<number>(size).fill(100),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.navigableRiverMask[1]).toBe(0);
    expect(result.navigableRiverMask[4]).toBe(1);
    expect(result.nearRiverMask[1]).toBe(1);
  });

  it("withholds floodplain substrate below its discharge floor", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    riverClass[Math.floor(height / 2) * width + Math.floor(width / 2)] = RIVER_CLASS_MAJOR;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      {
        ...ecology.features.ops.computeFeatureSubstrate.defaultConfig,
        config: {
          ...ecology.features.ops.computeFeatureSubstrate.defaultConfig.config,
          lowlandMaxElevationAboveSeaM: 80,
          floodplainDischargeMin: 96,
        },
      }
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask: new Uint8Array(size),
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge: Array<number>(size).fill(8),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.floodplainMask).toEqual(new Uint8Array(size));
  });

  it("admits lowland high-discharge navigable major rivers as floodplain substrate", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverIndex = Math.floor(height / 2) * width + Math.floor(width / 2);
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    const discharge = Array<number>(size).fill(0);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;
    navigableRiverMask[riverIndex] = 1;
    discharge[riverIndex] = 160;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      {
        ...ecology.features.ops.computeFeatureSubstrate.defaultConfig,
        config: {
          ...ecology.features.ops.computeFeatureSubstrate.defaultConfig.config,
          lowlandMaxElevationAboveSeaM: 80,
          floodplainDischargeMin: 96,
        },
      }
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge,
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.floodplainMask[riverIndex]).toBe(1);
  });
});
