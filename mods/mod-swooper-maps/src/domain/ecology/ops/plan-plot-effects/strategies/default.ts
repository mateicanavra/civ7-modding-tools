import { createLabelRng } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import type { PlotEffectIntentKey } from "../../../model/schemas/plot-effect-intent.schema.js";
import PlanPlotEffectsContract from "../contract.js";

type Candidate = {
  idx: number;
  x: number;
  y: number;
  plotEffect: PlotEffectIntentKey;
  score: number;
  tie: number;
};

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
  run: (input, config) => {
    const { width, height } = input;
    // M3 posture: deterministic selection. Seeded randomness is allowed only as a tie-break for exact-equal scores.
    const placements: Array<{ x: number; y: number; plotEffect: PlotEffectIntentKey }> = [];
    const rng = createLabelRng(input.seed);

    const snow = config.snow;
    const sand = config.sand;
    const burned = config.burned;
    const jungle = config.jungle;

    const snowEnabled = snow.enabled;
    const sandEnabled = sand.enabled;
    const burnedEnabled = burned.enabled;
    const jungleEnabled = jungle.enabled;

    const snowCandidates: Candidate[] = [];
    const sandCandidates: Candidate[] = [];
    const burnedCandidates: Candidate[] = [];
    const jungleCandidates: Candidate[] = [];

    const tileCount = width * height;
    for (let idx = 0; idx < tileCount; idx++) {
      const x = idx % width;
      const y = (idx - x) / width;

      if (snowEnabled && input.snowEligibleMask[idx] === 1) {
        const score = input.snowScore01[idx]!;
        if (score >= snow.lightThreshold) {
          const typeToUse =
            score >= snow.heavyThreshold
              ? "snow-heavy"
              : score >= snow.mediumThreshold
                ? "snow-medium"
                : "snow-light";
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
          plotEffect: "sand",
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
          plotEffect: "burned",
          score,
          tie: rng(0x7fffffff, `plot-effects:burned:${idx}`),
        });
      }

      if (jungleEnabled && input.jungleEligibleMask[idx] === 1) {
        const score = input.jungleScore01[idx]!;
        jungleCandidates.push({
          idx,
          x,
          y,
          plotEffect: "jungle-fever",
          score,
          tie: rng(0x7fffffff, `plot-effects:jungle:${idx}`),
        });
      }
    }

    // Snow: place the abstract snow tier intent and optionally co-place frostbite
    // intent on the coldest selected tiles.
    const snowHazardType: PlotEffectIntentKey | undefined = snow.hazardEnabled
      ? "frostbite"
      : undefined;
    for (const c of selectTopCoverage(snowCandidates, snow.coveragePct)) {
      placements.push({ x: c.x, y: c.y, plotEffect: c.plotEffect });
      if (snowHazardType && c.score >= snow.hazardThreshold) {
        placements.push({ x: c.x, y: c.y, plotEffect: snowHazardType });
      }
    }
    // Sand: place abstract sand intent and optionally co-place desert-heat intent.
    const sandHazardType: PlotEffectIntentKey | undefined = sand.hazardEnabled
      ? "desert-heat"
      : undefined;
    for (const { x, y, plotEffect } of selectTopCoverage(sandCandidates, sand.coveragePct)) {
      placements.push({ x, y, plotEffect });
      if (sandHazardType) {
        placements.push({ x, y, plotEffect: sandHazardType });
      }
    }
    placements.push(
      ...selectTopCoverage(burnedCandidates, burned.coveragePct).map(({ x, y, plotEffect }) => ({
        x,
        y,
        plotEffect,
      }))
    );
    // Jungle places only jungle-fever intent on the deepest-stress rainforest.
    placements.push(
      ...selectTopCoverage(jungleCandidates, jungle.coveragePct).map(({ x, y, plotEffect }) => ({
        x,
        y,
        plotEffect,
      }))
    );

    // Stable output order (tile-major, then effect key).
    placements.sort(
      (a, b) => a.y * width + a.x - (b.y * width + b.x) || a.plotEffect.localeCompare(b.plotEffect)
    );

    return { placements };
  },
});
