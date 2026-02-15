import { createLabelRng } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import type { PlotEffectKey } from "@mapgen/domain/ecology/types.js";

import PlanPlotEffectsContract from "../contract.js";

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
    const { width, height } = input;
    // M3 posture: deterministic selection. Seeded randomness is allowed only as a tie-break for exact-equal scores.
    const placements: Array<{ x: number; y: number; plotEffect: PlotEffectKey }> = [];
    const rng = createLabelRng(input.seed);

    const snow = config.snow;
    const sand = config.sand;
    const burned = config.burned;

    const snowSelectors = snow.selectors;
    const sandSelector = sand.selector;
    const burnedSelector = burned.selector;

    const snowEnabled = snow.enabled;
    const sandEnabled = sand.enabled;
    const burnedEnabled = burned.enabled;

    const snowCandidates: Candidate[] = [];
    const sandCandidates: Candidate[] = [];
    const burnedCandidates: Candidate[] = [];

    const tileCount = width * height;
    for (let idx = 0; idx < tileCount; idx++) {
      const x = idx % width;
      const y = (idx - x) / width;

      if (snowEnabled && input.snowEligibleMask[idx] === 1) {
        const score = input.snowScore01[idx]!;
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

      if (sandEnabled && input.sandEligibleMask[idx] === 1) {
        const score = input.sandScore01[idx]!;
        sandCandidates.push({
          idx,
          x,
          y,
          plotEffect: sandSelector.typeName,
          score,
          tie: rng(0x7fffffff, `plot-effects:sand:${idx}`),
        });
      }

      if (burnedEnabled && input.burnedEligibleMask[idx] === 1) {
        const score = input.burnedScore01[idx]!;
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
