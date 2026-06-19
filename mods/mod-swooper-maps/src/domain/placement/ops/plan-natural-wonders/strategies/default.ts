import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import {
  isAnyRiverClass,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_NONE,
} from "../../../../hydrology/index.js";
import PlanNaturalWondersContract from "../contract.js";

type Candidate = {
  plotIndex: number;
  relief: number;
  elevation: number;
};

/**
 * Requirement groups (A-I) for natural-wonder suitability, keyed by
 * `Feature_NaturalWonders` row id (stable corpus). Each group scores the physical
 * signals relevant to that wonder class; see `suitabilityAt`. Unknown ids fall
 * back to the mountain-monolith profile.
 */
type WonderGroup = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
const WONDER_GROUP_BY_FEATURE: Readonly<Record<number, WonderGroup>> = {
  35: "A", // Kilimanjaro
  41: "A", // Mount Fuji
  37: "B", // Thera
  29: "C", // Barrier Reef
  44: "C", // Great Blue Hole
  45: "C", // Mapu'a Vaea
  0: "D", // Bermuda Triangle
  32: "E", // Gullfoss
  34: "E", // Iguazu Falls
  1: "F", // Mount Everest
  33: "F", // Hoerikwaggo
  36: "F", // Zhangjiajie
  38: "F", // Torres del Paine
  40: "F", // Machapuchare
  42: "F", // Vihren
  43: "F", // Vinicunca
  28: "G", // Valley of Flowers
  31: "H", // Grand Canyon
  39: "H", // Uluru
  30: "I", // Redwood Forest
};
function wonderGroup(featureType: number): WonderGroup {
  return WONDER_GROUP_BY_FEATURE[featureType] ?? "F";
}

type FootprintOffset = { dx: number; dy: number };
type FootprintOffsetsByParity = { even: readonly FootprintOffset[]; odd: readonly FootprintOffset[] };

type NaturalWonderFeatureCandidate = {
  featureType: number;
  direction: number;
  placeFirst: boolean;
  validTerrainTypes: readonly number[];
  validBiomeTypes: readonly number[];
  minimumElevation: number | null;
  noLake: boolean;
  featureTags: readonly string[];
  footprintOffsetsByParity: FootprintOffsetsByParity;
};

