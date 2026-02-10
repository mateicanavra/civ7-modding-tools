import { clamp01, createLabelRng, normalizeRange } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import type { PlotEffectKey } from "@mapgen/domain/ecology/types.js";

import { biomeSymbolFromIndex } from "@mapgen/domain/ecology/types.js";
import PlanPlotEffectsContract from "../contract.js";
import { resolveSnowElevationRange } from "../rules/index.js";

type PlotEffectSelector = { typeName: PlotEffectKey };
type Config = Static<(typeof PlanPlotEffectsContract)["strategies"]["default"]>;

type Candidate = {
  idx: number;
  x: number;
  y: number;
  plotEffect: PlotEffectKey;
  score: number;
  // Seeded tie-break key, used only when `score` is exactly equal.
  tie: number;
};

const normalizePlotEffectKey = (value: string): PlotEffectKey => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("plot effects selector typeName must be a non-empty string");
  }
  const upper = trimmed.toUpperCase();
  return (upper.startsWith("PLOTEFFECT_") ? upper : `PLOTEFFECT_${upper}`) as PlotEffectKey;
};

const normalizeSelector = (selector: { typeName: string }): PlotEffectSelector => ({
  typeName: normalizePlotEffectKey(selector.typeName),
});

function normalizeConfig(config: Config): Config {
  return {
    ...config,
    snow: {
      ...config.snow,
      selectors: {
        light: normalizeSelector(config.snow.selectors.light),
        medium: normalizeSelector(config.snow.selectors.medium),
        heavy: normalizeSelector(config.snow.selectors.heavy),
      },
    },
    sand: {
      ...config.sand,
      selector: normalizeSelector(config.sand.selector),
    },
    burned: {
      ...config.burned,
      selector: normalizeSelector(config.burned.selector),
    },
  };
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function coverageToCount(totalEligible: number, coveragePct: number): number {
  if (totalEligible <= 0) return 0;
  const pct = clampPct(coveragePct);
  const raw = (totalEligible * pct) / 100;
  const rounded = Math.round(raw);
  return Math.max(0, Math.min(totalEligible, rounded));
}

function selectTopCoverage(candidates: Candidate[], coveragePct: number): Candidate[] {
  const count = coverageToCount(candidates.length, coveragePct);
  if (count <= 0) return [];
  candidates.sort((a, b) => b.score - a.score || a.tie - b.tie || a.idx - b.idx);
  return candidates.slice(0, count);
}

export const defaultStrategy = createStrategy(PlanPlotEffectsContract, "default", {
  normalize: (config) => normalizeConfig(config),
  run: (input, config) => {
    const { width, height, landMask } = input;
    // M3 posture: deterministic selection. Seeded randomness is allowed only as a tie-break for exact-equal scores.
    const placements: Array<{ x: number; y: number; plotEffect: PlotEffectKey }> = [];
    const rng = createLabelRng(input.seed);

    const snow = config.snow;
    const sand = config.sand;
    const burned = config.burned;

    const snowSelectors = snow.selectors;
    const sandSelector = sand.selector;
    const burnedSelector = burned.selector;

    const sandBiomeSet = new Set(sand.allowedBiomes);
    const burnedBiomeSet = new Set(burned.allowedBiomes);
    const snowEnabled = snow.enabled;
    const snowElevation = snowEnabled
      ? resolveSnowElevationRange(input, {
          snow: {
            elevationStrategy: snow.elevationStrategy,
            elevationPercentileMin: snow.elevationPercentileMin,
            elevationPercentileMax: snow.elevationPercentileMax,
            elevationMin: snow.elevationMin,
            elevationMax: snow.elevationMax,
          },
        })
      : null;
    const snowElevationMin = snowElevation?.min ?? snow.elevationMin;
    const snowElevationMax = snowElevation?.max ?? snow.elevationMax;

    const snowCandidates: Candidate[] = [];
    const sandCandidates: Candidate[] = [];
    const burnedCandidates: Candidate[] = [];

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (landMask[idx] === 0) continue;

        const temp = input.surfaceTemperature[idx];
        const moisture = input.effectiveMoisture[idx];
        const vegetation = input.vegetationDensity[idx];
        const aridity = input.aridityIndex[idx];
        const freeze = input.freezeIndex[idx];
        const elevation = input.elevation[idx];
        const symbol = biomeSymbolFromIndex(input.biomeIndex[idx]);

        if (snowEnabled) {
          if (temp <= snow.maxTemperature && aridity <= snow.maxAridity) {
            const elevationFactor = normalizeRange(elevation, snowElevationMin, snowElevationMax);
            const moistureFactor = normalizeRange(moisture, snow.moistureMin, snow.moistureMax);
            const scoreRaw =
              freeze * snow.freezeWeight +
              elevationFactor * snow.elevationWeight +
              moistureFactor * snow.moistureWeight +
              snow.scoreBias;
            const score = clamp01(scoreRaw / Math.max(0.0001, snow.scoreNormalization));

            if (score >= snow.lightThreshold) {
              const typeToUse =
                score >= snow.heavyThreshold
                  ? snowSelectors.heavy.typeName
                  : score >= snow.mediumThreshold
                    ? snowSelectors.medium.typeName
                    : snowSelectors.light.typeName;
              snowCandidates.push({
                idx,
                x,
                y,
                plotEffect: typeToUse,
                score,
                tie: rng(0x7fffffff, `plot-effects:snow:${idx}`),
              });
            }
          }
        }

        if (sand.enabled) {
          if (
            aridity >= sand.minAridity &&
            temp >= sand.minTemperature &&
            freeze <= sand.maxFreeze &&
            vegetation <= sand.maxVegetation &&
            moisture <= sand.maxMoisture &&
            sandBiomeSet.has(symbol)
          ) {
            const aridityFactor = normalizeRange(aridity, sand.minAridity, 1);
            const tempFactor = normalizeRange(temp, sand.minTemperature, sand.minTemperature + 10);
            const freezeFactor = 1 - normalizeRange(freeze, 0, Math.max(0.0001, sand.maxFreeze));
            const vegetationFactor = 1 - normalizeRange(vegetation, 0, Math.max(0.0001, sand.maxVegetation));
            const moistureFactor = 1 - normalizeRange(moisture, 0, Math.max(0.0001, sand.maxMoisture));
            const score = clamp01(
              (aridityFactor + tempFactor + freezeFactor + vegetationFactor + moistureFactor) / 5
            );
            sandCandidates.push({
              idx,
              x,
              y,
              plotEffect: sandSelector.typeName,
              score,
              tie: rng(0x7fffffff, `plot-effects:sand:${idx}`),
            });
          }
        }

        if (burned.enabled) {
          if (
            aridity >= burned.minAridity &&
            temp >= burned.minTemperature &&
            moisture <= burned.maxMoisture &&
            freeze <= burned.maxFreeze &&
            vegetation <= burned.maxVegetation &&
            burnedBiomeSet.has(symbol)
          ) {
            const aridityFactor = normalizeRange(aridity, burned.minAridity, 1);
            const tempFactor = normalizeRange(temp, burned.minTemperature, burned.minTemperature + 10);
            const freezeFactor = 1 - normalizeRange(freeze, 0, Math.max(0.0001, burned.maxFreeze));
            const vegetationFactor = 1 - normalizeRange(vegetation, 0, Math.max(0.0001, burned.maxVegetation));
            const moistureFactor = 1 - normalizeRange(moisture, 0, Math.max(0.0001, burned.maxMoisture));
            const score = clamp01(
              (aridityFactor + tempFactor + freezeFactor + vegetationFactor + moistureFactor) / 5
            );
            burnedCandidates.push({
              idx,
              x,
              y,
              plotEffect: burnedSelector.typeName,
              score,
              tie: rng(0x7fffffff, `plot-effects:burned:${idx}`),
            });
          }
        }
      }
    }

    placements.push(
      ...selectTopCoverage(snowCandidates, snow.coveragePct).map(({ x, y, plotEffect }) => ({ x, y, plotEffect }))
    );
    placements.push(
      ...selectTopCoverage(sandCandidates, sand.coveragePct).map(({ x, y, plotEffect }) => ({ x, y, plotEffect }))
    );
    placements.push(
      ...selectTopCoverage(burnedCandidates, burned.coveragePct).map(({ x, y, plotEffect }) => ({ x, y, plotEffect }))
    );

    // Stable output order (tile-major, then effect key).
    placements.sort(
      (a, b) => a.y * width + a.x - (b.y * width + b.x) || a.plotEffect.localeCompare(b.plotEffect)
    );

    return { placements };
  },
});
