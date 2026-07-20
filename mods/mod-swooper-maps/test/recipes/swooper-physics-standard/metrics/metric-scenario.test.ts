import { describe, expect, it } from "bun:test";

import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS } from "@civ7/map-policy";
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
  standardProductMetricScenario,
} from "../../../../src/recipes/standard/metrics/studies/index.js";
import { EARTHLIKE_BIOME_STRUCTURE_TARGET } from "../../../../src/recipes/standard/metrics/targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../src/recipes/standard/metrics/targets/integrity.js";
import { EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET } from "../../../../src/recipes/standard/metrics/targets/relief.js";

const standardPreset = getCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
const earthlikeConfig = admitStandardMapConfig(swooperEarthlikeRaw);
const FORGED_NON_CIV7_DIMENSIONS = { width: 48, height: 28 } as const;

describe("Standard metric scenario admission", () => {
  it("retains one complete Civ7 preset selection without inferred dimensions", () => {
    const scenario = defineStandardMapMetricScenario({
      kind: "civ7-preset",
      id: "earthlike-standard",
      config: earthlikeConfig,
      preset: standardPreset,
      seed: 1018,
    });

    expect(scenario.kind).toBe("civ7-preset");
    if (scenario.kind !== "civ7-preset") throw new Error("Expected a preset scenario.");
    expect(scenario.preset.dimensions).toEqual(standardPreset.dimensions);
    expect(scenario.preset.mapInfo).toEqual(standardPreset.mapInfo);
  });

  it("refuses custom selections whose dimensions and map metadata disagree", () => {
    expect(() =>
      defineStandardMapMetricScenario({
        ...validCustomScenario(),
        mapInfo: { ...standardPreset.mapInfo, GridWidth: standardPreset.dimensions.width + 1 },
      })
    ).toThrow("map metadata inconsistent with its dimensions");
  });

  it("refuses custom selections that cannot seat their declared players", () => {
    expect(() =>
      defineStandardMapMetricScenario({
        ...validCustomScenario(),
        mapInfo: { ...standardPreset.mapInfo, PlayersLandmass1: 0, PlayersLandmass2: 0 },
      })
    ).toThrow("landmass capacity for every player");
  });

  it("refuses non-finite custom map-size identities", () => {
    expect(() =>
      defineStandardMapMetricScenario({ ...validCustomScenario(), mapSizeId: Number.NaN })
    ).toThrow("stable map-size ID");
  });

  it("refuses a forged Civ7 preset before a product study can capture it", () => {
    const forgedScenario = {
      ...standardProductMetricScenario(earthlikeConfig, standardPreset, 1018),
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

    expect(() => evaluateStandardMetricStudies([study])).toThrow("canonical Civ7 preset");
  });

  it("constructs scenarios without process-global identity state", () => {
    const first = standardProductMetricScenario(earthlikeConfig, standardPreset, 1018);
    const second = standardProductMetricScenario(earthlikeConfig, standardPreset, 1018);

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it("captures the complete canonical feature legality corpus including floodplains", () => {
    const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
    const capture = captureStandardMapScenario(
      standardProductMetricScenario(earthlikeConfig, tinyPreset, 1018)
    );
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
    playerCount: standardPreset.defaultPlayers,
    seed: 1018,
  };
}
