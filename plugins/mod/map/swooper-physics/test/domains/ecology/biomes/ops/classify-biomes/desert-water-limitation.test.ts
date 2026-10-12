import { describe, expect, it } from "bun:test";
import { clamp01 } from "@swooper/mapgen-core";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { admitStandardMapConfig } from "../../../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../../../src/maps/configs/swooper-earthlike.config.json";

const { classifyBiomes } = ecology.biomes.ops;
const defaultSelection = normalizeOperationSelectionForTest(classifyBiomes, classifyBiomes.defaultConfig);
const earthlikeSelection = normalizeOperationSelectionForTest(
  classifyBiomes,
  admitStandardMapConfig(swooperEarthlikeRaw).config["ecology-biomes"].biomes.classify
);

type Cell = Readonly<{
  temperature: number;
  coldMonth: number;
  moisture: number;
  stress: number;
}>;

function inputForCells(cells: readonly Cell[]) {
  const size = cells.length;
  return {
    width: size,
    height: 1,
    landMask: new Uint8Array(size).fill(1),
    effectiveMoisture: Float32Array.from(cells, (cell) => cell.moisture),
    plantEffectiveMoisture: Float32Array.from(cells, (cell) => cell.moisture),
    aridityIndex: Float32Array.from(cells, (cell) => cell.stress),
    plantWaterStress: Float32Array.from(cells, (cell) => cell.stress),
    surfaceTemperatureC: Float32Array.from(cells, (cell) => cell.temperature),
    coldestMonthMeanSurfaceTemperatureC: Float32Array.from(cells, (cell) => cell.coldMonth),
    freezeIndex: new Float32Array(size),
    permafrost01: new Float32Array(size),
    soilType: new Uint8Array(size).fill(2),
    fertility: new Float32Array(size).fill(0.46),
  };
}

// Hand-authored published annual budget fields, not generated full-map climate.
function inputForBudget(demand: number, opportunity: number, temperature = 2, coldMonth = -8) {
  const precipitation = 60;
  const wetness = Math.fround(0.2);
  const atmosphericMoisture = Math.fround(precipitation + 0.35 * 255 * wetness);
  const input = inputForCells([{
    temperature,
    coldMonth,
    moisture: opportunity === 0
      ? atmosphericMoisture
      : precipitation + 0.35 * 255 * wetness + opportunity,
    stress: demand / (demand + precipitation + opportunity + 1),
  }]);
  input.effectiveMoisture[0] = atmosphericMoisture;
  input.aridityIndex[0] = demand / (demand + precipitation + 1);
  return input;
}

