import { describe, expect, it } from "bun:test";
import type { StandardNaturalWonderPlanInputMeasurements } from "../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-plan-input.js";
import { logNaturalWonderPlanInputRuntimeTelemetry } from "../../../../../src/recipes/standard/stages/placement/log.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const LOG_PREFIX = "[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V2 ";

describe("natural-wonder planning-input live telemetry", () => {
  it("serializes the recipe-owned measurement without a second wire shape", () => {
    const digest = "1234abcd";
    const measurements = {
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
          canonicalHash32: digest,
        },
        strategy: {
          id: "suitability-diversity",
          configCanonicalJson: '{"minSpacingTiles":6}',
          configHash32: digest,
        },
        surfaceDigests: {
          version: 1,
          plotCount: TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height,
          landMaskHash32: digest,
          elevationHash32: digest,
          aridityIndexHash32: digest,
          riverClassHash32: digest,
          lakeMaskHash32: digest,
          vegetationDensityHash32: digest,
          effectiveMoistureHash32: digest,
          surfaceTemperatureHash32: digest,
          fertilityHash32: digest,
          dischargeHash32: digest,
          slopeClassHash32: digest,
          terrainTypeHash32: digest,
          biomeTypeHash32: digest,
          featureTypeHash32: digest,
          naturalWonderBlockedMaskHash32: digest,
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
    } satisfies StandardNaturalWonderPlanInputMeasurements;
    const messages: string[] = [];
    const originalLog = console.log;
    console.log = (message?: unknown) => {
      messages.push(String(message));
    };
    try {
      logNaturalWonderPlanInputRuntimeTelemetry(measurements);
    } finally {
      console.log = originalLog;
    }

    expect(messages).toHaveLength(1);
    const [message] = messages;
    if (!message) throw new Error("Natural-wonder planning-input telemetry was not logged.");
    expect(message.startsWith(LOG_PREFIX)).toBe(true);
    expect(JSON.parse(message.slice(LOG_PREFIX.length))).toEqual(measurements);
  });
});