export const defaultStrategy = createStrategy(PlanNaturalWondersContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Placement] Invalid landMask for placement/plan-natural-wonders.");
    }
    if (!(input.elevation instanceof Int16Array) || input.elevation.length !== size) {
      throw new Error("[Placement] Invalid elevation for placement/plan-natural-wonders.");
    }
    if (!(input.aridityIndex instanceof Float32Array) || input.aridityIndex.length !== size) {
      throw new Error("[Placement] Invalid aridityIndex for placement/plan-natural-wonders.");
    }
    if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
      throw new Error("[Placement] Invalid riverClass for placement/plan-natural-wonders.");
    }
    if (!(input.lakeMask instanceof Uint8Array) || input.lakeMask.length !== size) {
      throw new Error("[Placement] Invalid lakeMask for placement/plan-natural-wonders.");
    }
    if (!(input.terrainType instanceof Uint8Array) || input.terrainType.length !== size) {
      throw new Error("[Placement] Invalid terrainType for placement/plan-natural-wonders.");
    }
    if (!(input.biomeType instanceof Uint8Array) || input.biomeType.length !== size) {
      throw new Error("[Placement] Invalid biomeType for placement/plan-natural-wonders.");
    }
    if (!(input.featureType instanceof Int16Array) || input.featureType.length !== size) {
      throw new Error("[Placement] Invalid featureType for placement/plan-natural-wonders.");
    }
    if (
      !(input.naturalWonderBlockedMask instanceof Uint8Array) ||
      input.naturalWonderBlockedMask.length !== size
    ) {
      throw new Error(
        "[Placement] Invalid naturalWonderBlockedMask for placement/plan-natural-wonders."
      );
    }

    const wondersCount = Math.max(0, input.wondersCount | 0);
    const noFeatureType = Number.isFinite(input.noFeatureType)
      ? Math.trunc(input.noFeatureType)
      : -1;
    const featureCatalog = Array.from(
      new Map(
        (input.featureCatalog ?? [])
          .map((entry) => ({
            featureType: entry.featureType | 0,
            direction: entry.direction | 0,
            placeFirst: entry.placeFirst === true,
            validTerrainTypes: sanitizeIdArray(entry.validTerrainTypes),
            validBiomeTypes: sanitizeIdArray(entry.validBiomeTypes),
            minimumElevation: Number.isFinite(entry.minimumElevation)
              ? Number(entry.minimumElevation)
              : null,
            noLake: entry.noLake === true,
            featureTags: sanitizeStringArray(entry.featureTags),
            footprintOffsetsByParity: sanitizeFootprintOffsetsByParity(entry.footprintOffsetsByParity),
          }))
          .filter((entry) => entry.featureType >= 0)
          .filter(
            (entry) =>
              entry.footprintOffsetsByParity.even.length > 0 &&
              entry.footprintOffsetsByParity.odd.length > 0
          )
          .map((entry) => [entry.featureType, entry] as const)
      ).values()
    ).sort((a, b) => {
      // Deterministic, stable catalog order (placeFirst first, then by
      // featureType). This only fixes iteration/dedup order; WHICH wonders place
      // and in what order is decided by the diminishing-returns greedy below
      // (argmax over effectiveScore), not by this sort.
      if (a.placeFirst !== b.placeFirst) return a.placeFirst ? -1 : 1;
      return a.featureType - b.featureType;
    });

    if (wondersCount <= 0 || featureCatalog.length === 0) {
      return {
        width,
        height,
        wondersCount,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      };
    }

    const reliefByTile = new Float32Array(size);
    let maxRelief = 0;
    for (let i = 0; i < size; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      let minElev = input.elevation[i] ?? 0;
      let maxElev = minElev;
      for (const ni of getHexNeighborIndicesOddQ(x, y, width, height)) {
        const elev = input.elevation[ni] ?? minElev;
        if (elev < minElev) minElev = elev;
        if (elev > maxElev) maxElev = elev;
      }
      const relief = Math.max(0, maxElev - minElev);
      reliefByTile[i] = relief;
      if (relief > maxRelief) maxRelief = relief;
    }

    const reliefScale = Math.max(1, maxRelief);

    // Forwarded physical suitability signals (optional — fall back to neutral when
    // an input omits them, e.g. minimal unit tests). Never recomputed here.
    const optionalF32 = (value: unknown): Float32Array | null =>
      value instanceof Float32Array && value.length === size ? value : null;
    const optionalU8 = (value: unknown): Uint8Array | null =>
      value instanceof Uint8Array && value.length === size ? value : null;
    const vegetationDensity = optionalF32(input.vegetationDensity);
    const effectiveMoisture = optionalF32(input.effectiveMoisture);
    const surfaceTemperature = optionalF32(input.surfaceTemperature);
    const fertility = optionalF32(input.fertility);
    const discharge = optionalF32(input.discharge);
    const slopeClass = optionalU8(input.slopeClass);

    let maxElevAbs = 1;
    let maxDischarge = 0;
    for (let i = 0; i < size; i++) {
      const e = Math.abs(input.elevation[i] ?? 0);
      if (e > maxElevAbs) maxElevAbs = e;
      if (discharge) {
        const d = discharge[i] ?? 0;
        if (d > maxDischarge) maxDischarge = d;
      }
    }
    const coastTerrainType = input.coastTerrainType | 0;

    // Per-(group, tile) physical suitability in [0,1]. Hard constraints stay
    // pass/fail (isCandidateCompatibleWithFeature); this only RANKS passing tiles
    // and ranks WHICH wonders place (best-suitability), so different terrain →
    // different selected wonder sets. Deterministic, no RNG.
    const suitabilityAt = (group: WonderGroup, candidate: Candidate): number => {
      const i = candidate.plotIndex;
      const relief = candidate.relief;
      const elevN = clamp01((input.elevation[i] ?? 0) / maxElevAbs);
      const arid = clamp01(input.aridityIndex[i] ?? 0);
      const riverN = clamp01((input.riverClass[i] ?? RIVER_CLASS_NONE) / RIVER_CLASS_MAJOR);
      const moist = effectiveMoisture ? clamp01(effectiveMoisture[i] ?? 0) : 0;
      const temp = surfaceTemperature ? (surfaceTemperature[i] ?? 15) : 15;
      const warm = clamp01(temp / 35);
      const temperate = clamp01(1 - Math.abs(temp - 15) / 20);
      const vegN = vegetationDensity ? clamp01(vegetationDensity[i] ?? 0) : 0;
      const fertN = fertility ? clamp01(fertility[i] ?? 0) : 0;
      const dischN =
        discharge && maxDischarge > 0 ? clamp01((discharge[i] ?? 0) / maxDischarge) : riverN;
      const slopeN = slopeClass ? clamp01((slopeClass[i] ?? 0) / 4) : relief;
      const isWater = (input.landMask[i] ?? 0) === 0;
      const isCoast = (input.terrainType[i] ?? -1) === coastTerrainType;
      const shelfN = isWater && isCoast ? 1 : 0;
      const deepN = isWater && !isCoast ? 1 : 0;
      switch (group) {
        case "A": // volcano subaerial (Kilimanjaro, Fuji)
          return clamp01(0.55 * relief + 0.35 * elevN + 0.1 * warm);
        case "B": // volcano caldera coast (Thera)
          return clamp01(0.5 * shelfN + 0.3 * relief + 0.2 * warm);
        case "C": // reef / shallow marine (Barrier Reef, Great Blue Hole, Mapu'a Vaea)
          return clamp01(0.55 * shelfN + 0.3 * warm + 0.15 * (1 - arid));
        case "D": // deep ocean (Bermuda)
          return clamp01(0.7 * deepN + 0.3 * (1 - arid));
        case "E": // waterfall / river-fed (Gullfoss, Iguazu)
          return clamp01(0.45 * dischN + 0.3 * slopeN + 0.25 * relief);
        case "F": // mountain monolith (Everest, Hoerikwaggo, Zhangjiajie, Torres, Machapuchare, Vihren, Vinicunca)
          return clamp01(0.5 * elevN + 0.4 * relief + 0.1 * (1 - vegN));
        case "G": // mountain-adjacent lowland (Valley of Flowers)
          return clamp01(0.45 * fertN + 0.3 * moist + 0.25 * (1 - relief));
        case "H": // arid relief — canyon / inselberg (Grand Canyon, Uluru)
          return clamp01(0.5 * arid + 0.3 * elevN + 0.2 * relief);
        case "I": // forest (Redwood)
          return clamp01(0.55 * vegN + 0.3 * moist + 0.15 * temperate);
        default:
          return clamp01(0.6 * relief + 0.4 * elevN);
      }
    };

    const allTiles: Candidate[] = new Array(size);
    for (let i = 0; i < size; i++) {
      allTiles[i] = {
        plotIndex: i,
        relief: clamp01((reliefByTile[i] ?? 0) / reliefScale),
        elevation: input.elevation[i] ?? 0,
      };
    }

    const compatibilityContext = {
      width,
      height,
      terrainType: input.terrainType,
      biomeType: input.biomeType,
      featureType: input.featureType,
      landMask: input.landMask,
      riverClass: input.riverClass,
      coastTerrainType,
      mountainTerrainType: input.mountainTerrainType | 0,
      iceFeatureType: input.iceFeatureType | 0,
      noFeatureType,
      naturalWonderBlockedMask: input.naturalWonderBlockedMask,
      lakeMask: input.lakeMask,
    };

    // Per-wonder candidate ranking: each wonder's constraint-passing tiles sorted
    // by its own suitability. `bestSuitability` (the top tile's score) ranks WHICH
    // wonders are placed.
    type WonderPlan = {
      feature: NaturalWonderFeatureCandidate;
      sorted: Candidate[];
      suitByPlot: Map<number, number>;
      bestSuitability: number;
    };
    const plans: WonderPlan[] = featureCatalog.map((feature) => {
      const group = wonderGroup(feature.featureType);
      const scored: Array<{ candidate: Candidate; suit: number }> = [];
      for (const candidate of allTiles) {
        if (!isCandidateCompatibleWithFeature({ feature, candidate, ...compatibilityContext })) {
          continue;
        }
        scored.push({ candidate, suit: suitabilityAt(group, candidate) });
      }
      scored.sort((a, b) => b.suit - a.suit || a.candidate.plotIndex - b.candidate.plotIndex);
      return {
        feature,
        sorted: scored.map((s) => s.candidate),
        suitByPlot: new Map(scored.map((s) => [s.candidate.plotIndex, s.suit])),
        bestSuitability: scored.length > 0 ? scored[0]!.suit : -1,
      };
    });

    const minSpacingTiles = Math.max(0, config.minSpacingTiles | 0);
    const targetCount = Math.min(wondersCount, featureCatalog.length, size);
    const selected: Array<{
      plotIndex: number;
      featureType: number;
      direction: number;
      elevation: number;
      priority: number;
      fallbackPlotIndices?: number[];
    }> = [];
    const usedPlots = new Set<number>();

    const pickTile = (plan: WonderPlan, minSpacing: number): Candidate | null => {
      for (const candidate of plan.sorted) {
        if (usedPlots.has(candidate.plotIndex)) continue;
        const footprint = getFootprintIndices({
          plotIndex: candidate.plotIndex,
          width,
          height,
          footprintOffsetsByParity: plan.feature.footprintOffsetsByParity,
        });
        if (!footprint || footprint.some((p) => usedPlots.has(p))) continue;
        if (minSpacing > 0) {
          let tooClose = false;
          for (const placed of selected) {
            if (hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, width) < minSpacing) {
              tooClose = true;
              break;
            }
          }
          if (tooClose) continue;
        }
        return candidate;
      }
      return null;
    };

    // Next-best anchors for a wonder after its primary is chosen (Fix 2): the
    // materialize step retries these in order when the engine refuses the
    // primary, since canHaveFeatureParam-true does not guarantee
    // setFeatureType-success. Fallbacks are ALTERNATIVES to the primary (only one
    // is ever stamped), so they may sit near the primary; they must avoid OTHER
    // placed wonders' footprints and the primary's own footprint, and prefer the
    // spacing floor. Suitability-descending (plan.sorted), capped.
    const FALLBACK_CAP = 6;
    const collectFallbacks = (
      plan: WonderPlan,
      primaryPlotIndex: number,
      primaryFootprint: readonly number[]
    ): number[] => {
      const excluded = new Set(primaryFootprint);
      const spaced: number[] = [];
      const unspaced: number[] = [];
      for (const candidate of plan.sorted) {
        if (candidate.plotIndex === primaryPlotIndex) continue;
        if (usedPlots.has(candidate.plotIndex) || excluded.has(candidate.plotIndex)) continue;
        const footprint = getFootprintIndices({
          plotIndex: candidate.plotIndex,
          width,
          height,
          footprintOffsetsByParity: plan.feature.footprintOffsetsByParity,
        });
        if (!footprint) continue;
        if (footprint.some((p) => usedPlots.has(p) || excluded.has(p))) continue;
        let tooClose = false;
        if (minSpacingTiles > 0) {
          for (const placed of selected) {
            if (hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, width) < minSpacingTiles) {
              tooClose = true;
              break;
            }
          }
        }
        (tooClose ? unspaced : spaced).push(candidate.plotIndex);
        if (spaced.length >= FALLBACK_CAP) break;
      }
      return [...spaced, ...unspaced].slice(0, FALLBACK_CAP);
    };

    // Cross-wonder selection: diminishing-returns greedy. Each iteration places
    // the remaining wonder with the highest effective score, where a wonder's
    // best-achievable suitability decays by GROUP_DISCOUNT for every wonder
    // already placed from its requirement group:
    //   effectiveScore = placeFirstBonus + bestSuitability * GROUP_DISCOUNT^groupCount
    // placeFirst wonders carry a large additive bonus so the engine
    // base-generator ordering is preserved, but the per-group decay still
    // applies. The decay makes a 2nd water wonder (1.0 * 0.5 = 0.5) lose to a
    // fresh land wonder (~0.7), so the selected set is a cross-type MIX whose
    // composition tracks the map's terrain (more mountains → more mountain
    // wonders) instead of collapsing to the abundant-water groups. Fully
    // deterministic — argmax with a stable tie-break, no RNG.
    const PLACE_FIRST_BONUS = 1000;
    const GROUP_DISCOUNT = 0.5;
    const groupSelectedCount = new Map<WonderGroup, number>();
    const remaining = plans.filter((plan) => plan.bestSuitability >= 0);

    const effectiveScore = (plan: WonderPlan): number => {
      const alreadyFromGroup =
        groupSelectedCount.get(wonderGroup(plan.feature.featureType)) ?? 0;
      const bonus = plan.feature.placeFirst ? PLACE_FIRST_BONUS : 0;
      return bonus + plan.bestSuitability * GROUP_DISCOUNT ** alreadyFromGroup;
    };
    // Strict "is a a better pick than b?" ordering: higher effective score, then
    // higher best suitability, then lower featureType (a stable last resort —
    // featureType is unique per catalog entry, so ties always resolve).
    const isBetterPick = (a: WonderPlan, b: WonderPlan): boolean => {
      const sa = effectiveScore(a);
      const sb = effectiveScore(b);
      if (sa !== sb) return sa > sb;
      if (a.bestSuitability !== b.bestSuitability) return a.bestSuitability > b.bestSuitability;
      return a.feature.featureType < b.feature.featureType;
    };

    while (selected.length < targetCount && remaining.length > 0) {
      let bestIdx = 0;
      for (let i = 1; i < remaining.length; i++) {
        if (isBetterPick(remaining[i]!, remaining[bestIdx]!)) bestIdx = i;
      }
      const plan = remaining[bestIdx]!;
      const candidate = pickTile(plan, minSpacingTiles) ?? pickTile(plan, 0);
      if (!candidate) {
        // No free, in-bounds footprint remains for this wonder: drop it.
        remaining.splice(bestIdx, 1);
        continue;
      }
      const primaryFootprint = getFootprintIndices({
        plotIndex: candidate.plotIndex,
        width,
        height,
        footprintOffsetsByParity: plan.feature.footprintOffsetsByParity,
      }) ?? [candidate.plotIndex];
      // Collect fallbacks BEFORE the primary footprint is marked used, so they
      // are scored as alternatives to the primary (excluding the primary's own
      // footprint), not as tiles forbidden by it.
      const fallbackPlotIndices = collectFallbacks(plan, candidate.plotIndex, primaryFootprint);
      for (const plotIndex of primaryFootprint) usedPlots.add(plotIndex);
      const group = wonderGroup(plan.feature.featureType);
      groupSelectedCount.set(group, (groupSelectedCount.get(group) ?? 0) + 1);
      selected.push({
        plotIndex: candidate.plotIndex,
        featureType: plan.feature.featureType,
        direction: plan.feature.direction,
        elevation: candidate.elevation,
        priority: clamp01(plan.suitByPlot.get(candidate.plotIndex) ?? 0),
        ...(fallbackPlotIndices.length > 0 ? { fallbackPlotIndices } : {}),
      });
      remaining.splice(bestIdx, 1);
    }

    return {
      width,
      height,
      wondersCount,
      targetCount,
      plannedCount: selected.length,
      placements: selected,
    };
  },
});

