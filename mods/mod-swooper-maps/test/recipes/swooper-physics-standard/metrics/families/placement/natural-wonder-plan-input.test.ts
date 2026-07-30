import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  measureStandardNaturalWonderPlanInput,
  StandardNaturalWonderPlanInputMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-plan-input.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

type SurfaceDigestKey = Exclude<
  keyof ReturnType<typeof measureStandardNaturalWonderPlanInput>["plannerInput"]["surfaceDigests"],
  "version" | "plotCount"
>;

function measurementInput(
  options: Readonly<{
    wondersCount?: number;
    coastTerrainType?: number;
    mountainTerrainType?: number;
    iceFeatureType?: number;
    noFeatureType?: number;
    catalogDirection?: number;
    minSpacingTiles?: number;
  }> = {}
) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const plotCount = width * height;
  const landMask = new Uint8Array(plotCount).fill(1);
  const elevation = new Int16Array(plotCount).fill(100);
  const aridityIndex = new Float32Array(plotCount).fill(0.25);
  const riverClass = new Uint8Array(plotCount).fill(2);
  const lakeMask = new Uint8Array(plotCount);
  const vegetationDensity = new Float32Array(plotCount).fill(0.5);
  const effectiveMoisture = new Float32Array(plotCount).fill(0.75);
  const surfaceTemperature = new Float32Array(plotCount).fill(18.25);
  const fertility = new Float32Array(plotCount).fill(0.625);
  const discharge = new Float32Array(plotCount).fill(12.5);
  const slopeClass = new Uint8Array(plotCount).fill(3);
  const naturalWonderBlockedMask = new Uint8Array(plotCount);
  const terrainType = new Int32Array(plotCount).fill(4);
  const biomeType = new Int32Array(plotCount).fill(7);
  const featureType = new Int32Array(plotCount).fill(-1);
  elevation[5] = 240;
  naturalWonderBlockedMask[5] = 1;
  featureType[5] = 18;

  return {
    plannerInput: {
      width,
      height,
      wondersCount: options.wondersCount ?? 3,
      landMask,
      elevation,
      aridityIndex,
      riverClass,
      lakeMask,
      vegetationDensity,
      effectiveMoisture,
      surfaceTemperature,
      fertility,
      discharge,
      slopeClass,
      coastTerrainType: options.coastTerrainType ?? 4,
      mountainTerrainType: options.mountainTerrainType ?? 8,
      iceFeatureType: options.iceFeatureType ?? 12,
      terrainType,
      biomeType,
      featureType,
      noFeatureType: options.noFeatureType ?? -1,
      naturalWonderBlockedMask,
      featureCatalog: [
        {
          featureType: 30,
          direction: options.catalogDirection ?? 0,
          validTerrainTypes: [4, 8],
          validBiomeTypes: [7],
          minimumElevation: null,
          noLake: false,
          placeFirst: false,
          featureTags: [],
          footprintOffsetsByParity: {
            even: [{ dx: 0, dy: 0 }] as const,
            odd: [{ dx: 0, dy: 0 }] as const,
          },
        },
      ],
    },
    strategySelection: {
      strategy: "suitability-diversity",
      config: { minSpacingTiles: options.minSpacingTiles ?? 6 },
    },
    plan: {
      width,
      height,
      wondersCount: options.wondersCount ?? 3,
      targetCount: 1,
      plannedCount: 1,
      placements: [
        {
          plotIndex: 5,
          featureType: 30,
          direction: 0,
          elevation: 240,
          priority: 1,
        },
      ],
    },
  };
}

type MeasurementInput = ReturnType<typeof measurementInput>;

