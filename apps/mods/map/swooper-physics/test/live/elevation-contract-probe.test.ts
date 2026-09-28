import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";

import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { expectCiv7MapScriptCompatibility } from "../runtime/civ7-map-script-compatibility.fixture.js";
import {
  buildElevationProbeInput,
  ELEVATION_PROBE,
  ELEVATION_SURFACES,
  probeTerrainAt,
} from "./elevation-contract-map.fixture.js";
import { buildElevationProbePlan, elevationProbeMapScript } from "./elevation-contract-probe.js";

describe("elevation diagnostic artifact (not native behavior proof)", () => {
  test("full asymmetric JS arrays cover bounded scale, fractional and water probes", () => {
    for (const name of ["positive", "zero", "negative", "fractional"] as const) {
      const values = buildElevationProbeInput(name);
      expect(Array.isArray(values)).toBe(true);
      expect(values).toHaveLength(60 * 38);
      expect(values.every((value) => Number.isFinite(value) && value >= -1 && value <= 1550)).toBe(
        true
      );
    }
    const positive = buildElevationProbeInput("positive");
    expect(positive[8 + 9 * 60]).toBe(295);
    expect(positive[9 + 8 * 60]).toBe(279);
    expect(positive).toContain(1550);
    for (const { x, y } of ELEVATION_SURFACES) {
      expect(buildElevationProbeInput("zero")[x + y * 60]).toBe(0);
      expect(buildElevationProbeInput("negative")[x + y * 60]).toBe(-1);
      expect(Number.isInteger(buildElevationProbeInput("fractional")[x + y * 60])).toBe(false);
    }
    expect(probeTerrainAt(22, 18)).toBe("COAST");
    expect(probeTerrainAt(20, 8)).toBe("MOUNTAIN");
  });

  test("uses the real app compiler, separate mod identity, and bounded raw observation transport", async () => {
    const plan = await buildElevationProbePlan("unit-artifact-only");
    const script = plan.files.find(
      (file) => file.relativePath === "maps/elevation-contract.js"
    )!.content;
    if (typeof script !== "string") throw new Error("Expected compiled text map script.");
    await expectCiv7MapScriptCompatibility(script, "elevation-contract.js");
    expect(plan.files.find((file) => file.relativePath === "config/config.xml")!.content).toContain(
      elevationProbeMapScript
    );
    expect(ELEVATION_PROBE.id).not.toBe("swooper-maps");
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const calls: string[] = [];
    const lines: string[] = [];
    const terrain = new Array<number>(60 * 38).fill(0);
    const terrainNames = ["OCEAN", "COAST", "FLAT", "HILL", "MOUNTAIN", "NAVIGABLE_RIVER"];
    const terrainBuilder = Object.fromEntries(
      [
        "setBiomeType",
        "setRainfall",
        "setLandmassRegionId",
        "setFeatureType",
        "validateAndFixTerrain",
        "stampContinents",
        "buildElevation",
        "generateCliffsFromElevation",
        "modelRivers",
        "addFloodplains",
        "storeWaterData",
      ].map((name) => [
        name,
        () => {
          calls.push(name);
        },
      ])
    );
    runInNewContext(script, {
      console: { log: (line: string) => lines.push(line) },
      engine: {
        on: (name: string, callback: (...args: unknown[]) => void) => callbacks.set(name, callback),
        call: () => {},
      },
      GameInfo: {
        Terrains: terrainNames.map((name, $index) => ({ TerrainType: `TERRAIN_${name}`, $index })),
        Biomes: ["GRASSLAND", "MARINE"].map((name, $index) => ({
          BiomeType: `BIOME_${name}`,
          $index,
        })),
        Features: [{ FeatureType: "FEATURE_VOLCANO", $index: 1 }],
      },
      GameplayMap: {
        getGridWidth: () => 60,
        getGridHeight: () => 38,
        getRandomSeed: () => 1018,
        getIndexFromXY: (x: number, y: number) => x + y * 60,
        getElevation: () => 25.75,
        getTerrainType: (x: number, y: number) => terrain[x + y * 60],
      },
      TerrainBuilder: {
        ...terrainBuilder,
        setTerrainType: (x: number, y: number, value: number) => {
          terrain[x + y * 60] = value;
        },
        setElevation: (values: number[]) => {
          calls.push("setElevation");
          expect(values).toHaveLength(2280);
        },
      },
      AreaBuilder: { recalculateAreas: () => calls.push("areas") },
      FertilityBuilder: { recalculate: () => calls.push("fertility") },
      Players: { getAliveMajorIds: () => [0, 1, 2, 3] },
      StartPositioner: { setStartPosition: () => calls.push("start") },
      LandmassRegion: { LANDMASS_REGION_WEST: 0, LANDMASS_REGION_EAST: 1 },
    });
    callbacks.get("RequestMapInitData")!({ width: 60, height: 38 });
    callbacks.get("GenerateMap")!();
    expect(calls.filter((name) => name === "buildElevation")).toHaveLength(1);
    expect(calls.indexOf("buildElevation")).toBeLessThan(calls.indexOf("setElevation"));
    expect(calls.filter((name) => name === "setElevation")).toHaveLength(5);
    expect(calls.filter((name) => name === "generateCliffsFromElevation")).toHaveLength(2);
    expect(calls.indexOf("modelRivers")).toBeGreaterThan(
      calls.lastIndexOf("generateCliffsFromElevation")
    );
    expect(lines.every((line) => line.length <= 900)).toBe(true);
    const observations = decodeBoundedJsonLogSeries(lines, "[elevation-contract]").map(
      ({ payload }) =>
        payload as {
          stage: string;
          payload: { elevation?: number[]; surfaces?: { water: unknown }[] };
        }
    );
    expect(observations.map(({ stage }) => stage)).toContain("after-model-rivers-5-15");
    expect(
      observations.find(({ stage }) => stage === "stock-build-elevation")!.payload.elevation![0]
    ).toBe(25.75);
    expect(
      observations.find(({ stage }) => stage === "after-start-positions")!.payload.surfaces![0]!
        .water
    ).toEqual({ status: "unavailable", member: "isWater" });
    expect(decodeBoundedJsonLogSeries(lines, "[mapgen-complete]")).toHaveLength(1);
  });
});