describe("classifyBiomes desert water limitation", () => {
  it.each([0, 30])("rejects the cold low-demand desert bypass with opportunity %i and keeps held high demand", (opportunity) => {
    const input = inputForBudget(21.2, opportunity);
    const before = structuredClone(input);
    const result = classifyBiomes.run(input, earthlikeSelection);
    expect(input.plantWaterStress[0]).toBe(Math.fround(21.2 / (21.2 + 60 + opportunity + 1)));
    expect(input.plantWaterStress[0]).toBeLessThan(0.5);
    expect(biomeSymbolFromIndex(result.biomeIndex[0]!)).toBe("tundra");

    const highDemandInput = inputForBudget(180, opportunity);
    const highDemand = classifyBiomes.run(highDemandInput, earthlikeSelection);
    expect(highDemandInput.plantEffectiveMoisture).toEqual(input.plantEffectiveMoisture);
    expect(highDemandInput.surfaceTemperatureC).toEqual(input.surfaceTemperatureC);
    expect(highDemandInput.coldestMonthMeanSurfaceTemperatureC).toEqual(input.coldestMonthMeanSurfaceTemperatureC);
    expect(highDemandInput.plantWaterStress[0]).toBeGreaterThan(0.5);
    expect(biomeSymbolFromIndex(highDemand.biomeIndex[0]!)).toBe("desert");
    expect(input).toEqual(before);
  });

  it.each([
    { temperature: 2, coldMonth: -8, open: "tundra" },
    { temperature: 15, coldMonth: 10, open: "temperateDry" },
    { temperature: 28, coldMonth: 22, open: "tropicalSeasonal" },
  ] as const)("uses only the $open thermal open class at and immediately below published stress 0.5", (thermal) => {
    const stresses = [0.5 - 2 ** -25, 0.5, 0.5 + 2 ** -24];
    const input = inputForCells(stresses.map((stress) => ({ ...thermal, moisture: 20, stress })));
    const result = classifyBiomes.run(input, earthlikeSelection);
    expect(Array.from(input.plantWaterStress)).toEqual(stresses);
    expect(Array.from(result.biomeIndex, biomeSymbolFromIndex)).toEqual([
      thermal.open,
      thermal.open,
      "desert",
    ]);
  });

  it.each([0, 30])("keeps the exact D = P + O + 1 boundary non-desert at opportunity %i", (opportunity) => {
    const input = inputForBudget(60 + opportunity + 1, opportunity);
    expect(input.plantWaterStress[0]).toBe(0.5);
    expect(biomeSymbolFromIndex(classifyBiomes.run(input, earthlikeSelection).biomeIndex[0]!)).toBe("tundra");
  });

  it("keeps seasonal tropical admission exact when rejecting desert", () => {
    const input = inputForCells([17.999, 18, 22].map((coldMonth) => ({
      temperature: 28,
      coldMonth,
      moisture: 20,
      stress: 0.2,
    })));
    const result = classifyBiomes.run(input, earthlikeSelection);
    expect(Array.from(result.biomeIndex, biomeSymbolFromIndex)).toEqual([
      "temperateDry",
      "tropicalSeasonal",
      "tropicalSeasonal",
    ]);
    expect(result.vegetationDensity[0]).toBe(result.vegetationDensity[1]);
    expect(result.vegetationDensity[1]).toBe(result.vegetationDensity[2]);
  });

  it.each([
    { temperature: 2, coldMonth: -8, open: "tundra", forest: "boreal" },
    { temperature: 15, coldMonth: 10, open: "temperateDry", forest: "temperateHumid" },
    { temperature: 28, coldMonth: 22, open: "tropicalSeasonal", forest: "tropicalRainforest" },
  ] as const)("never increases categorical dryness with local water and preserves $forest support", (thermal) => {
    const opportunities = [0, 30, 60, 90, 120, 180, 240, 360, 600];
    const symbols = opportunities.map((opportunity) => {
      const input = inputForBudget(180, opportunity, thermal.temperature, thermal.coldMonth);
      return biomeSymbolFromIndex(classifyBiomes.run(input, earthlikeSelection).biomeIndex[0]!);
    });
    const dryness = symbols.map((symbol) => symbol === "desert" ? 2 : symbol === thermal.open ? 1 : 0);
    expect(symbols[0]).toBe("desert");
    expect(symbols).toContain(thermal.open);
    for (const symbol of symbols) expect(["desert", thermal.open, thermal.forest]).toContain(symbol);
    for (let index = 1; index < dryness.length; index++) {
      expect(dryness[index]).toBeLessThanOrEqual(dryness[index - 1]!);
    }
    for (let index = 5; index < opportunities.length; index++) {
      expect(symbols[index]).toBe(thermal.forest);
    }
  });

  it.each([
    { name: "default", selection: defaultSelection },
    { name: "Earthlike", selection: earthlikeSelection },
  ])("changes only screened incumbent deserts and preserves all fixed-input fields under $name", ({ selection }) => {
    const cells: Cell[] = [];
    const thermals = [
      { temperature: -10, coldMonth: -20 },
      { temperature: -1, coldMonth: -8 },
      { temperature: 2, coldMonth: -8 },
      { temperature: 4, coldMonth: -8 },
      { temperature: 15, coldMonth: 10 },
      { temperature: 28, coldMonth: 17.999 },
      { temperature: 28, coldMonth: 18 },
    ];
    for (const thermal of thermals) {
      for (const moisture of [0, 30, 45, 89.99, 90, 140, 163.5, 228, 252, 300]) {
        for (const stress of [0, 0.35, 0.5, 0.5 + 2 ** -24, 0.66, 1]) {
          cells.push({ ...thermal, moisture, stress });
        }
      }
    }
    const input = inputForCells(cells);
    for (let index = 0; index < cells.length; index++) {
      input.effectiveMoisture[index] = cells[index]!.moisture + 30;
      input.aridityIndex[index] = 1 - cells[index]!.stress;
      input.freezeIndex[index] = (index % 5) / 4;
      input.permafrost01[index] = (index % 4) / 3;
      input.soilType[index] = index % 4;
      input.fertility[index] = (index % 6) / 5;
    }
    input.landMask[cells.length - 1] = 0;
    const before = structuredClone(input);
    const result = classifyBiomes.run(input, selection);
    const config = selection.config;
    const expectedDensity = new Float32Array(cells.length);
    const incumbentSymbols = new Set<string>();
    // Frozen incumbent lookup is an independent oracle, not a private rule import.
    const incumbentLookup = {
      polar: ["snow", "tundra", "tundra", "snow", "snow"],
      cold: ["desert", "tundra", "boreal", "boreal", "boreal"],
      temperate: ["desert", "temperateDry", "temperateHumid", "temperateHumid", "temperateHumid"],
      tropical: ["desert", "tropicalSeasonal", "tropicalSeasonal", "tropicalRainforest", "tropicalRainforest"],
    } as const;
    let screenedDeserts = 0;
    for (let index = 0; index < cells.length; index++) {
      if (input.landMask[index] === 0) {
        expect(result.biomeIndex[index]).toBe(255);
        continue;
      }
      const temperature = input.surfaceTemperatureC[index]!;
      const tempZone = temperature <= config.temperature.polarCutoff ? "polar"
        : temperature <= config.temperature.tundraCutoff ? "cold"
        : input.coldestMonthMeanSurfaceTemperatureC[index]! < config.temperature.tropicalColdMonthMeanMinC ? "temperate"
        : "tropical";
      const polar = tempZone === "polar";
      const moisture = polar ? input.effectiveMoisture[index]! : input.plantEffectiveMoisture[index]!;
      const stress = polar ? input.aridityIndex[index]! : input.plantWaterStress[index]!;
      const bucket = config.moisture.thresholds.filter((threshold) => moisture >= threshold).length;
      const shift = config.aridity.moistureShiftThresholds.filter((threshold) => stress >= threshold).length;
      const incumbent = incumbentLookup[tempZone][Math.max(0, bucket - shift)]!;
      incumbentSymbols.add(incumbent);
      if (!polar && incumbent === "desert" && input.plantWaterStress[index]! <= 0.5) {
        expect(biomeSymbolFromIndex(result.biomeIndex[index]!)).toBe(incumbentLookup[tempZone][1]);
        screenedDeserts++;
      } else {
        expect(biomeSymbolFromIndex(result.biomeIndex[index]!)).toBe(incumbent);
      }
      const moistureNorm = clamp01(input.plantEffectiveMoisture[index]! / (
        config.moisture.thresholds[3] + config.vegetation.moistureNormalizationPadding
      ));
      const energy01 = clamp01((temperature - config.temperature.polarCutoff) / Math.max(
        1e-6, config.vegetation.energyMaxC - config.temperature.polarCutoff
      ));
      const soilDelta = [-0.15, -0.08, 0.05, 0.02][input.soilType[index]!]!;
      const soilFactor = Math.max(0, 0.6 + 0.5 * clamp01(input.fertility[index]!) + soilDelta);
      expectedDensity[index] = clamp01(
        (config.vegetation.base + config.vegetation.moistureWeight * moistureNorm)
        * energy01 * clamp01(1 - input.freezeIndex[index]!)
        * clamp01(1 - input.plantWaterStress[index]! * config.aridity.vegetationPenalty)
        * soilFactor
      );
    }
    expect(screenedDeserts).toBeGreaterThan(0);
    expect(incumbentSymbols).toEqual(new Set([
      "snow", "tundra", "boreal", "temperateDry", "temperateHumid",
      "tropicalSeasonal", "tropicalRainforest", "desert",
    ]));
    expect(result.vegetationDensity).toEqual(expectedDensity);
    expect(result.effectiveMoisture).toEqual(input.effectiveMoisture);
    expect(result.surfaceTemperature).toEqual(input.surfaceTemperatureC);
    expect(result.aridityIndex).toEqual(input.aridityIndex);
    expect(result.freezeIndex).toEqual(input.freezeIndex);
    expect(result.treeLine01).toEqual(Float32Array.from(input.permafrost01, (value) => clamp01(1 - value)));
    expect(input).toEqual(before);
  });
});
