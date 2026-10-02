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

describe("map-rivers plot-rivers authoring", () => {
  it("uses the SDK's configurationless stage and rejects retired projection controls", () => {
    const authored = {};
    const stageConfig = validateSchemaValueForTest(mapRiversStage.surfaceSchema, authored, "/map-rivers");
    const { rawSteps } = mapRiversStage.toInternal({ setup, stageConfig });
    expect(rawSteps).toEqual({});
    expect(validateSchemaValueForTest(plotRiversConfig.schema, {}, "/plot-rivers")).toEqual({});
    for (const projection of [
      { model: "legacy-procedural" }, { model: "unknown-model" }, { model: "authored-network" },
      { model: "authored-network", targetMajorTileFraction: 0.2 },
      { model: "authored-network", endpointDischargePercentileMin: 0.94 },
      { model: "authored-network", navigableRiverDensity: "dense" },
    ]) expect(() => validateSchemaValueForTest(mapRiversStage.surfaceSchema, { projection }, "/map-rivers")).toThrow();
    expect(() => validateSchemaValueForTest(mapRiversStage.surfaceSchema, { ...authored, knobs: { navigableRiverDensity: "dense" } }, "/map-rivers")).toThrow();
    expect(() => validateSchemaValueForTest(plotRiversConfig.schema, { projection: { model: "authored-network" } }, "/plot-rivers")).toThrow();
  });
});
