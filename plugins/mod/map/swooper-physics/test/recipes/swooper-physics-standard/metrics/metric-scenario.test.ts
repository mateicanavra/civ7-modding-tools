import { describe, expect, it } from "bun:test";

import { FEATURE_PLACEMENT_KEYS, getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { admitStandardMapConfig } from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import { captureStandardMapScenario } from "../../../../src/recipes/standard/metrics/capture.js";
import { measureStandardMapCapture } from "../../../../src/recipes/standard/metrics/sample.js";
import { defineStandardMapMetricScenario } from "../../../../src/recipes/standard/metrics/scenario.js";
import { EARTHLIKE_BIOME_STRUCTURE_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/earthlike-biome-structure.study.js";
import { EARTHLIKE_RELIEF_REPRESENTATIVE_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/earthlike-relief-representative.study.js";
import {
  evaluateStandardMetricStudies,
  standardMetricScenarioIdentity,
  standardProductMetricScenario,
} from "../../../../src/recipes/standard/metrics/studies/index.js";
import { EARTHLIKE_BIOME_STRUCTURE_TARGET } from "../../../../src/recipes/standard/metrics/targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../src/recipes/standard/metrics/targets/integrity.js";
import { EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET } from "../../../../src/recipes/standard/metrics/targets/relief.js";
import { TEST_GAME_SEED, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

const standardPreset = getCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
const earthlikeConfig = admitStandardMapConfig(swooperEarthlikeRaw);
const FORGED_NON_CIV7_DIMENSIONS = { width: 48, height: 28 } as const;
const ABSURD_CUSTOM_DIMENSIONS = {
  width: 2_147_483_647,
  height: 2_147_483_647,
} as const;
const STANDARD_SCENARIO_IDENTITY = standardMetricScenarioIdentity(
  standardPreset,
  TEST_MAP_SEED,
  TEST_GAME_SEED
);

describe("Standard metric scenario admission", () => {
  it("retains one complete Civ7 preset selection without inferred dimensions", () => {
    const scenario = defineStandardMapMetricScenario({
      kind: "civ7-preset",
      id: "earthlike-standard",
      config: earthlikeConfig,
      preset: standardPreset,
      ...STANDARD_SCENARIO_IDENTITY,
    });

    expect(scenario.kind).toBe("civ7-preset");
    if (scenario.kind !== "civ7-preset") throw new Error("Expected a preset scenario.");
    expect(scenario.preset.dimensions).toEqual(standardPreset.dimensions);
    expect(scenario.preset.mapInfo).toEqual(standardPreset.mapInfo);
  });

  it("refuses custom selections whose dimensions and map metadata disagree", () => {
    expect(() =>
      captureStandardMapScenario(
        defineStandardMapMetricScenario({
          ...validCustomScenario(),
          mapInfo: { ...standardPreset.mapInfo, GridWidth: standardPreset.dimensions.width + 1 },
        })
      )
    ).toThrow("refused semantic admission");
  });

  it("refuses custom selections that cannot seat their declared players", () => {
    expect(() =>
      captureStandardMapScenario(
        defineStandardMapMetricScenario({
          ...validCustomScenario(),
          mapInfo: { ...standardPreset.mapInfo, PlayersLandmass1: 0, PlayersLandmass2: 0 },
        })
      )
    ).toThrow("refused semantic admission");
  });

  it("refuses an absurd custom grid before allocating metric adapter buffers", () => {
    expect(() =>
      captureStandardMapScenario({
        ...validCustomScenario(),
        dimensions: ABSURD_CUSTOM_DIMENSIONS,
        mapInfo: {
          ...standardPreset.mapInfo,
          GridWidth: ABSURD_CUSTOM_DIMENSIONS.width,
          GridHeight: ABSURD_CUSTOM_DIMENSIONS.height,
        },
      })
    ).toThrow("Map setup tile count must fit a signed 32-bit grid index.");
  });

  it("refuses unstable custom map-size identities", () => {
    expect(() =>
      defineStandardMapMetricScenario({ ...validCustomScenario(), mapSizeId: Number.NaN })
    ).toThrow("stable map-size ID");
    expect(() =>
      defineStandardMapMetricScenario({ ...validCustomScenario(), mapSizeId: " padded" })
    ).toThrow("stable map-size ID");
    expect(() =>
      defineStandardMapMetricScenario({ ...validCustomScenario(), mapSizeId: 1.5 })
    ).toThrow("stable map-size ID");
  });

  it("refuses a forged Civ7 preset before a product study can capture it", () => {
    const forgedScenario = {
      ...standardProductMetricScenario(earthlikeConfig, standardPreset, STANDARD_SCENARIO_IDENTITY),
      preset: {
        ...standardPreset,
        dimensions: FORGED_NON_CIV7_DIMENSIONS,
        mapInfo: {
          ...standardPreset.mapInfo,
          GridWidth: FORGED_NON_CIV7_DIMENSIONS.width,
          GridHeight: FORGED_NON_CIV7_DIMENSIONS.height,
        },
      },
    };
    const study = {
      kind: "sample" as const,
      id: "forged-preset",
      scenario: forgedScenario,
      targets: [STANDARD_INTEGRITY_TARGET] as const,
    };

    expect(() => evaluateStandardMetricStudies([study])).toThrow("refused semantic admission");
  });

  it("constructs scenarios without process-global identity state", () => {
    const first = standardProductMetricScenario(
      earthlikeConfig,
      standardPreset,
      STANDARD_SCENARIO_IDENTITY
    );
    const second = standardProductMetricScenario(
      earthlikeConfig,
      standardPreset,
      STANDARD_SCENARIO_IDENTITY
    );

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it("captures inspected-setup provenance and the complete feature legality corpus", () => {
    const identity = standardMetricScenarioIdentity(TEST_MAP_SIZE, TEST_MAP_SEED, TEST_GAME_SEED);
    const capture = captureStandardMapScenario(
      standardProductMetricScenario(earthlikeConfig, TEST_MAP_SIZE, identity)
    );
    expect(capture.provenance).toMatchObject({
      mapKind: "civ7-preset",
      mapSizeId: TEST_MAP_SIZE.id,
      mapSeed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      aliveMajorPlayerIds: identity.aliveMajorPlayerIds,
      width: TEST_MAP_SIZE.dimensions.width,
      height: TEST_MAP_SIZE.dimensions.height,
      topLatitude: earthlikeConfig.latitudeBounds.topLatitude,
      bottomLatitude: earthlikeConfig.latitudeBounds.bottomLatitude,
    });
    expect(capture.placement.aliveMajorIds).toEqual(capture.provenance.aliveMajorPlayerIds);
    const capturedKeys = capture.observation.features.map(({ key }) => key);
    const floodplain = FEATURE_PLACEMENT_KEYS.find((key) => key.includes("_FLOODPLAIN_"));
    if (!floodplain) throw new Error("Canonical Civ7 feature authority has no floodplain feature.");

    expect(capturedKeys).toEqual([...FEATURE_PLACEMENT_KEYS]);
    expect(capturedKeys).toContain(floodplain);
  });

  it("binds biome structure and volcano presence to targets that fail without evidence", () => {
    expect(EARTHLIKE_BIOME_STRUCTURE_STUDY.targets).toContain(EARTHLIKE_BIOME_STRUCTURE_TARGET);
    expect(EARTHLIKE_RELIEF_REPRESENTATIVE_STUDY.targets).toContain(
      EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET
    );

    const sample = measureStandardMapCapture(
      captureStandardMapScenario(EARTHLIKE_BIOME_STRUCTURE_STUDY.scenario)
    );
    const [baseline] = evaluateMetricTargets(sample, [EARTHLIKE_BIOME_STRUCTURE_TARGET]);
    expect(baseline?.status).toBe("pass");

    const withoutBiomeRowEvidence = {
      ...sample,
      metrics: {
        ...sample.metrics,
        ecology: {
          ...sample.metrics.ecology,
          biomeDiversity: 0,
          biomeRows: {
            landRowCount: 0,
            medianBiomeDiversity: null,
            maximumBiomeDiversity: null,
            qualifiedRainforestRowCount: 0,
            adjacentRainforestRowPairCount: 0,
            maximumAdjacentRainforestShareDelta: null,
          },
          coldBiomeTiles: {
            count: 0,
            population: sample.metrics.ecology.coldBiomeTiles.population,
          },
        },
      },
    };
    const [biomeStructure] = evaluateMetricTargets(withoutBiomeRowEvidence, [
      EARTHLIKE_BIOME_STRUCTURE_TARGET,
    ]);
    expect(
      biomeStructure?.expectations.filter(({ status }) => status === "fail").map(({ id }) => id)
    ).toEqual([
      "rainforest-latitude-row-evidence",
      "rainforest-latitude-transition",
      "cold-biome-presence",
      "land-row-evidence",
      "median-row-biome-diversity",
      "maximum-row-biome-diversity",
      "land-biome-diversity",
    ]);

    const withoutVolcanoes = {
      ...sample,
      metrics: {
        ...sample.metrics,
        relief: { ...sample.metrics.relief, plannedVolcanoes: 0 },
      },
    };
    const [relief] = evaluateMetricTargets(withoutVolcanoes, [
      EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET,
    ]);
    expect(relief?.expectations.find(({ id }) => id === "planned-volcano-presence")).toMatchObject({
      status: "fail",
      observed: 0,
    });
  }, 30_000);
});

function validCustomScenario() {
  return {
    kind: "custom" as const,
    id: "explicit-custom-fixture",
    config: earthlikeConfig,
    dimensions: { ...standardPreset.dimensions },
    mapInfo: { ...standardPreset.mapInfo },
    mapSizeId: "fixture-standard",
    mapSeed: TEST_MAP_SEED,
    gameSeed: TEST_GAME_SEED,
    aliveMajorPlayerIds: [...STANDARD_SCENARIO_IDENTITY.aliveMajorPlayerIds],
  };
}
