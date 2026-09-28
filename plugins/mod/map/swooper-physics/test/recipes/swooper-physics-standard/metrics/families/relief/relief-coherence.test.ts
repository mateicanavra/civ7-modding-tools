import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";

import { measureStandardReliefCoherence } from "../../../../../../src/recipes/standard/metrics/families/relief-coherence.js";
import {
  measureStandardMapCapture,
  type StandardMapMetricCohort,
} from "../../../../../../src/recipes/standard/metrics/sample.js";
import { RELIEF_COHERENCE_STUDY } from "../../../../../../src/recipes/standard/metrics/studies/benchmarks/relief-coherence.study.js";
import { RELIEF_COHERENCE_COHORT_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/relief-coherence.js";
import { reliefCoherenceFixture } from "../../fixtures/relief-coherence.js";
import {
  captureEarthlikeScenario,
  measureEarthlikeSample,
} from "../../fixtures/standard-product.js";

describe("Standard neutral relief coherence", () => {
  it("distinguishes high plateaus from rugged peaks and caps deterministic representatives", () => {
    const plateau = reliefCoherenceFixture();
    plateau.model.elevation.fill(400);
    plateau.model.mountainMask.fill(1);
    const rugged = structuredClone(plateau);
    rugged.model.elevation[7] = 700;
    const flat = measureStandardReliefCoherence(plateau).planned.mountain;
    const peak = measureStandardReliefCoherence(rugged).planned.mountain;
    expect(flat.aboveSeaHeight?.mean).toBe(400);
    expect(flat.localRelief?.maximum).toBe(0);
    expect(flat.localProminenceProxy?.maximum).toBe(0);
    expect(
      flat.representatives.relativeHighAltitudeLowReliefCandidates.map((t) => t.index)
    ).toEqual([0, 1, 2, 3, 4]);
    expect(flat.representatives.highestAboveSeaHeight.map((t) => t.index)).toEqual([0, 1, 2, 3, 4]);
    expect(peak.localRelief?.maximum).toBe(300);
    expect(peak.localProminenceProxy?.maximum).toBe(300);
    expect(peak.representatives.highestAboveSeaHeight[0]?.index).toBe(7);
    expect(
      peak.representatives.relativeHighAltitudeLowReliefCandidates.map((t) => t.index)
    ).not.toContain(7);
  });

  it("is invariant under a common physical, sea-level, and routing datum shift", () => {
    const base = reliefCoherenceFixture();
    base.model.elevation.set([20, 50, 100, 200, 300, 150]);
    base.model.mountainMask[4] = 1;
    base.model.foothillMask[3] = 1;
    base.model.windU.fill(10);
    base.model.riverClass[3] = 1;
    base.model.flowDir[3] = 4;
    const shifted = {
      ...base,
      model: {
        ...base.model,
        seaLevel: base.model.seaLevel + 200,
        elevation: Int16Array.from(base.model.elevation, (e) => e + 200),
        routingElevation: Float32Array.from(base.model.routingElevation, (e) => e + 200),
      },
    };
    expect(measureStandardReliefCoherence(shifted)).toEqual(measureStandardReliefCoherence(base));
    expect(() =>
      measureStandardReliefCoherence({ ...base, model: { ...base.model, seaLevel: Number.NaN } })
    ).toThrow("finite seaLevel");
  });

  it("uses disjoint planned precedence and independent observed-land populations", () => {
    const input = reliefCoherenceFixture(6, 1);
    input.model.mountainMask.set([1, 0, 0, 0, 0, 0]);
    input.model.foothillMask.set([1, 1, 0, 0, 0, 0]);
    input.model.roughLandMask.set([1, 1, 1, 0, 0, 0]);
    input.observation.terrain.set([1, 2, 3, 99, 3, 3]);
    input.observation.isWater[5] = 1;
    const result = measureStandardReliefCoherence(input);
    expect(Object.values(result.planned).map((g) => g.tiles.count)).toEqual([1, 1, 1, 3]);
    expect(Object.values(result.observed).map((g) => g.tiles.count)).toEqual([1, 1, 2, 1]);
    expect(result.plannedLandTiles).toBe(6);
    expect(result.observedLandTiles).toBe(5);
  });

  it("uses odd/even row adjacency, X wrapping, Y clipping, and unique comparison edges", () => {
    for (const [source, expectedNeighbors] of [
      [0, [1, 5, 6, 11]],
      [7, [1, 2, 6, 8, 13, 14]],
    ] as const) {
      const input = reliefCoherenceFixture();
      input.model.elevation.set(Array.from({ length: 18 }, (_, i) => i * 10));
      input.model.elevation[source] = 300;
      input.model.mountainMask[source] = 1;
      input.model.foothillMask.fill(1);
      const result = measureStandardReliefCoherence(input);
      const contrast = result.edgeContrasts.plannedMountainFoothill;
      expect(contrast.edgeCount).toBe(expectedNeighbors.length);
      expect(contrast.signedHeightDifference?.mean).toBeCloseTo(
        300 - expectedNeighbors.reduce((sum, i) => sum + i * 10, 0) / expectedNeighbors.length
      );
      expect(contrast.representatives.map((e) => e.receiver)).toEqual(
        [...expectedNeighbors].slice(0, 5)
      );
      expect(result.planned.mountain.localRelief?.maximum).toBe(290);
      expect(result.planned.mountain.localProminenceProxy?.mean).toBeCloseTo(
        contrast.signedHeightDifference!.mean
      );
    }
    const narrow = reliefCoherenceFixture(2, 1);
    narrow.model.mountainMask[0] = 1;
    narrow.model.foothillMask[1] = 1;
    expect(
      measureStandardReliefCoherence(narrow).edgeContrasts.plannedMountainFoothill.edgeCount
    ).toBe(1);
  });

  it("returns null for empty and isolated groups instead of fabricated zero statistics", () => {
    const single = reliefCoherenceFixture(1, 1);
    const result = measureStandardReliefCoherence(single);
    expect(result.planned.mountain.tiles).toEqual({ count: 0, population: 1 });
    expect(result.planned.mountain.aboveSeaHeight).toBeNull();
    expect(result.planned.otherLand.localRelief).toBeNull();
    expect(result.planned.otherLand.localProminenceProxy).toBeNull();
    expect(result.withinRowElevationTemperature).toEqual({
      pairCount: 0,
      contributingRows: 0,
      slope: null,
      pearson: null,
    });
    expect(result.authoredRiverEdges.physicalReceiverMinusSource).toBeNull();
    single.model.windU[0] = 1;
    expect(
      measureStandardReliefCoherence(single).windRainfallAssociation.groups.unscored.tiles.count
    ).toBe(1);
    single.model.landMask.fill(0);
    single.observation.isWater.fill(1);
    const water = measureStandardReliefCoherence(single);
    expect(water.plannedLandTiles).toBe(0);
    expect(water.observedLandTiles).toBe(0);
    expect(water.windRainfallAssociation.baseline.pearson).toBeNull();
  });

  it("partitions marine and planned/observed lake shore proxies without native cliff claims", () => {
    const input = reliefCoherenceFixture(4, 1);
    input.model.elevation.set([100, 50, 100, -20]);
    input.model.plannedLakeMask[1] = 1;
    input.model.landMask[3] = 0;
    input.observation.isWater.set([0, 1, 0, 1]);
    input.observation.terrain[3] = input.observation.oceanTerrain;
    input.observation.isLake[1] = 1;
    const coasts = measureStandardReliefCoherence(input).coastalProxies;
    for (const coast of [coasts.planned, coasts.observed]) {
      expect(coast.coastalLand).toEqual({ count: 2, population: 2 });
      expect(coast.landByAdjacency.both.tiles.count).toBe(2);
      expect(coast.landByAdjacency.lakeOnly.aboveSeaHeight).toBeNull();
      expect(coast.lakeEdges.edgeCount).toBe(2);
      expect(coast.lakeEdges.signedHeightDifference?.mean).toBe(50);
      expect(coast.marineEdges.signedHeightDifference?.mean).toBe(120);
    }
    input.observation.isLake[1] = 0;
    input.observation.terrain[1] = input.observation.coastTerrain;
    const changed = measureStandardReliefCoherence(input).coastalProxies;
    expect(changed.planned.lakeEdges.edgeCount).toBe(2);
    expect(changed.observed.lakeEdges.edgeCount).toBe(0);
    expect(changed.observed.landByAdjacency.marineOnly.tiles.count).toBe(2);
    input.observation.terrain[1] = 99;
    const navigable = measureStandardReliefCoherence(input).coastalProxies.observed;
    expect(navigable.otherWaterEdges.edgeCount).toBe(2);
    expect(navigable.marineEdges.edgeCount).toBe(2);
    expect(navigable.landByAdjacency.marineAndOtherWater.tiles.count).toBe(2);
  });

  it("retains all planned-lake terrain and volcano overlaps independently of rivers", () => {
    const input = reliefCoherenceFixture(6, 1);
    input.model.plannedLakeMask.fill(1);
    input.model.mountainMask[0] = 1;
    input.model.foothillMask[1] = 1;
    input.model.roughLandMask[2] = 1;
    input.model.volcanoMask[0] = 1;
    input.model.landMask[5] = 0;
    const result = measureStandardReliefCoherence(input);
    expect(result.authoredRiverEdges.authoredTiles).toBe(0);
    expect(result.plannedLakeOverlap.tiles).toEqual({ count: 6, population: 6 });
    expect(Object.values(result.plannedLakeOverlap.byPlannedClass).map((c) => c.count)).toEqual([
      1, 1, 1, 2, 1,
    ]);
    expect(result.plannedLakeOverlap.volcanoTiles).toEqual({ count: 1, population: 6 });
    expect(result.plannedLakeOverlap.representatives[0]?.volcano).toBe(true);
  });

  it("retains above/equal/below mountain comparisons, including inverted terrain labels", () => {
    const input = reliefCoherenceFixture(4, 2);
    input.model.mountainMask[0] = 1;
    input.model.elevation[1] = 50;
    input.model.elevation[3] = 150;
    const edges = measureStandardReliefCoherence(input).edgeContrasts.plannedMountainOtherLand;
    expect(edges.sourceAboveReceiver).toEqual({ count: 1, population: 4 });
    expect(edges.sourceEqualReceiver).toEqual({ count: 2, population: 4 });
    expect(edges.sourceBelowReceiver).toEqual({ count: 1, population: 4 });
  });

  it("removes latitude-row temperature covariance but retains a within-row lapse signal", () => {
    const input = reliefCoherenceFixture(4, 3);
    for (let y = 0; y < 3; y += 1)
      for (let x = 0; x < 4; x += 1) {
        input.model.elevation[y * 4 + x] = 100 * y + 10 * x;
        input.model.surfaceTemperature[y * 4 + x] = 30 - 10 * y;
      }
    expect(measureStandardReliefCoherence(input).withinRowElevationTemperature.pearson).toBeNull();
    expect(measureStandardReliefCoherence(input).withinRowElevationTemperature.slope).toBeNull();
    for (let i = 0; i < 12; i += 1)
      input.model.surfaceTemperature[i] -= input.model.elevation[i]! / 10;
    const lapse = measureStandardReliefCoherence(input).withinRowElevationTemperature;
    expect(lapse.pairCount).toBe(12);
    expect(lapse.contributingRows).toBe(3);
    expect(lapse.slope).toBeCloseTo(-0.1);
    expect(lapse.pearson).toBeCloseTo(-1);
    input.model.surfaceTemperature.fill(Number.NaN);
    expect(measureStandardReliefCoherence(input).withinRowElevationTemperature.pairCount).toBe(0);
  });

  it("reverses wind-aligned associations, demeans rainfall rows, and separates calm", () => {
    const input = reliefCoherenceFixture(6, 1);
    input.model.elevation.set([0, 10, 20, 30, 40, 50]);
    input.model.windU.fill(10);
    input.model.baselineRainfall.set([80, 110, 110, 110, 110, 80]);
    input.model.refinedRainfall.set([70, 115, 115, 115, 115, 70]);
    const east = measureStandardReliefCoherence(input).windRainfallAssociation;
    expect(east.groups.uphill.tiles.count).toBe(4);
    expect(east.groups.downhill.tiles.count).toBe(2);
    expect(east.groups.uphill.baselineRainfallRowResidual?.mean).toBe(10);
    expect(east.groups.downhill.baselineRainfallRowResidual?.mean).toBe(-20);
    expect(east.baseline.pearson).toBeCloseTo(1);
    input.model.windU.fill(-10);
    const west = measureStandardReliefCoherence(input).windRainfallAssociation;
    expect(west.groups.uphill.tiles.count).toBe(2);
    expect(west.baseline.pearson).toBeCloseTo(-1);
    input.model.windU.fill(0);
    const calm = measureStandardReliefCoherence(input).windRainfallAssociation;
    expect(calm.groups.calm.tiles.count).toBe(6);
    expect(calm.baseline.pairCount).toBe(0);
    expect(calm.baseline.pearson).toBeNull();
    expect(calm.groups.calm.alignedGradient).toBeNull();
    input.model.windV.fill(10);
    expect(
      measureStandardReliefCoherence(input).windRainfallAssociation.groups.zero.tiles.count
    ).toBe(6);
  });

  it("measures odd/even diagonal wind vectors rather than wrapped raw-coordinate deltas", () => {
    const input = reliefCoherenceFixture(6, 3);
    input.model.elevation.fill(0);
    input.model.elevation[2] = 90;
    input.model.windU[7] = 10;
    const odd = measureStandardReliefCoherence(input).windRainfallAssociation;
    expect(odd.groups.uphill.tiles.count).toBe(1);
    input.model.windU[7] = -10;
    expect(
      measureStandardReliefCoherence(input).windRainfallAssociation.groups.downhill.tiles.count
    ).toBe(1);
    input.model.windU.fill(0);
    input.model.elevation.fill(0);
    input.model.elevation[11] = 90;
    input.model.windU[0] = 10;
    expect(
      measureStandardReliefCoherence(input).windRainfallAssociation.groups.downhill.tiles.count
    ).toBe(1);
  });

  it("separates physical uphill from downhill routing with terrain and lake overlap", () => {
    const input = reliefCoherenceFixture(6, 1);
    input.model.elevation.set([10, 30, 60, 100, 150, 210]);
    input.model.routingElevation.set([100, 90, 80, 70, 60, 50]);
    input.model.riverClass.fill(1);
    input.model.flowDir.set([1, 2, 3, 4, -1, 0]);
    input.model.mountainMask[0] = 1;
    input.model.foothillMask[1] = 1;
    input.model.roughLandMask[2] = 1;
    input.model.plannedLakeMask.set([0, 1, 0, 1, 0, 0]);
    input.observation.isLake.set([0, 0, 1, 1, 0, 0]);
    input.observation.isWater.set([0, 0, 1, 1, 0, 0]);
    input.observation.terrain.set([1, 2, 3, 3, 3, 3]);
    const river = measureStandardReliefCoherence(input).authoredRiverEdges;
    expect(river.physicalUphill).toEqual({ count: 4, population: 5 });
    expect(river.terminalTiles.count).toBe(1);
    expect(river.representatives.physicalUphill[0]).toEqual({
      source: 3,
      receiver: 4,
      physicalReceiverMinusSource: 50,
      routingReceiverMinusSource: -10,
    });
    expect(river.physicalUphillByPlannedClass.mountain).toEqual({ count: 1, population: 1 });
    expect(river.physicalUphillByObservedClass.nonLand).toEqual({ count: 2, population: 2 });
    expect(Object.values(river.physicalUphillByLakeClass).map((c) => c.count)).toEqual([
      1, 1, 1, 1,
    ]);
    expect(Object.values(river.lakeOverlap).map((c) => c.count)).toEqual([2, 1, 1, 1]);
  });

  it("accounts for terminal, invalid, nonneighbor, and nonfinite receiver edges separately", () => {
    const input = reliefCoherenceFixture(6, 1);
    input.model.riverClass.fill(1);
    input.model.flowDir.set([-1, 99, 2, 0, -2, 0]);
    let river = measureStandardReliefCoherence(input).authoredRiverEdges;
    expect(river.terminalTiles.count).toBe(1);
    expect(river.invalidReceiverTiles.count).toBe(4);
    expect(river.validReceiverTiles.count).toBe(1);
    expect(river.representatives.invalidReceiverSources).toEqual([1, 2, 3, 4]);
    input.model.routingElevation[0] = Number.NaN;
    river = measureStandardReliefCoherence(input).authoredRiverEdges;
    expect(river.validReceiverTiles.count).toBe(1);
    expect(river.finiteDropEdges.count).toBe(0);
    expect(river.physicalReceiverMinusSource).toBeNull();
    expect(river.routingReceiverMinusSource).toBeNull();
  });

  it("captures datum and independent routing arrays and composes the family", () => {
    const capture = captureEarthlikeScenario();
    expect(Number.isFinite(capture.model.seaLevel)).toBe(true);
    expect(capture.model.flowDir).toBeInstanceOf(Int32Array);
    expect(capture.model.routingElevation).toBeInstanceOf(Float32Array);
    expect(capture.model.flowDir.length).toBe(capture.model.elevation.length);
    const expected = measureStandardReliefCoherence(capture);
    expect(measureStandardMapCapture(capture).metrics.relief.coherence).toEqual(expected);
    const fresh = captureEarthlikeScenario();
    capture.model.flowDir[0] = 123;
    capture.model.routingElevation[0] = -123;
    expect(fresh.model.flowDir[0]).not.toBe(123);
    expect(fresh.model.routingElevation[0]).not.toBe(-123);
  }, 30_000);

  it("registers exactly twelve cases with structural targets, rejecting missing or invalid populations", () => {
    expect(RELIEF_COHERENCE_STUDY.scenarios.length).toBe(12);
    const base = measureEarthlikeSample();
    const samples = RELIEF_COHERENCE_STUDY.scenarios.map((scenario) => ({
      ...base,
      provenance: {
        ...base.provenance,
        configurationId: scenario.config.id,
        mapSizeId: scenario.preset.id,
        mapSeed: scenario.mapSeed,
        gameSeed: scenario.gameSeed,
        ...scenario.preset.dimensions,
      },
    }));
    const [first, ...rest] = samples;
    if (!first) throw new Error("Missing fixture cohort.");
    const cohort: StandardMapMetricCohort = [first, ...rest];
    expect(evaluateMetricTargets(cohort, [RELIEF_COHERENCE_COHORT_TARGET])[0]?.status).toBe("pass");
    expect(
      evaluateMetricTargets([first, ...rest.slice(1)], [RELIEF_COHERENCE_COHORT_TARGET])[0]?.status
    ).toBe("fail");
    expect(
      evaluateMetricTargets([first, first, ...rest.slice(1)], [RELIEF_COHERENCE_COHORT_TARGET])[0]
        ?.status
    ).toBe("fail");
    const invalid = structuredClone(cohort);
    const badFirst = invalid[0];
    const broken = {
      ...badFirst,
      metrics: {
        ...badFirst.metrics,
        relief: {
          ...badFirst.metrics.relief,
          coherence: { ...badFirst.metrics.relief.coherence, plannedLandTiles: -1 },
        },
      },
    };
    expect(
      evaluateMetricTargets([broken, ...rest], [RELIEF_COHERENCE_COHORT_TARGET])[0]?.status
    ).toBe("fail");
  }, 30_000);
});
