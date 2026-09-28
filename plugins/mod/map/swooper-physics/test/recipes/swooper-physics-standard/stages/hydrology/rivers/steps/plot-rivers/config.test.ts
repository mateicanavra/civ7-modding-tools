import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import mapRiversStage from "../../../../../../../../src/recipes/standard/stages/hydrology/rivers/index.js";
import { config as plotRiversConfig } from "../../../../../../../../src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/config.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

function normalizeNavigableDensity(navigableRiverDensity: "normal" | "dense" | null) {
  const authored = { projection: { model: "legacy-procedural", navigableRiverDensity, endpointDischargePercentileMin: 0.82, targetMajorTileFraction: 0.61 } };
  const stageConfig = validateSchemaValueForTest(
    mapRiversStage.surfaceSchema,
    authored,
    "/map-rivers"
  );
  const { rawSteps } = mapRiversStage.toInternal({ setup, stageConfig });
  const config = validateSchemaValueForTest(
    plotRiversConfig.schema,
    rawSteps["plot-rivers"],
    "/map-rivers/plot-rivers"
  );
  if (config.projection.model !== "legacy-procedural") throw new Error("Expected legacy compiler branch.");
  return config.projection;
}

describe("map-rivers plot-rivers authoring", () => {
  it("admits authored-network without competing legacy knobs or quotas", () => {
    const authored = { projection: { model: "authored-network" } };
    const stageConfig = validateSchemaValueForTest(mapRiversStage.surfaceSchema, authored, "/map-rivers");
    expect(mapRiversStage.toInternal({ setup, stageConfig }).rawSteps).toEqual({ "plot-rivers": authored });
    expect(() => validateSchemaValueForTest(mapRiversStage.surfaceSchema, { projection: { model: "authored-network", targetMajorTileFraction: 0.2 } }, "/map-rivers")).toThrow();
    expect(() => validateSchemaValueForTest(mapRiversStage.surfaceSchema, { ...authored, knobs: { navigableRiverDensity: "dense" } }, "/map-rivers")).toThrow();
  });
  it("selects more Civ-visible river coverage for the dense posture", () => {
    const normal = normalizeNavigableDensity("normal");
    const dense = normalizeNavigableDensity("dense");

    expect(dense.endpointDischargePercentileMin).toBeLessThan(
      normal.endpointDischargePercentileMin
    );
    expect(dense.targetMajorTileFraction).toBeGreaterThan(normal.targetMajorTileFraction);
  });

  it("preserves advanced projection thresholds when density authoring is disabled", () => {
    const advanced = normalizeNavigableDensity(null);

    expect(advanced.endpointDischargePercentileMin).toBe(0.82);
    expect(advanced.targetMajorTileFraction).toBe(0.61);
  });
});
