import { describe, expect, it } from "bun:test";

import { type Civ7StandardMapSizePreset, getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS } from "@civ7/map-policy";
import { admitStandardMapConfig } from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import { captureStandardMapScenario } from "../../../../src/recipes/standard/metrics/capture.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../src/recipes/standard/metrics/targets/integrity.js";
import {
  evaluateStandardMetricStudies,
  standardProductMetricScenario,
} from "../../../../src/recipes/standard/metrics/studies/index.js";
import { defineStandardMapMetricScenario } from "../../../../src/recipes/standard/metrics/scenario.js";

const standardPreset = requireStandardPreset();
const earthlikeConfig = admitStandardMapConfig(swooperEarthlikeRaw);

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
        dimensions: { width: 48, height: 28 },
        mapInfo: { ...standardPreset.mapInfo, GridWidth: 48, GridHeight: 28 },
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
    if (!tinyPreset) throw new Error("Missing Civ7 Tiny map-size metadata.");
    const capture = captureStandardMapScenario(
      standardProductMetricScenario(earthlikeConfig, tinyPreset, 1018)
    );
    const capturedKeys = capture.observation.features.map(({ key }) => key);
    const floodplain = FEATURE_PLACEMENT_KEYS.find((key) => key.includes("_FLOODPLAIN_"));
    if (!floodplain) throw new Error("Canonical Civ7 feature authority has no floodplain feature.");

    expect(capturedKeys).toEqual([...FEATURE_PLACEMENT_KEYS]);
    expect(capturedKeys).toContain(floodplain);
  });
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

function requireStandardPreset(): Civ7StandardMapSizePreset {
  const preset = getCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
  if (!preset) throw new Error("Missing Civ7 Standard map-size metadata.");
  return preset;
}
