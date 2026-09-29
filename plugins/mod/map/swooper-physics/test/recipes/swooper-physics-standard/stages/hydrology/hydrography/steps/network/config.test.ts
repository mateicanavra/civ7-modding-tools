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
import {
  hugeRoot17,
  standardRoots37And39,
} from "../../../../../../../domains/hydrology/hydrography/ops/compute-basin-network/fixtures/retained-fixtures.js";
import { projectNetworkViz } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/network/viz.js";

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
      computeBasinNetwork: structuredClone(ops.computeBasinNetwork.defaultConfig),
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
function execute(
  model: "legacy-sink-budget" | "certified-sill-spill",
  unsupported = false,
  retained?: ReturnType<typeof hugeRoot17>,
  corruptPlan = false
) {
  const runDimensions = retained ? { width: retained.width, height: retained.height } : dimensions;
  const runSetup = admitMapSetup({ ...setup, dimensions: runDimensions });
  const context = createMapContext({ setup: runSetup, adapter: new MockAdapter(runDimensions) });
  const input = retained
      ? {
          topography: {
            elevation: Int16Array.from(retained.elevation),
            landMask: Uint8Array.from(retained.landMask),
            seaLevel: 0,
            bathymetry: new Int16Array(retained.width * retained.height),
          },
          climate: {
            ...forcing().climate,
            rainfall: Uint8Array.from(retained.rainfall),
            potentialDemand: Float32Array.from(retained.potentialDemand),
            // Recover the unique admitted byte from the exact retained source arithmetic, not a new forcing fit.
            humidity: Uint8Array.from(retained.localRunoff, (runoff, cell) => {
              if (!retained.landMask[cell]) return 0;
              for (let humidity = 0; humidity < 256; humidity++)
                if (
                  retained.rainfall[cell]! * (1 - 0.18) * (1 - 0.22 * (humidity / 255)) ===
                  runoff
                )
                  return humidity;
              throw new Error(`No exact retained source humidity at ${cell}.`);
            }),
          },
        }
      : forcing(),
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
    computeBasinNetwork: record(
      "computeBasinNetwork",
      (
        input: Parameters<typeof ops.computeBasinNetwork.run>[0],
        config: Parameters<typeof ops.computeBasinNetwork.run>[1]
      ): ReturnType<typeof ops.computeBasinNetwork.run> => {
        if (unsupported)
          return {
            status: "no-stationary-solution" as const,
            witness: {
              kind: "persistent-surplus" as const,
              leafIds: [1],
              catchmentCells: [2],
              response: {
                state: "no-stationary-solution" as const,
                wetCells: [2],
                evaluatedLevels: {
                  lower: 0,
                  lowerInclusive: false,
                  upper: null,
                  upperInclusive: false,
                },
                unresolvedSurplus: 1,
                flux: {
                  incomingOverflow: 0,
                  dryRunoff: 0,
                  wetPrecipitation: 2,
                  wetDemand: 1,
                  balance: 1,
                },
              },
            },
          };
        const result = ops.computeBasinNetwork.run(input, config);
        if (corruptPlan && result.status === "supported") result.plan.waterSurface[2] = NaN;
        return result;
      }
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
        (() => {
          const compiled = compile(authored(model));
          return retained
            ? {
                ...compiled,
                computeLocalRunoff: {
                  ...compiled.computeLocalRunoff,
                  config: { infiltrationFraction: 0.18, humidityDampening: 0.22 },
                },
              }
            : compiled;
        })(),
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
  it("publishes the retained quantized closure and inward312 ledger through all actual operations", () => {
    for (const retained of [hugeRoot17(), standardRoots37And39()]) {
      const before = structuredClone(retained),
        result = execute("certified-sill-spill", false, retained);
      expect(result.failure).toBeUndefined();
      const hydro = readArtifact(result.context, waterArtifacts.hydrography);
      const lake = readArtifact(result.context, waterArtifacts.lakePlan);
      const metadata = readArtifact(result.context, waterArtifacts.riverNetwork);
      if (lake.model !== "certified-sill-spill" || metadata.model !== "certified-sill-spill")
        throw new Error("Wrong model.");
      expect(hydro.runoff).toEqual(retained.localRunoff);
      expect(retained).toEqual(before);
      expect("certificates" in lake).toBe(false);
      expect(lake.waterSurface.every(Number.isFinite)).toBe(true);
      const viz = projectNetworkViz(
        { hydrography: hydro, lakePlan: lake, riverNetwork: metadata },
        { width: retained.width, height: retained.height }
      );
      const residualLayer = viz.find(
        (layer) => layer.dataTypeKey === "hydrology.hydrography.unresolvedResidual"
      )!;
      expect(residualLayer.field.format).toBe("f32");
      for (let cell = 0; cell < lake.lakeMask.length; cell++)
        expect(residualLayer.field.values[cell]).toBe(
          Math.fround(
            lake.components.find((component) => component.anchorCell === cell)
              ?.unresolvedResidual ?? 0
          )
        );
      expect(
        viz.find((layer) => layer.dataTypeKey === "hydrology.hydrography.componentId")!.field.values
      ).toBe(lake.componentId);
      if (retained.width === 106) {
        expect(lake.bodies[0]!.wetCells).toEqual([43]);
        expect(lake.waterSurface[43]).toBe(24);
        expect(lake.conservation.unresolvedResidual).toBe(14.902249320942005);
        expect(hydro.terminalType[43]).toBe(3);
        expect(metadata.mouthType[149]).toBe(2);
      } else {
        expect(
          lake.transfers.find((edge) => edge.cellA === 228 && edge.cellB === 312)!.signedDischarge
        ).toBeCloseTo(-5.586530981337614, 12);
        expect(lake.bodies.find((body) => body.wetCells.includes(228))!.outflow).toBe(0);
        expect(hydro.flowDir[312]).toBe(396);
        expect(hydro.discharge[312]).toBeCloseTo(1.7170643127800531, 12);
        expect(metadata.upstreamArea[312]).toBe(17);
      }
    }
  });

  it("rejects a contradictory cross-product before the first publication", () => {
    const result = execute("certified-sill-spill", false, undefined, true);
    expect(result.failure).toBeDefined();
    for (const artifact of [
      waterArtifacts.hydrography,
      waterArtifacts.lakePlan,
      waterArtifacts.riverNetwork,
    ])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });
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
      "computeBasinNetwork",
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
    expect(String(result.failure)).toContain("persistent-surplus");
    expect(result.calls).toEqual([
      "computeLocalRunoff",
      "computeDrainageBasins",
      "computeBasinNetwork",
    ]);
    for (const artifact of [
      waterArtifacts.hydrography,
      waterArtifacts.lakePlan,
      waterArtifacts.riverNetwork,
    ])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });
});