const SURFACE_PERTURBATIONS: Array<{
  channel: string;
  digest: SurfaceDigestKey;
  mutate: (input: MeasurementInput) => void;
}> = [
  {
    channel: "landMask",
    digest: "landMaskHash32",
    mutate: (input) => {
      input.plannerInput.landMask[9] = 0;
    },
  },
  {
    channel: "elevation",
    digest: "elevationHash32",
    mutate: (input) => {
      input.plannerInput.elevation[9] += 1;
    },
  },
  {
    channel: "aridityIndex",
    digest: "aridityIndexHash32",
    mutate: (input) => {
      input.plannerInput.aridityIndex[9] = 0.250_000_03;
    },
  },
  {
    channel: "riverClass",
    digest: "riverClassHash32",
    mutate: (input) => {
      input.plannerInput.riverClass[9] = 3;
    },
  },
  {
    channel: "lakeMask",
    digest: "lakeMaskHash32",
    mutate: (input) => {
      input.plannerInput.lakeMask[9] = 1;
    },
  },
  {
    channel: "vegetationDensity",
    digest: "vegetationDensityHash32",
    mutate: (input) => {
      input.plannerInput.vegetationDensity[9] = 0.500_000_06;
    },
  },
  {
    channel: "effectiveMoisture",
    digest: "effectiveMoistureHash32",
    mutate: (input) => {
      input.plannerInput.effectiveMoisture[9] = 0.750_000_06;
    },
  },
  {
    channel: "surfaceTemperature",
    digest: "surfaceTemperatureHash32",
    mutate: (input) => {
      input.plannerInput.surfaceTemperature[9] = 18.250_002;
    },
  },
  {
    channel: "fertility",
    digest: "fertilityHash32",
    mutate: (input) => {
      input.plannerInput.fertility[9] = 0.625_000_06;
    },
  },
  {
    channel: "discharge",
    digest: "dischargeHash32",
    mutate: (input) => {
      input.plannerInput.discharge[9] = 12.500_001;
    },
  },
  {
    channel: "slopeClass",
    digest: "slopeClassHash32",
    mutate: (input) => {
      input.plannerInput.slopeClass[9] = 4;
    },
  },
  {
    channel: "terrainType",
    digest: "terrainTypeHash32",
    mutate: (input) => {
      input.plannerInput.terrainType[9] = 5;
    },
  },
  {
    channel: "biomeType",
    digest: "biomeTypeHash32",
    mutate: (input) => {
      input.plannerInput.biomeType[9] = 8;
    },
  },
  {
    channel: "featureType",
    digest: "featureTypeHash32",
    mutate: (input) => {
      input.plannerInput.featureType[9] = 19;
    },
  },
  {
    channel: "naturalWonderBlockedMask",
    digest: "naturalWonderBlockedMaskHash32",
    mutate: (input) => {
      input.plannerInput.naturalWonderBlockedMask[9] = 1;
    },
  },
];

