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
import morphology from "../../../../../../../../src/domain/morphology/router.js";
import stage from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/index.js";
import { NetworkStep } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/network/step.js";
import { artifacts as waterArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as landArtifacts } from "../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as erosionArtifacts } from "../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import {
  desertHugeRoot19,
  hugeRoot17,
  standardRoots37And39,
} from "../../../../../../../domains/hydrology/hydrography/ops/compute-basin-network/fixtures/retained-fixtures.js";
import { projectNetworkViz } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/network/viz.js";

const ops = hydrology.hydrography.ops;
const terrainOps = morphology.erosion.ops;
const dimensions = { width: 9, height: 1 };
const setup = admitMapSetup({
  mapSeed: 42,
  dimensions,
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

function authored(riverDensity: "normal" | "dense" = "normal") {
  return {
    knobs: { riverDensity },
    projectRiverNetwork: structuredClone(ops.projectRiverNetwork.defaultConfig),
    terrainEvolution: {
      cycles: 0,
      computeChannelIncision: structuredClone(terrainOps.computeChannelIncision.defaultConfig),
    },
    water: {
      model: "certified-sill-spill" as const,
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
      externalWaterMask: Uint8Array.of(1, 0, 0, 0, 0, 0, 0, 0, 0),
      seaLevel: 0,
      bathymetry: new Int16Array(9),
    },
    climate: {
      precipitation: new Float32Array(9).fill(100.25),
      surfaceWetness: new Float32Array(9).fill(64 / 255),
      rainfallCodec: new Uint8Array(9).fill(100),
      potentialDemand: new Float32Array(9).fill(1),
      demandParameters: {
        tMinC: 0,
        tMaxC: 35,
        petBase: 18,
        petTemperatureWeight: 75,
        wetnessDampening: 0.55,
      },
    },
  };
}
function execute(
  unsupported = false,
  retained?: ReturnType<typeof hugeRoot17>,
  corruptPlan = false,
  receivingHead = retained?.externalWaterHead ?? forcing().topography.seaLevel,
  evolution: { cycles?: number; unsupportedSolve?: number; corruptTopography?: boolean; submergedLand?: boolean } = {}
) {
  // Desert's retained receipt used its own authored runoff law, not Earthlike's.
  const sourceRunoffConfig = retained?.height === 30
    ? { infiltrationFraction: 0.15, wetnessDampening: 0.25 }
    : { infiltrationFraction: 0.18, wetnessDampening: 0.22 };
  const runDimensions = retained ? { width: retained.width, height: retained.height } : dimensions;
  const runSetup = admitMapSetup({ ...setup, dimensions: runDimensions });
  const context = createMapContext({ setup: runSetup, adapter: new MockAdapter(runDimensions) });
  const input = retained
      ? {
          topography: {
            elevation: Int16Array.from(retained.elevation),
            landMask: Uint8Array.from(retained.externalWaterMask, (external) => external ? 0 : 1),
            externalWaterMask: Uint8Array.from(retained.externalWaterMask),
            seaLevel: receivingHead,
            bathymetry: new Int16Array(retained.width * retained.height),
          },
          climate: {
            ...forcing().climate,
            precipitation: Float32Array.from(retained.precipitation),
            rainfallCodec: Uint8Array.from(retained.precipitation, (sample) => Math.round(Math.min(200, sample))),
            potentialDemand: Float32Array.from(retained.potentialDemand),
            // Recover historical byte provenance, then admit the current F32
            // wetness. Retained runoff remains evidence, not the new oracle.
            surfaceWetness: Float32Array.from(retained.localRunoff, (runoff, cell) => {
              if (retained.externalWaterMask[cell]) return 0;
              if (retained.precipitation[cell] === 0) {
                if (runoff !== 0) throw new Error(`Nonzero retained runoff without precipitation at ${cell}.`);
                return 0;
              }
              for (let humidity = 0; humidity < 256; humidity++)
                if (
                  retained.precipitation[cell]! * (1 - sourceRunoffConfig.infiltrationFraction) * (1 - sourceRunoffConfig.wetnessDampening * (humidity / 255)) ===
                  runoff
                )
                  return humidity / 255;
              throw new Error(`No exact retained source humidity at ${cell}.`);
            }),
          },
        }
      : forcing(),
    calls: string[] = [],
    networkInputs: Parameters<typeof ops.computeBasinNetwork.run>[0][] = [];
  if (evolution.submergedLand) {
    input.topography.elevation[3] = -1;
    input.topography.elevation[4] = -2;
    input.climate.potentialDemand.fill(10000);
  }
  const runoffConfig = retained ? sourceRunoffConfig : ops.computeLocalRunoff.defaultConfig.config;
  const expectedRunoff = Array.from(input.climate.precipitation, (precipitation, cell) =>
    input.topography.externalWaterMask[cell]
      ? 0
      : precipitation * (1 - runoffConfig.infiltrationFraction) *
        (1 - runoffConfig.wetnessDampening * input.climate.surfaceWetness[cell]!)
  );
  const localRunoffInputs: Parameters<typeof ops.computeLocalRunoff.run>[0][] = [];
  function record<A extends unknown[], R>(name: string, run: (...args: A) => R) {
    return (...args: A): R => {
      calls.push(name);
      return run(...args);
    };
  }
  const bindings: Parameters<typeof NetworkStep.run>[2] = {
    computeChannelIncision: record("computeChannelIncision", terrainOps.computeChannelIncision.run),
    computeChannelTopography: record("computeChannelTopography", (
      input: Parameters<typeof terrainOps.computeChannelTopography.run>[0],
      config: Parameters<typeof terrainOps.computeChannelTopography.run>[1]
    ) => {
      const result = terrainOps.computeChannelTopography.run(input, config);
      if (evolution.corruptTopography) result.topography.landMask[1] = 2;
      return result;
    }),
    projectRiverNetwork: record("projectRiverNetwork", ops.projectRiverNetwork.run),
    computeLocalRunoff: record("computeLocalRunoff", (
      input: Parameters<typeof ops.computeLocalRunoff.run>[0],
      config: Parameters<typeof ops.computeLocalRunoff.run>[1]
    ) => {
      localRunoffInputs.push(input);
      return ops.computeLocalRunoff.run(input, config);
    }),
    computeDrainageBasins: record("computeDrainageBasins", ops.computeDrainageBasins.run),
    computeBasinNetwork: record(
      "computeBasinNetwork",
      (
        input: Parameters<typeof ops.computeBasinNetwork.run>[0],
        config: Parameters<typeof ops.computeBasinNetwork.run>[1]
      ): ReturnType<typeof ops.computeBasinNetwork.run> => {
        networkInputs.push(input);
        if (unsupported || networkInputs.length === evolution.unsupportedSolve)
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
      publishTestArtifact(stepContext, landArtifacts.initialTopography, input.topography);
      publishTestArtifact(stepContext, erosionArtifacts.substrate, {
        erodibilityK: new Float32Array(runDimensions.width * runDimensions.height).fill(0.3),
        sedimentDepth: new Float32Array(runDimensions.width * runDimensions.height).fill(0.2),
      });
      publishTestArtifact(stepContext, climateArtifacts.baselineClimateField, input.climate);
      NetworkStep.run(
        stepContext,
        (() => {
          const selected = authored();
          selected.terrainEvolution.cycles = evolution.cycles ?? 0;
          const compiled = compile(selected);
          return retained
            ? {
                ...compiled,
                computeLocalRunoff: {
                  ...compiled.computeLocalRunoff,
                  config: sourceRunoffConfig,
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
  return { context, calls, input, failure, networkInputs, localRunoffInputs, expectedRunoff };
}

describe("hydrology network authoring and dispatch", () => {
  it("composes float forcing at explicit receiving heads with all retained finite barrier sources", () => {
    // These are generated-geometry discriminators, not unmodified receipt
    // replay: the prescribed heads meet the finite sills at 25, 31 and 40.
    for (const { retained, head, wetCountAtZeroHead } of [
      { retained: hugeRoot17(), head: 25, wetCountAtZeroHead: 0 },
      { retained: desertHugeRoot19(), head: 31, wetCountAtZeroHead: 6 },
      { retained: standardRoots37And39(), head: 40, wetCountAtZeroHead: 4 },
    ]) {
      const before = structuredClone(retained),
        result = execute(false, retained, false, head);
      expect(result.failure).toBeUndefined();
      const hydro = readArtifact(result.context, waterArtifacts.hydrography);
      const lake = readArtifact(result.context, waterArtifacts.lakePlan);
      const metadata = readArtifact(result.context, waterArtifacts.riverNetwork);
      if (lake.model !== "certified-sill-spill" || metadata.model !== "certified-sill-spill")
        throw new Error("Wrong model.");
      expect(hydro.runoff).toEqual(result.expectedRunoff);
      const historicalRunoffL1Delta = result.expectedRunoff.reduce(
        (sum, runoff, cell) => sum + Math.abs(runoff - retained.localRunoff[cell]!), 0
      );
      expect(historicalRunoffL1Delta).toBeGreaterThan(0);
      expect(result.networkInputs).toHaveLength(1);
      expect(result.networkInputs[0]!.externalWaterHead).toBe(head);
      expect(result.networkInputs[0]!.localRunoff).toEqual(result.expectedRunoff);
      expect(result.networkInputs[0]!.precipitation).toBe(result.input.climate.precipitation);
      expect(result.localRunoffInputs[0]!.precipitation).toBe(result.input.climate.precipitation);
      expect(result.localRunoffInputs[0]!.surfaceWetness).toBe(result.input.climate.surfaceWetness);
      expect(Object.hasOwn(result.networkInputs[0]!, "rainfallCodec")).toBe(false);
      expect(Object.hasOwn(result.localRunoffInputs[0]!, "rainfallCodec")).toBe(false);
      expect(result.networkInputs[0]!.potentialDemand).toEqual(retained.potentialDemand);
      expect(retained).toEqual(before);
      expect("certificates" in lake).toBe(false);
      expect(lake.waterSurface.every(Number.isFinite)).toBe(true);
      const finiteSourceCount = retained.externalWaterMask.reduce((count, external) => count + (external ? 0 : 1), 0);
      expect(lake.pools).toHaveLength(1);
      expect(lake.pools[0]!.catchmentCells).toHaveLength(finiteSourceCount);
      for (let cell = 0; cell < retained.elevation.length; cell++) {
        if (retained.externalWaterMask[cell]) expect(lake.waterSurface[cell]).toBe(head);
        if (retained.elevation[cell] === 1000) {
          expect(retained.externalWaterMask[cell]).toBe(0);
          expect([hydro.runoff[cell], result.input.climate.precipitation[cell], result.input.climate.potentialDemand[cell]]).toEqual([0, 0, 0]);
        }
      }
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
      if (retained.height === 3) {
        expect(lake.bodies[0]!.wetCells).toEqual([43]);
        expect(lake.waterSurface[43]).toBe(24);
        expect(hydro.terminalType[43]).toBe(3);
        expect(metadata.mouthType[149]).toBe(2);
      } else if (retained.height === 30) {
        expect(lake.plannedLakeTileCount).toBe(14);
        expect(lake.pools[0]!.level).toBe(30);
        expect(lake.pools[0]!.flux.incomingOverflow).toBe(0);
        expect(lake.pools[0]!.flux.wetPrecipitation).toBe(749);
        expect(lake.pools[0]!.flux.wetDemand).toBe(1930.1474609375);
      } else {
        expect(
          lake.transfers.find((edge) => edge.cellA === 228 && edge.cellB === 312)!.signedDischarge
        ).toBe(-hydro.discharge[312]!);
        expect(lake.bodies.find((body) => body.wetCells.includes(228))!.outflow).toBe(0);
        expect(hydro.flowDir[312]).toBe(228);
        expect(hydro.discharge[312]).toBeGreaterThan(0);
        expect(hydro.flowDir[396]).toBe(395);
        expect(hydro.discharge[396]).toBeGreaterThan(0);
        expect(metadata.upstreamArea[312]).toBe(419);
        expect(metadata.mouthType[312]).toBe(2);
        expect(metadata.mouthBodyId[312]).toBe(lake.bodyId[228]);
        expect(metadata.mouthType[396]).toBe(1);
      }
      let dryRunoff = 0, wetPrecipitation = 0, wetDemand = 0;
      for (let cell = 0; cell < retained.elevation.length; cell++) {
        if (retained.externalWaterMask[cell]) continue;
        if (lake.lakeMask[cell]) {
          wetPrecipitation += result.input.climate.precipitation[cell]!;
          wetDemand += result.input.climate.potentialDemand[cell]!;
        } else dryRunoff += result.expectedRunoff[cell]!;
      }
      const ledger = lake.conservation;
      expect(Math.abs(ledger.dryRunoff - dryRunoff)).toBeLessThanOrEqual(ledger.roundoffBound);
      expect(ledger.wetPrecipitation).toBe(wetPrecipitation);
      expect(ledger.wetDemand).toBe(wetDemand);
      expect(Math.abs(ledger.externalDischarge + ledger.unresolvedResidual -
        (dryRunoff + wetPrecipitation - wetDemand))).toBeLessThanOrEqual(ledger.roundoffBound);
      expect(Math.abs(ledger.residual)).toBeLessThanOrEqual(ledger.roundoffBound);
      const zeroHead = execute(false, retained, false, 0);
      expect(zeroHead.failure).toBeUndefined();
      const zeroHeadHydro = readArtifact(zeroHead.context, waterArtifacts.hydrography);
      const zeroHeadLake = readArtifact(zeroHead.context, waterArtifacts.lakePlan);
      expect(zeroHeadHydro.runoff).toEqual(zeroHead.expectedRunoff);
      expect(zeroHead.networkInputs[0]!.potentialDemand).toEqual(retained.potentialDemand);
      expect(zeroHeadLake.plannedLakeTileCount).toBe(wetCountAtZeroHead);
      expect(zeroHeadLake.pools).not.toEqual(lake.pools);
    }
  });

  it("rejects a contradictory cross-product before the first publication", () => {
    const result = execute(false, undefined, true);
    expect(result.failure).toBeDefined();
    for (const artifact of [
      erosionArtifacts.topography,
      waterArtifacts.hydrography,
      waterArtifacts.lakePlan,
      waterArtifacts.riverNetwork,
    ])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });
  it("rejects inactive public controls and forwards only the selected authored envelopes", () => {
    const selected = authored();
    if (selected.water.model !== "certified-sill-spill") throw new Error("Wrong fixture branch.");
    selected.water.computeLocalRunoff.config.infiltrationFraction = 0.37;
    const compiled = compile(selected);
    expect(compiled.computeLocalRunoff.config.infiltrationFraction).toBe(0.37);
    expect(Object.keys(compiled).sort()).toEqual(["classifyBasinRiverNetwork", "computeBasinNetwork", "computeChannelIncision", "computeChannelTopography", "computeDrainageBasins", "computeLocalRunoff", "projectRiverNetwork", "terrainEvolution"]);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...selected,
        water: { ...selected.water, lakeiness: "few" },
      })
    ).toBe(false);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...selected,
        water: { ...selected.water, accumulateDischarge: { strategy: "topological-runoff", config: {} } },
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

  it("preserves relative river density without introducing water-footprint quotas", () => {
    const neutral = authored();
    neutral.projectRiverNetwork.config.minorPercentile = 0.86;
    neutral.projectRiverNetwork.config.majorPercentile = 0.96;
    const normal = compile(neutral);
    const dense = compile({ ...neutral, knobs: { riverDensity: "dense" } });
    expect(normal.projectRiverNetwork.config.minorPercentile).toBe(0.86);
    expect(normal.projectRiverNetwork.config.majorPercentile).toBe(0.96);
    expect(dense.projectRiverNetwork.config.minorPercentile).toBeCloseTo(0.79);
    expect(dense.projectRiverNetwork.config.majorPercentile).toBeCloseTo(0.92);
    expect(dense.computeBasinNetwork).toEqual(normal.computeBasinNetwork);
  });

  it("strictly rejects retired models, private selectors, strategies and old water controls", () => {
    const selected = authored();
    for (const water of [
      { ...selected.water, model: "legacy-sink-budget" },
      { ...selected.water, model: "unknown-model" },
      { ...selected.water, planLakes: { strategy: "sink-discharge-budget", config: {} } },
      { ...selected.water, computeBasinNetwork: { strategy: "sink-discharge-budget", config: {} } },
      { ...selected.water, computeDrainageBasins: { strategy: "priority-flood", config: {} } },
    ]) expect(Value.Check(stage.surfaceSchema, { ...selected, water })).toBe(false);
    const config = compile(selected);
    expect(Value.Check(NetworkStep.contract.schema, { ...config, model: "certified-sill-spill" })).toBe(false);
    expect(Value.Check(NetworkStep.contract.schema, { ...config, planLakes: {} })).toBe(false);
  });

  it("executes only the certified operations and publishes one consistent preserved-ground generation", () => {
    const result = execute();
    expect(result.failure).toBeUndefined();
    expect(result.calls).toEqual([
      "computeLocalRunoff",
      "computeChannelTopography",
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
      } else expect(lake.waterSurface[cell]).toBe(result.input.topography.externalWaterMask[cell] ? result.input.topography.seaLevel : result.input.topography.elevation[cell]);
    }
    expect(result.input.topography).toEqual(forcing().topography);
    expect(readArtifact(result.context, erosionArtifacts.topography)).toEqual(result.input.topography);
  });

  it("retains unsupported evidence and publishes none of the physical products or later classifications", () => {
    const result = execute(true);
    expect(String(result.failure)).toContain("persistent-surplus");
    expect(result.calls).toEqual([
      "computeLocalRunoff",
      "computeChannelTopography",
      "computeDrainageBasins",
      "computeBasinNetwork",
    ]);
    for (const artifact of [
      erosionArtifacts.topography,
      waterArtifacts.hydrography,
      waterArtifacts.lakePlan,
      waterArtifacts.riverNetwork,
    ])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });

  it("re-solves each precise cycle and classifies only the once-sealed final ground", () => {
    const result = execute(false, undefined, false, 0, { cycles: 2 });
    expect(result.failure).toBeUndefined();
    expect(result.calls).toEqual([
      "computeLocalRunoff", "computeDrainageBasins", "computeBasinNetwork", "computeChannelIncision",
      "computeDrainageBasins", "computeBasinNetwork", "computeChannelIncision",
      "computeChannelTopography", "computeDrainageBasins", "computeBasinNetwork",
      "projectRiverNetwork", "classifyBasinRiverNetwork",
    ]);
    expect(result.networkInputs).toHaveLength(3);
    expect(result.networkInputs[0]!.elevation).toEqual(Array.from(result.input.topography.elevation));
    expect(result.networkInputs[1]!.elevation.some((height) => !Number.isInteger(height))).toBe(true);
    const final = readArtifact(result.context, erosionArtifacts.topography);
    expect(result.networkInputs[2]!.elevation).toEqual(Array.from(final.elevation));
    expect(final.elevation).not.toEqual(result.input.topography.elevation);
    expect(final.landMask).toEqual(result.input.topography.landMask);
    expect(final.externalWaterMask).toEqual(result.input.topography.externalWaterMask);
    expect(final.bathymetry).toEqual(result.input.topography.bathymetry);
    for (const input of result.networkInputs) {
      expect(input.precipitation).toBe(result.input.climate.precipitation);
      expect(input.potentialDemand).toBe(result.input.climate.potentialDemand);
      expect(input.localRunoff).toBe(result.networkInputs[0]!.localRunoff);
    }
    const lake = readArtifact(result.context, waterArtifacts.lakePlan);
    const hydro = readArtifact(result.context, waterArtifacts.hydrography);
    for (let cell = 0; cell < final.elevation.length; cell++)
      if (hydro.exposedLandMask[cell] === 1) expect(lake.waterSurface[cell]).toBe(final.elevation[cell]);
    expect(result.input.topography).toEqual(forcing().topography);
  });

  it("refuses unsupported intermediate or final solves before publishing any final product", () => {
    for (const unsupportedSolve of [2, 3]) {
      const result = execute(false, undefined, false, 0, { cycles: 2, unsupportedSolve });
      expect(String(result.failure)).toContain("persistent-surplus");
      expect(result.networkInputs).toHaveLength(unsupportedSolve);
      expect(result.calls).not.toContain("projectRiverNetwork");
      for (const artifact of [erosionArtifacts.topography, waterArtifacts.hydrography, waterArtifacts.lakePlan, waterArtifacts.riverNetwork])
        expect(() => readArtifact(result.context, artifact)).toThrow();
    }
  });

  it("preserves initially submerged land when finite storage resolves it as exposed ground", () => {
    const result = execute(false, undefined, false, 0, { cycles: 2, submergedLand: true });
    expect(result.failure).toBeUndefined();
    expect(result.networkInputs).toHaveLength(3);
    const final = readArtifact(result.context, erosionArtifacts.topography);
    const hydro = readArtifact(result.context, waterArtifacts.hydrography);
    expect(result.input.topography.landMask[3]).toBe(1);
    expect(hydro.exposedLandMask[3]).toBe(1);
    expect(hydro.discharge[3]).toBeGreaterThan(0);
    expect(final.elevation[3]).toBe(-1);
    expect(final.elevation[4]).toBe(-2);
    for (const input of result.networkInputs) {
      expect(input.elevation[3]).toBe(-1);
      expect(input.elevation[4]).toBe(-2);
    }
  });

  it("admits final topography with the whole physical group before first publication", () => {
    const result = execute(false, undefined, false, 0, { corruptTopography: true });
    expect(String(result.failure)).toContain("Invalid topography");
    for (const artifact of [erosionArtifacts.topography, waterArtifacts.hydrography, waterArtifacts.lakePlan, waterArtifacts.riverNetwork])
      expect(() => readArtifact(result.context, artifact)).toThrow();
  });
});
