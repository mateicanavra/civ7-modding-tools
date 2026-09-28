import { describe, expect, it } from "bun:test";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { MockAdapter } from "@civ7/adapter";
import { Value } from "typebox/value";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  validateSchemaValueForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../../../src/domain/hydrology/router.js";
import stage from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/index.js";
import { NetworkStep } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/network/step.js";
import { artifacts as waterArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as landArtifacts } from "../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";

const ops = hydrology.hydrography.ops;
const dimensions = { width: 9, height: 1 };
const setup = admitMapSetup({
  mapSeed: 42,
  dimensions,
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

function authored(model: "legacy-sink-budget" | "certified-sill-spill") {
  const common = {
    knobs: { riverDensity: "normal" as const },
    projectRiverNetwork: structuredClone(ops.projectRiverNetwork.defaultConfig),
  };
  if (model === "legacy-sink-budget")
    return {
      ...common,
      water: {
        model,
        lakeiness: "normal" as const,
        drainageRouting: structuredClone(ops.computeDrainageRouting.defaultConfig),
        accumulateDischarge: structuredClone(ops.accumulateDischarge.defaultConfig),
        planLakes: structuredClone(ops.planLakes.defaultConfig),
        classifyRiverNetwork: structuredClone(ops.classifyRiverNetwork.defaultConfig),
      },
    };
  return {
    ...common,
    water: {
      model,
      computeLocalRunoff: structuredClone(ops.computeLocalRunoff.defaultConfig),
      computeDrainageBasins: structuredClone(ops.computeDrainageBasins.defaultConfig),
      computeOpenBasinNetwork: structuredClone(ops.computeOpenBasinNetwork.defaultConfig),
      classifyBasinRiverNetwork: structuredClone(ops.classifyBasinRiverNetwork.defaultConfig),
    },
  };
}
function compile(value: ReturnType<typeof authored>) {
  const admitted = validateSchemaValueForTest(stage.surfaceSchema, value, "/hydrology-hydrography");
  const { rawSteps } = stage.toInternal({ setup, stageConfig: admitted });
  return validateSchemaValueForTest(NetworkStep.contract.schema, rawSteps.network, "/network");
}
function forcing() {
  const elevation = Int16Array.of(-5, 8, 0, 3, 1, 7, 2, 16, 20);
  return {
    topography: {
      elevation,
      landMask: Uint8Array.of(0, 1, 1, 1, 1, 1, 1, 1, 1),
      seaLevel: 0,
      bathymetry: new Int16Array(9),
    },
    climate: {
      rainfall: new Uint8Array(9).fill(100),
      humidity: new Uint8Array(9).fill(64),
      potentialDemand: new Float32Array(9).fill(1),
      demandParameters: {
        tMinC: 0,
        tMaxC: 35,
        petBase: 18,
        petTemperatureWeight: 75,
        humidityDampening: 0.55,
      },
    },
  };
}
function execute(model: "legacy-sink-budget" | "certified-sill-spill", unsupported = false) {
  const context = createMapContext({ setup, adapter: new MockAdapter(dimensions) });
  const input = forcing(),
    calls: string[] = [];
  function record<A extends unknown[], R>(name: string, run: (...args: A) => R) {
    return (...args: A): R => {
      calls.push(name);
      return run(...args);
    };
  }
  const bindings: Parameters<typeof NetworkStep.run>[2] = {
    drainageRouting: record("drainageRouting", ops.computeDrainageRouting.run),
    accumulateDischarge: record("accumulateDischarge", ops.accumulateDischarge.run),
    projectRiverNetwork: record("projectRiverNetwork", ops.projectRiverNetwork.run),
    planLakes: record("planLakes", ops.planLakes.run),
    classifyRiverNetwork: record("classifyRiverNetwork", ops.classifyRiverNetwork.run),
    computeLocalRunoff: record("computeLocalRunoff", ops.computeLocalRunoff.run),
    computeDrainageBasins: record("computeDrainageBasins", ops.computeDrainageBasins.run),
    computeOpenBasinNetwork: record(
      "computeOpenBasinNetwork",
      unsupported
        ? () => ({
            status: "unsupported" as const,
            witness: { kind: "outlet-free-root" as const, nodeId: 1 },
          })
        : ops.computeOpenBasinNetwork.run
    ),
    classifyBasinRiverNetwork: record(
      "classifyBasinRiverNetwork",
      ops.classifyBasinRiverNetwork.run
    ),
  };
  let failure: unknown;
  try {
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, landArtifacts.topography, input.topography);
      publishTestArtifact(stepContext, climateArtifacts.baselineClimateField, input.climate);
      NetworkStep.run(
        stepContext,
        compile(authored(model)),
        bindings,
        buildStepTestDependencies(NetworkStep, stepContext)
      );
    });
  } catch (error) {
    failure = error;
  }
  return { context, calls, input, failure };
}