describe("Standard natural-wonder planning-input measurements", () => {
  it("closes the complete admitted planner request and selected anchors into product evidence", () => {
    const input = measurementInput();
    const measurements = measureStandardNaturalWonderPlanInput(input);

    expect(Value.Check(StandardNaturalWonderPlanInputMeasurementsSchema, measurements)).toBe(true);
    expect(measurements).toMatchObject({
      version: 2,
      plannerInput: {
        version: 1,
        dimensions: TEST_MAP_SIZE.dimensions,
        wondersCount: 3,
        engineConstants: {
          coastTerrainType: 4,
          mountainTerrainType: 8,
          iceFeatureType: 12,
          noFeatureType: -1,
        },
        featureCatalog: {
          count: 1,
          featureTypes: [30],
          canonicalHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        },
        strategy: {
          id: "suitability-diversity",
          configCanonicalJson: '{"minSpacingTiles":6}',
          configHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        },
        surfaceDigests: {
          version: 1,
          plotCount: TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height,
        },
      },
      plannedCount: 1,
      rows: [
        {
          plotIndex: 5,
          x: 5,
          y: 0,
          featureType: 30,
          terrainType: 4,
          biomeType: 7,
          occupiedFeatureType: 18,
          elevation: 240,
          aridityPpm: 250_000,
          riverClass: 2,
          lakeMask: 0,
          blockedMask: 1,
          landMask: 1,
        },
      ],
    });
  });

  it.each(SURFACE_PERTURBATIONS)("changes only the $digest digest when $channel changes", ({
    digest,
    mutate,
  }) => {
    const baseline = measureStandardNaturalWonderPlanInput(measurementInput());
    const changedInput = measurementInput();
    mutate(changedInput);
    const changed = measureStandardNaturalWonderPlanInput(changedInput);
    const changedDigestKeys = (
      Object.keys(changed.plannerInput.surfaceDigests) as Array<
        keyof typeof changed.plannerInput.surfaceDigests
      >
    ).filter(
      (key) =>
        changed.plannerInput.surfaceDigests[key] !== baseline.plannerInput.surfaceDigests[key]
    );

    expect(changedDigestKeys).toEqual([digest]);
  });

  it("preserves every causal scalar and the canonical catalog and strategy identities", () => {
    const baseline = measureStandardNaturalWonderPlanInput(measurementInput());
    const scalarCases = [
      {
        expected: { wondersCount: 4 },
        value: measureStandardNaturalWonderPlanInput(measurementInput({ wondersCount: 4 }))
          .plannerInput,
      },
      {
        expected: {
          engineConstants: {
            ...baseline.plannerInput.engineConstants,
            coastTerrainType: 5,
          },
        },
        value: measureStandardNaturalWonderPlanInput(measurementInput({ coastTerrainType: 5 }))
          .plannerInput,
      },
      {
        expected: {
          engineConstants: {
            ...baseline.plannerInput.engineConstants,
            mountainTerrainType: 9,
          },
        },
        value: measureStandardNaturalWonderPlanInput(measurementInput({ mountainTerrainType: 9 }))
          .plannerInput,
      },
      {
        expected: {
          engineConstants: {
            ...baseline.plannerInput.engineConstants,
            iceFeatureType: 13,
          },
        },
        value: measureStandardNaturalWonderPlanInput(measurementInput({ iceFeatureType: 13 }))
          .plannerInput,
      },
      {
        expected: {
          engineConstants: {
            ...baseline.plannerInput.engineConstants,
            noFeatureType: -2,
          },
        },
        value: measureStandardNaturalWonderPlanInput(measurementInput({ noFeatureType: -2 }))
          .plannerInput,
      },
    ] as const;
    for (const { expected, value } of scalarCases) {
      expect(value).toMatchObject(expected);
    }

    const catalogChange = measureStandardNaturalWonderPlanInput(
      measurementInput({ catalogDirection: 1 })
    );
    expect(catalogChange.plannerInput.featureCatalog.canonicalHash32).not.toBe(
      baseline.plannerInput.featureCatalog.canonicalHash32
    );
    expect(catalogChange.plannerInput.featureCatalog.featureTypes).toEqual(
      baseline.plannerInput.featureCatalog.featureTypes
    );

    const configChange = measureStandardNaturalWonderPlanInput(
      measurementInput({ minSpacingTiles: 7 })
    );
    expect(configChange.plannerInput.strategy).toMatchObject({
      id: "suitability-diversity",
      configCanonicalJson: '{"minSpacingTiles":7}',
    });
    expect(configChange.plannerInput.strategy.configHash32).not.toBe(
      baseline.plannerInput.strategy.configHash32
    );
  });

  it("retains immutable evidence after its source planner surfaces change", () => {
    const source = measurementInput();
    const measured = measureStandardNaturalWonderPlanInput(source);
    const retainedHash = measured.plannerInput.surfaceDigests.landMaskHash32;

    source.plannerInput.landMask[5] = 0;
    source.plannerInput.landMask[9] = 0;

    expect(measured.plannerInput.surfaceDigests.landMaskHash32).toBe(retainedHash);
    expect(measured.rows[0]?.landMask).toBe(1);
  });
});
