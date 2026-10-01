import { describe, expect, it } from "vitest";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  parseMapConfigFile,
  serializeMapConfigFile,
} from "../../src/features/configAuthoring/importExport";

const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");

describe("map config import and export", () => {
  it("round-trips exactly one complete frozen config envelope", () => {
    const serialized = serializeMapConfigFile(canonicalConfig);
    const parsed = parseMapConfigFile(serialized.json);

    expect(serialized.filename).toBe(`${canonicalConfig.id}.config.json`);
    expect(JSON.parse(serialized.json)).toEqual(canonicalConfig);
    expect(parsed).toMatchObject({ ok: true, value: canonicalConfig });
    if (!parsed.ok) throw new Error(parsed.message);
    expect(Object.isFrozen(parsed.value)).toBe(true);
    expect(Object.isFrozen(parsed.value.config)).toBe(true);
    expect(parsed.value).not.toHaveProperty("source");
    expect(parsed.value).not.toHaveProperty("preset");
  });

  it("rejects malformed JSON, wrapper objects, and semantically invalid envelopes", () => {
    expect(parseMapConfigFile("{").ok).toBe(false);
    expect(parseMapConfigFile(JSON.stringify({ canonicalConfig })).ok).toBe(false);
    expect(
      parseMapConfigFile(
        JSON.stringify({
          ...canonicalConfig,
          latitudeBounds: { topLatitude: -80, bottomLatitude: 80 },
        })
      ).ok
    ).toBe(false);
  });

  it("exports admitted current thermal selections without compatibility fields", () => {
    const parsed = parseMapConfigFile(serializeMapConfigFile(canonicalConfig).json);
    if (!parsed.ok) throw new Error(parsed.message);
    const stage = parsed.value.config["hydrology-climate-baseline"] as Record<string, unknown>;
    const baseline = stage["climate-baseline"] as Record<
      string,
      { strategy: string; config: Record<string, unknown> }
    >;
    expect(baseline.computeSeasonalSampling!.strategy).toBe("periodic-cycle");
    expect(baseline.computeRadiativeForcing!).toEqual({
      strategy: "daily-solar-fourier",
      config: {},
    });
    expect(baseline.computeThermalState!.strategy).toBe("periodic-response");
    expect(baseline.computeThermalState!.config).not.toHaveProperty("baseTemperatureC");
    expect(baseline.computeThermalState!.config).not.toHaveProperty("insolationScaleC");
    expect(baseline.computeThermalState!.config).not.toHaveProperty("landCoolingC");
    expect(JSON.parse(serializeMapConfigFile(parsed.value).json)).toEqual(parsed.value);
  });

  it("refuses saved retired thermal selectors and controls without automatic migration", () => {
    const stage = canonicalConfig.config["hydrology-climate-baseline"] as Record<string, unknown>;
    const baseline = stage["climate-baseline"] as Record<
      string,
      { strategy: string; config: Record<string, unknown> }
    >;
    for (const [key, obsolete] of [
      ["computeSeasonalSampling", { strategy: "legacy-snapshots", config: {} }],
      ["computeRadiativeForcing", { strategy: "latitude-insolation", config: {} }],
      ["computeThermalState", { strategy: "insolation-lapse-rate", config: {} }],
      [
        "computeRadiativeForcing",
        { ...baseline.computeRadiativeForcing, config: { poleInsolation: 0.22 } },
      ],
      [
        "computeThermalState",
        {
          ...baseline.computeThermalState,
          config: { ...baseline.computeThermalState!.config, baseTemperatureC: 8 },
        },
      ],
    ] as const) {
      const saved = {
        ...canonicalConfig,
        config: {
          ...canonicalConfig.config,
          "hydrology-climate-baseline": {
            ...stage,
            "climate-baseline": { ...baseline, [key]: obsolete },
          },
        },
      };
      const before = JSON.stringify(saved);
      expect(parseMapConfigFile(before).ok).toBe(false);
      expect(JSON.stringify(saved)).toBe(before);
    }
  });
});