describe("hydrology network authoring and dispatch", () => {
  it("rejects inactive public controls and forwards only the selected authored envelopes", () => {
    const selected = authored("certified-sill-spill");
    if (selected.water.model !== "certified-sill-spill") throw new Error("Wrong fixture branch.");
    selected.water.computeLocalRunoff.config.infiltrationFraction = 0.37;
    const compiled = compile(selected);
    expect(compiled.computeLocalRunoff.config.infiltrationFraction).toBe(0.37);
    expect(compiled.accumulateDischarge).toEqual(ops.accumulateDischarge.defaultConfig);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...selected,
        water: { ...selected.water, lakeiness: "few" },
      })
    ).toBe(false);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...selected,
        water: { ...selected.water, accumulateDischarge: ops.accumulateDischarge.defaultConfig },
      })
    ).toBe(false);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...selected,
        knobs: { riverDensity: "normal", lakeiness: "normal" },
        rivers: {},
      })
    ).toBe(false);
  });

  it("preserves relative river density and legacy lakeiness transforms", () => {
    const neutral = authored("legacy-sink-budget");
    if (neutral.water.model !== "legacy-sink-budget") throw new Error("Wrong fixture branch.");
    neutral.projectRiverNetwork.config.minorPercentile = 0.86;
    neutral.projectRiverNetwork.config.majorPercentile = 0.96;
    neutral.water.planLakes.config.maxUpstreamSteps = 2;
    neutral.water.planLakes.config.sinkDischargePercentileMin = 0.83;
    neutral.water.planLakes.config.maxLakeLandFraction = 0.02;
    const normal = compile(neutral);
    const dense = validateSchemaValueForTest(
      stage.surfaceSchema,
      {
        ...neutral,
        knobs: { riverDensity: "dense" },
        water: { ...neutral.water, lakeiness: "many" },
      },
      "/stage"
    );
    const many = validateSchemaValueForTest(
      NetworkStep.contract.schema,
      stage.toInternal({ setup, stageConfig: dense }).rawSteps.network,
      "/network"
    );
    expect(normal.projectRiverNetwork.config.minorPercentile).toBe(0.86);
    expect(normal.projectRiverNetwork.config.majorPercentile).toBe(0.96);
    expect(many.projectRiverNetwork.config.minorPercentile).toBeCloseTo(0.79);
    expect(many.projectRiverNetwork.config.majorPercentile).toBeCloseTo(0.92);
    expect(many.planLakes.config.maxUpstreamSteps).toBe(2);
    expect(many.planLakes.config.sinkDischargePercentileMin).toBeCloseTo(0.79);
    expect(many.planLakes.config.maxLakeLandFraction).toBeCloseTo(0.04);
  });

  it("executes only the certified operations and publishes one consistent preserved-ground generation", () => {
    const result = execute("certified-sill-spill");
    expect(result.failure).toBeUndefined();
    expect(result.calls).toEqual([
      "computeLocalRunoff",
      "computeDrainageBasins",
      "computeOpenBasinNetwork",
      "projectRiverNetwork",
      "classifyBasinRiverNetwork",
    ]);
    const hydro = readArtifact(result.context, waterArtifacts.hydrography);
    const lake = readArtifact(result.context, waterArtifacts.lakePlan);
    const river = readArtifact(result.context, waterArtifacts.riverNetwork);
    expect(hydro.model).toBe("certified-sill-spill");
    expect(lake.model).toBe(hydro.model);
    expect(river.model).toBe(hydro.model);
    if (lake.model !== "certified-sill-spill") throw new Error("Wrong published model.");
    expect(lake.plannedLakeTileCount).toBeGreaterThan(0);
    expect(Array.isArray(hydro.runoff)).toBe(true);
    expect("routingElevation" in hydro).toBe(false);
    for (let cell = 0; cell < 9; cell++) {
      if (lake.lakeMask[cell]) {
        expect(hydro.riverClass[cell]).toBe(0);
        expect(hydro.discharge[cell]).toBe(0);
      } else expect(lake.waterSurface[cell]).toBe(result.input.topography.elevation[cell]);
    }
    expect(result.input.topography).toEqual(forcing().topography);
  });

  it("preserves legacy computation order and values while never calling certified operations", () => {
    const result = execute("legacy-sink-budget");
    expect(result.failure).toBeUndefined();
    expect(result.calls).toEqual([
      "drainageRouting",
      "accumulateDischarge",
      "projectRiverNetwork",
      "planLakes",
      "classifyRiverNetwork",
    ]);
    const hydro = readArtifact(result.context, waterArtifacts.hydrography);
    const cfg = compile(authored("legacy-sink-budget"));
    const routing = ops.computeDrainageRouting.run(
      {
        ...dimensions,
        elevation: result.input.topography.elevation,
        landMask: result.input.topography.landMask,
      },
      cfg.drainageRouting
    );
    const discharge = ops.accumulateDischarge.run(
      {
        ...dimensions,
        landMask: result.input.topography.landMask,
        flowDir: routing.flowDir,
        rainfall: result.input.climate.rainfall,
        humidity: result.input.climate.humidity,
      },
      cfg.accumulateDischarge
    );
    expect(hydro.model).toBe("legacy-sink-budget");
    expect(hydro.flowDir).toEqual(routing.flowDir);
    expect(hydro.runoff).toEqual(discharge.runoff);
    expect(hydro.discharge).toEqual(discharge.discharge);
  });

  it("retains unsupported evidence and publishes none of the physical products or later classifications", () => {
    const result = execute("certified-sill-spill", true);
    expect(String(result.failure)).toContain("outlet-free-root");
    expect(result.calls).toEqual([
      "computeLocalRunoff",
      "computeDrainageBasins",
      "computeOpenBasinNetwork",
    ]);
    for (const artifact of [
      waterArtifacts.hydrography,
      waterArtifacts.lakePlan,
      waterArtifacts.riverNetwork,
    ])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });
});