function sanitizeIdArray(values: readonly number[] | undefined): number[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((value) => Math.trunc(value))
        .filter((value) => Number.isFinite(value) && value >= 0)
    )
  ).sort((a, b) => a - b);
}

function sanitizeFootprintOffsetList(
  values: readonly { dx?: number; dy?: number }[] | undefined
): FootprintOffset[] {
  if (!Array.isArray(values)) return [{ dx: 0, dy: 0 }];
  const offsets: FootprintOffset[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const dx = Math.trunc(value.dx ?? Number.NaN);
    const dy = Math.trunc(value.dy ?? Number.NaN);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
    const key = `${dx}:${dy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    offsets.push({ dx, dy });
  }
  return offsets;
}

function sanitizeFootprintOffsetsByParity(
  value: { even?: readonly { dx?: number; dy?: number }[]; odd?: readonly { dx?: number; dy?: number }[] } | undefined
): FootprintOffsetsByParity {
  return {
    even: sanitizeFootprintOffsetList(value?.even),
    odd: sanitizeFootprintOffsetList(value?.odd),
  };
}

function sanitizeStringArray(values: readonly string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  ).sort();
}

function wrappedX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

function getFootprintIndices(args: {
  plotIndex: number;
  width: number;
  height: number;
  footprintOffsetsByParity: FootprintOffsetsByParity;
}): number[] | null {
  const y = (args.plotIndex / args.width) | 0;
  const x = args.plotIndex - y * args.width;
  // Resolve parity at the concrete anchor (odd-R): odd rows and even rows use
  // distinct offset sets (map-policy byParity helper).
  const offsets = (y & 1) === 1 ? args.footprintOffsetsByParity.odd : args.footprintOffsetsByParity.even;
  const indices: number[] = [];
  const seen = new Set<number>();
  for (const offset of offsets) {
    const fy = y + offset.dy;
    if (fy < 0 || fy >= args.height) return null;
    const fx = wrappedX(x + offset.dx, args.width);
    const index = fy * args.width + fx;
    if (seen.has(index)) continue;
    seen.add(index);
    indices.push(index);
  }
  return indices.length > 0 ? indices : null;
}

function forEachFootprintNeighbor(args: {
  footprint: readonly number[];
  width: number;
  height: number;
  fn: (plotIndex: number) => void;
}): void {
  const seen = new Set(args.footprint);
  for (const plotIndex of args.footprint) {
    const y = (plotIndex / args.width) | 0;
    const x = plotIndex - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      args.fn(ni);
    }
  }
}

function hasTerrainWithinHexDistance(args: {
  centerIndex: number;
  width: number;
  height: number;
  terrainType: Uint8Array;
  targetTerrainType: number;
  maxDistance: number;
}): boolean {
  const queue: Array<{ index: number; distance: number }> = [
    { index: args.centerIndex, distance: 0 },
  ];
  const seen = new Set<number>([args.centerIndex]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (
      current.distance > 0 &&
      (args.terrainType[current.index] ?? -1) === args.targetTerrainType
    ) {
      return true;
    }
    if (current.distance >= args.maxDistance) continue;
    const y = (current.index / args.width) | 0;
    const x = current.index - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      queue.push({ index: ni, distance: current.distance + 1 });
    }
  }
  return false;
}

function satisfiesFeatureTags(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  footprint: readonly number[];
  width: number;
  height: number;
  landMask: Uint8Array;
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
  riverClass: Uint8Array;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
}): boolean {
  for (const tag of args.feature.featureTags) {
    switch (tag) {
      // Engine-deferred tags: the pure op has no shelf/reef/forest signal and no
      // cliff oracle (cliffs are engine edge state, unavailable offline), so these
      // are pass-through pre-filters; the engine `canHaveFeatureParam` at stamp
      // time is the legality authority. FEATURE_FOREST/SHALLOWWATER/VOLCANO are
      // wired to real physical signals in the suitability pass (Task 5).
      case "FEATURE_FOREST":
      case "FEATURE_REEF":
      case "SHALLOWWATER":
      case "VOLCANO":
      case "ADJACENTCLIFF":
      case "NOLANDOPPOSITECLIFF":
        break;
      case "ADJACENTTOCOAST": {
        let adjacentToCoast = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -1) === args.coastTerrainType) {
              adjacentToCoast = true;
            }
          },
        });
        if (!adjacentToCoast) return false;
        break;
      }
      case "NOTADJACENTTOLAND": {
        let adjacentToLand = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.landMask[plotIndex] === 1) adjacentToLand = true;
          },
        });
        if (adjacentToLand) return false;
        break;
      }
      case "ADJACENTTOSAMETERRAIN": {
        const terrain = args.terrainType[args.candidate.plotIndex] ?? -1;
        let adjacentSameTerrain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -2) === terrain) adjacentSameTerrain = true;
          },
        });
        if (!adjacentSameTerrain) return false;
        break;
      }
      case "ADJACENTTOLAND": {
        let adjacentToLand = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.landMask[plotIndex] === 1) adjacentToLand = true;
          },
        });
        if (!adjacentToLand) return false;
        break;
      }
      case "ADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -1) === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (!adjacentMountain) return false;
        break;
      }
      case "ADJACENTTOSAMEBIOME": {
        const biome = args.biomeType[args.candidate.plotIndex] ?? -1;
        let adjacentSameBiome = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.biomeType[plotIndex] ?? -2) === biome) adjacentSameBiome = true;
          },
        });
        if (!adjacentSameBiome) return false;
        break;
      }
      case "NOTADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -1) === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (adjacentMountain) return false;
        break;
      }
      case "NOTADJACENTTOICE": {
        let adjacentIce = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.featureType[plotIndex] ?? -1) === args.iceFeatureType) adjacentIce = true;
          },
        });
        if (adjacentIce) return false;
        break;
      }
      case "NOTADJACENTTORIVER": {
        let adjacentRiver = false;
        for (const plotIndex of args.footprint) {
          if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
        }
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
          },
        });
        if (adjacentRiver) return false;
        break;
      }
      case "NOTNEARCOAST":
        for (const plotIndex of args.footprint) {
          if (
            hasTerrainWithinHexDistance({
              centerIndex: plotIndex,
              width: args.width,
              height: args.height,
              terrainType: args.terrainType,
              targetTerrainType: args.coastTerrainType,
              maxDistance: 2,
            })
          ) {
            return false;
          }
        }
        break;
      case "WATERFALL": {
        let adjacentRiver = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
          },
        });
        if (!adjacentRiver) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

function isCandidateCompatibleWithFeature(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  width: number;
  height: number;
  landMask: Uint8Array;
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
  riverClass: Uint8Array;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
  noFeatureType: number;
  naturalWonderBlockedMask: Uint8Array;
  lakeMask: Uint8Array;
}): boolean {
  const footprint = getFootprintIndices({
    plotIndex: args.candidate.plotIndex,
    width: args.width,
    height: args.height,
    footprintOffsetsByParity: args.feature.footprintOffsetsByParity,
  });
  if (!footprint) return false;
  for (const plotIndex of footprint) {
    if (args.naturalWonderBlockedMask[plotIndex] === 1) return false;
    if ((args.featureType[plotIndex] ?? args.noFeatureType) !== args.noFeatureType) {
      return false;
    }
    const terrain = args.terrainType[plotIndex] ?? -1;
    if (
      args.feature.validTerrainTypes.length > 0 &&
      !args.feature.validTerrainTypes.includes(terrain)
    ) {
      return false;
    }
    const biome = args.biomeType[plotIndex] ?? -1;
    if (args.feature.validBiomeTypes.length > 0 && !args.feature.validBiomeTypes.includes(biome)) {
      return false;
    }
    if (args.feature.noLake && args.lakeMask[plotIndex] === 1) return false;
  }
  if (
    !satisfiesFeatureTags({
      feature: args.feature,
      candidate: args.candidate,
      footprint,
      width: args.width,
      height: args.height,
      landMask: args.landMask,
      terrainType: args.terrainType,
      biomeType: args.biomeType,
      featureType: args.featureType,
      riverClass: args.riverClass,
      coastTerrainType: args.coastTerrainType,
      mountainTerrainType: args.mountainTerrainType,
      iceFeatureType: args.iceFeatureType,
    })
  ) {
    return false;
  }
  if (
    args.feature.minimumElevation !== null &&
    args.candidate.elevation < args.feature.minimumElevation
  ) {
    return false;
  }
  return true;
}
