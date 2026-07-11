import type { OfficialResourceType } from "@civ7/map-policy";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import SelectResourceSitesContract from "../contract.js";
import { spacingFloorFor } from "../policy/spacing-floors.js";

/**
 * Default site selection: deterministic blue-noise site stream + official
 * weight deficit rotation + range-floor and region-minimum passes.
 *
 * Determinism: all randomness is a splitmix-style hash of (seed, plotIndex,
 * salt) — no call-order coupling, so the same inputs always produce the same
 * plan on every runtime.
 */

type DemandState = {
  readonly index: number;
  readonly resourceType: OfficialResourceType;
  readonly resourceSalt: number;
  readonly family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  readonly laneId: string;
  readonly laneKind: "land" | "water";
  readonly weight: number;
  readonly effectiveWeight: number;
  readonly authoredTargetCount: number;
  readonly effectiveTargetCount: number;
  readonly minCount: number;
  readonly maxCount: number;
  readonly minimumPerHemisphere: number;
  readonly requiredForAge: boolean;
  readonly habitatMask: Uint8Array;
  readonly legalMask: Uint8Array;
  readonly intensity: Float32Array;
  readonly spacingFloorTiles: number;
  readonly habitatTileCount: number;
  readonly legalTileCount: number;
  readonly eligibleTileCount: number;
  runningWeight: number;
  plannedPlots: number[];
  rotationCount: number;
  rangeFloorCount: number;
  regionMinimumCount: number;
  shortfalls: Map<string, number>;
};

type Intent = {
  plotIndex: number;
  x: number;
  y: number;
  resourceType: OfficialResourceType;
  family: DemandState["family"];
  laneId: string;
  laneKind: "land" | "water";
  phase: "rotation" | "range-floor" | "region-minimum";
  order: number;
  regionSlot: number;
  landmassId: number;
  inHabitat: boolean;
};

// TODO: put this in the core map lib -- anything that is likely needed by multiple domains or operations and is generic (not recipe specific) should go in there
function hash32(seed: number, a: number, b: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ a, 0x85ebca6b) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h ^ b, 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h;
}

function hash01(seed: number, a: number, b: number): number {
  return hash32(seed, a, b) / 0x100000000;
}

function resourceSalt(resourceType: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < resourceType.length; i++) {
    hash ^= resourceType.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] !== 0) count += 1;
  return count;
}

export const defaultStrategy = createStrategy(SelectResourceSitesContract, "default", {
  // TODO: if you need to normalize, do it in the normalize method, not in run.
  normalize: (config) => {
    return config;
  },
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = width * height;
    const seed = input.seed | 0;
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new Error(`[resources] Invalid grid for select-resource-sites: ${width}x${height}.`);
    }
    const landMask = input.landMask;
    const lakeMask = input.lakeMask;
    const landmassIdByTile = input.landmassIdByTile;
    const regionSlotByTile = input.regionSlotByTile;
    if (landMask.length !== size || lakeMask.length !== size) {
      throw new Error("[resources] select-resource-sites land/lake masks must match grid size.");
    }
    if (landmassIdByTile.length !== size || regionSlotByTile.length !== size) {
      throw new Error(
        "[resources] select-resource-sites landmass/region fields must match grid size."
      );
    }

    const density = config.density;
    const sparsity = config.sparsity;
    const rarityFidelity = config.rarityFidelity;
    const siteSpacingTiles = Math.max(1, config.siteSpacingTiles | 0);
    const perTypeSpacingFloorScale = config.perTypeSpacingFloorScale;
    const equityMaxDensityRatio = config.equityMaxDensityRatio;
    const familyDensity = {
      aquatic: config.familyDensity.aquatic,
      cultivated: config.familyDensity.cultivated,
      terrestrial: config.familyDensity.terrestrial,
      geological: config.familyDensity.geological,
    };

    // --- demand state -------------------------------------------------------------------------
    const demands: DemandState[] = input.demands.map((row, index) => {
      if (row.habitatMask.length !== size || row.legalMask.length !== size) {
        throw new Error(
          `[resources] Demand ${row.resourceType} masks must match grid size ${size}.`
        );
      }
      if (row.intensity.length !== size) {
        throw new Error(`[resources] Demand ${row.resourceType} intensity must match grid size.`);
      }
      let eligibleTileCount = 0;
      for (let i = 0; i < size; i++) {
        if (row.habitatMask[i] !== 0 && row.legalMask[i] !== 0) eligibleTileCount += 1;
      }
      const familyScale = familyDensity[row.family];
      const scaled = Math.round(row.targetCount * density * familyScale);
      const rangeClamped = Math.min(row.maxCount, Math.max(row.minCount, scaled));
      const effectiveTargetCount = Math.max(
        0,
        Math.round(rangeClamped - sparsity * (rangeClamped - row.minCount))
      );
      const spacingFloorTiles = Math.max(
        2,
        Math.round(
          spacingFloorFor(effectiveTargetCount) * perTypeSpacingFloorScale * (1 + sparsity)
        )
      );
      return {
        index,
        resourceType: row.resourceType,
        resourceSalt: resourceSalt(row.resourceType),
        family: row.family,
        laneId: row.laneId,
        laneKind: row.laneKind,
        weight: row.weight,
        effectiveWeight: Math.pow(Math.max(1, row.weight) / 10, rarityFidelity),
        authoredTargetCount: row.targetCount,
        effectiveTargetCount,
        minCount: row.minCount,
        maxCount: row.maxCount,
        minimumPerHemisphere: row.minimumPerHemisphere,
        requiredForAge: row.requiredForAge,
        habitatMask: row.habitatMask as Uint8Array,
        legalMask: row.legalMask as Uint8Array,
        intensity: row.intensity as Float32Array,
        spacingFloorTiles,
        habitatTileCount: countMask(row.habitatMask as Uint8Array),
        legalTileCount: countMask(row.legalMask as Uint8Array),
        eligibleTileCount,
        runningWeight: 0,
        plannedPlots: [],
        rotationCount: 0,
        rangeFloorCount: 0,
        regionMinimumCount: 0,
        shortfalls: new Map(),
      } satisfies DemandState;
    });
    const eligibleByDemand: Uint8Array[] = demands.map((demand) => {
      const eligible = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        if (demand.habitatMask[i] !== 0 && demand.legalMask[i] !== 0) eligible[i] = 1;
      }
      return eligible;
    });

    // --- affinity / exclusion rules -----------------------------------------------------------
    type CompiledRule = {
      partner: OfficialResourceType;
      relation: "affinity" | "exclusion";
      radius: number;
    };
    const rulesByType = new Map<OfficialResourceType, CompiledRule[]>();
    for (const rule of config.affinityRules) {
      const push = (from: OfficialResourceType, partner: OfficialResourceType) => {
        const list = rulesByType.get(from) ?? [];
        list.push({ partner, relation: rule.relation, radius: rule.radiusTiles });
        rulesByType.set(from, list);
      };
      push(rule.resourceA, rule.resourceB);
      push(rule.resourceB, rule.resourceA);
    }

    // --- shared occupancy + spacing state -----------------------------------------------------
    const usedPlots = new Set<number>();
    const sitePlots: number[] = [];
    const intents: Intent[] = [];
    const plotsByType = new Map<OfficialResourceType, number[]>();

    const totalQualifyingLand = (() => {
      const totalLand = input.landmassTileCounts.reduce((acc, count) => acc + count, 0);
      return input.landmassTileCounts
        .map((count, id) => ({ id, count }))
        .filter((row) => totalLand > 0 && row.count / totalLand >= 0.1);
    })();
    const qualifyingLandmassIds = new Set(totalQualifyingLand.map((row) => row.id));
    const qualifyingLandTiles = totalQualifyingLand.reduce((acc, row) => acc + row.count, 0);
    const placedByLandmass = new Map<number, number>();
    let placedOnQualifyingLand = 0;
    let equitySkippedSiteCount = 0;

    const tileOf = (plotIndex: number): { x: number; y: number } => {
      const y = (plotIndex / width) | 0;
      return { x: plotIndex - y * width, y };
    };

    const violatesSpacing = (
      plotIndex: number,
      plots: readonly number[],
      floor: number
    ): boolean => {
      if (floor <= 0) return false;
      for (const placed of plots) {
        if (hexDistanceOddQPeriodicX(plotIndex, placed, width) < floor) return true;
      }
      return false;
    };

    const ruleStateAt = (
      demand: DemandState,
      plotIndex: number
    ): { excluded: boolean; affinityBonus: number } => {
      const rules = rulesByType.get(demand.resourceType);
      if (!rules || rules.length === 0) return { excluded: false, affinityBonus: 0 };
      let affinityBonus = 0;
      for (const rule of rules) {
        const partnerPlots = plotsByType.get(rule.partner);
        if (!partnerPlots || partnerPlots.length === 0) continue;
        for (const partnerPlot of partnerPlots) {
          if (hexDistanceOddQPeriodicX(plotIndex, partnerPlot, width) <= rule.radius) {
            if (rule.relation === "exclusion") return { excluded: true, affinityBonus: 0 };
            affinityBonus += 0.75;
            break;
          }
        }
      }
      return { excluded: false, affinityBonus };
    };

    const recordShortfall = (demand: DemandState, reason: string, count: number): void => {
      if (count <= 0) return;
      demand.shortfalls.set(reason, (demand.shortfalls.get(reason) ?? 0) + count);
    };

    const place = (demand: DemandState, plotIndex: number, phase: Intent["phase"]): void => {
      const { x, y } = tileOf(plotIndex);
      usedPlots.add(plotIndex);
      demand.plannedPlots.push(plotIndex);
      const typePlots = plotsByType.get(demand.resourceType) ?? [];
      typePlots.push(plotIndex);
      plotsByType.set(demand.resourceType, typePlots);
      if (phase === "rotation") demand.rotationCount += 1;
      else if (phase === "range-floor") demand.rangeFloorCount += 1;
      else demand.regionMinimumCount += 1;
      const landmassId = landmassIdByTile[plotIndex] ?? -1;
      if (landmassId >= 0 && qualifyingLandmassIds.has(landmassId)) {
        placedByLandmass.set(landmassId, (placedByLandmass.get(landmassId) ?? 0) + 1);
        placedOnQualifyingLand += 1;
      }
      intents.push({
        plotIndex,
        x,
        y,
        resourceType: demand.resourceType,
        family: demand.family,
        laneId: demand.laneId,
        laneKind: demand.laneKind,
        phase,
        order: intents.length,
        regionSlot: regionSlotByTile[plotIndex] ?? 0,
        landmassId,
        inHabitat: demand.habitatMask[plotIndex] !== 0,
      });
    };

    // --- rotation pass --------------------------------------------------------------------------
    // Deterministic site stream: plots ordered by hash, accepted when they
    // clear the cross-type blue-noise floor and the intensity thinning gate.
    const totalEffectiveTarget = demands.reduce(
      (acc, demand) => acc + demand.effectiveTargetCount,
      0
    );
    const plotOrder = Array.from({ length: size }, (_unused, plotIndex) => plotIndex).sort(
      (a, b) => hash32(seed, a, 0xa11ce) - hash32(seed, b, 0xa11ce)
    );

    let rotationPlaced = 0;
    // Two sweeps: the first is thinned by habitat intensity (inhomogeneous
    // Poisson shaping, E2.5); the second fills remaining per-type deficits on
    // the same blue-noise stream without the intensity gate so authored
    // targets are reachable (E2.7). Spacing floors hold on both sweeps.
    for (let sweep = 0; sweep < 2 && rotationPlaced < totalEffectiveTarget; sweep++) {
      for (const plotIndex of plotOrder) {
        if (rotationPlaced >= totalEffectiveTarget) break;
        if (usedPlots.has(plotIndex)) continue;

        // Cross-type blue-noise floor between accepted sites.
        if (violatesSpacing(plotIndex, sitePlots, siteSpacingTiles)) continue;

        // Equity ceiling on qualifying landmasses (land plots only).
        const landmassId = landmassIdByTile[plotIndex] ?? -1;
        if (
          landmassId >= 0 &&
          qualifyingLandmassIds.has(landmassId) &&
          qualifyingLandmassIds.size >= 2 &&
          placedOnQualifyingLand >= qualifyingLandmassIds.size * 2
        ) {
          const tiles = input.landmassTileCounts[landmassId] ?? 0;
          const meanDensity =
            qualifyingLandTiles > 0 ? placedOnQualifyingLand / qualifyingLandTiles : 0;
          const landmassDensity = tiles > 0 ? (placedByLandmass.get(landmassId) ?? 0) / tiles : 0;
          if (meanDensity > 0 && landmassDensity > equityMaxDensityRatio * meanDensity) {
            equitySkippedSiteCount += 1;
            continue;
          }
        }

        // Co-eligible demands at this plot.
        let bestIntensity = 0;
        const coEligible: DemandState[] = [];
        for (const demand of demands) {
          if (demand.rotationCount + demand.rangeFloorCount >= demand.effectiveTargetCount)
            continue;
          if (eligibleByDemand[demand.index]![plotIndex] === 0) continue;
          if (violatesSpacing(plotIndex, demand.plannedPlots, demand.spacingFloorTiles)) continue;
          const ruleState = ruleStateAt(demand, plotIndex);
          if (ruleState.excluded) continue;
          coEligible.push(demand);
          const intensity = demand.intensity[plotIndex] ?? 0;
          if (intensity > bestIntensity) bestIntensity = intensity;
        }
        if (coEligible.length === 0) continue;

        // Inhomogeneous thinning: acceptance probability rises with habitat intensity.
        if (sweep === 0 && hash01(seed, plotIndex, 0x7417) > 0.3 + 0.7 * bestIntensity) continue;

        // Official deficit rotation: max running weight wins; ties prefer the
        // larger remaining deficit, then the deterministic hash.
        let chosen: DemandState | null = null;
        let chosenScore = Number.NEGATIVE_INFINITY;
        for (const demand of coEligible) {
          const ruleState = ruleStateAt(demand, plotIndex);
          const deficit =
            demand.effectiveTargetCount > 0
              ? (demand.effectiveTargetCount - demand.rotationCount) / demand.effectiveTargetCount
              : 0;
          const score =
            demand.runningWeight +
            ruleState.affinityBonus +
            deficit * 1e-3 +
            hash01(seed, plotIndex, demand.resourceSalt) * 1e-6;
          if (score > chosenScore) {
            chosen = demand;
            chosenScore = score;
          }
        }
        if (!chosen) continue;

        sitePlots.push(plotIndex);
        place(chosen, plotIndex, "rotation");
        chosen.runningWeight -= chosen.effectiveWeight;
        rotationPlaced += 1;
      }
    }

    // --- range-floor pass ------------------------------------------------------------------------
    // Top types up to expectedCountRange.min with typed provenance. Candidates
    // are POLICY-LEGAL tiles with a strong in-lane preference (habitat bonus
    // dominates intensity), so out-of-lane placements happen only when the
    // lane is exhausted and stay within the E2.3 fidelity budget; per-type
    // spacing floors are preserved. Cross-type site spacing relaxes to
    // same-plot avoidance here (the official minimum force pass behaves the
    // same way).
    // Stage A tops every type up to expectedCountRange.min; stage B then
    // fills toward the effective target. Counts are corpus-range authority
    // (E2.7); the weight rotation governs allocation among co-eligible sites
    // where ranges leave slack (E2.1).
    for (const stage of ["min", "target"] as const) {
      for (const demand of demands) {
        const floorTarget =
          stage === "min"
            ? Math.min(demand.minCount, demand.maxCount)
            : Math.min(demand.effectiveTargetCount, demand.maxCount);
        while (demand.plannedPlots.length < floorTarget) {
          let best = -1;
          let bestScore = Number.NEGATIVE_INFINITY;
          const legal = demand.legalMask;
          for (let plotIndex = 0; plotIndex < size; plotIndex++) {
            if (legal[plotIndex] === 0 || usedPlots.has(plotIndex)) continue;
            if (violatesSpacing(plotIndex, demand.plannedPlots, demand.spacingFloorTiles)) continue;
            if (violatesSpacing(plotIndex, sitePlots, 1)) continue;
            if (ruleStateAt(demand, plotIndex).excluded) continue;
            let contested = 0;
            for (const other of demands) {
              if (other === demand) continue;
              if (eligibleByDemand[other.index]![plotIndex] !== 0) contested += 1;
            }
            const score =
              (demand.habitatMask[plotIndex] !== 0 ? 10 : 0) +
              (demand.intensity[plotIndex] ?? 0) -
              contested * 0.05 +
              hash01(seed, plotIndex, (0xf100 ^ demand.resourceSalt) >>> 0) * 1e-3;
            if (score > bestScore) {
              best = plotIndex;
              bestScore = score;
            }
          }
          if (best < 0) {
            recordShortfall(
              demand,
              demand.legalTileCount === 0 ? "eligible-tiles-exhausted" : "spacing-floor-preserved",
              floorTarget - demand.plannedPlots.length
            );
            break;
          }
          sitePlots.push(best);
          place(demand, best, "range-floor");
        }
      }
    }

    // --- region-minimum pass ---------------------------------------------------------------------
    // Official semantics: per landmass-region, MinimumPerHemisphere +
    // MapResourceMinimumAmountModifier, gated by isResourceRequiredForAge,
    // forced onto legal plots with no adjacent resource.
    const regionMinimums: Array<{
      resourceType: OfficialResourceType;
      regionSlot: number;
      required: number;
      fromRotation: number;
      forced: number;
      shortfall: number;
    }> = [];
    for (const demand of demands) {
      if (!demand.requiredForAge || demand.minimumPerHemisphere <= 0) continue;
      const required = Math.max(0, demand.minimumPerHemisphere + input.minimumAmountModifier);
      if (required === 0) continue;
      for (const regionSlot of [1, 2] as const) {
        const have = demand.plannedPlots.filter(
          (plot) => (regionSlotByTile[plot] ?? 0) === regionSlot
        ).length;
        let forced = 0;
        let deficit = Math.max(0, required - have);
        while (deficit > 0 && demand.plannedPlots.length < demand.maxCount) {
          let best = -1;
          let bestScore = Number.NEGATIVE_INFINITY;
          for (let plotIndex = 0; plotIndex < size; plotIndex++) {
            if ((regionSlotByTile[plotIndex] ?? 0) !== regionSlot) continue;
            if (demand.legalMask[plotIndex] === 0 || usedPlots.has(plotIndex)) continue;
            // Official force-pass semantics relax cross-type spacing to
            // adjacency avoidance, but the per-type floor still holds (E2.6
            // dominates; unreachable minimums become recorded shortfalls).
            if (violatesSpacing(plotIndex, sitePlots, 2)) continue;
            if (violatesSpacing(plotIndex, demand.plannedPlots, demand.spacingFloorTiles)) continue;
            const score =
              (demand.habitatMask[plotIndex] !== 0 ? 1 : 0) +
              (demand.intensity[plotIndex] ?? 0) +
              hash01(seed, plotIndex, (0x4e6 ^ demand.resourceSalt) >>> 0) * 1e-3;
            if (score > bestScore) {
              best = plotIndex;
              bestScore = score;
            }
          }
          if (best < 0) break;
          sitePlots.push(best);
          place(demand, best, "region-minimum");
          forced += 1;
          deficit -= 1;
        }
        const shortfall = Math.max(0, required - have - forced);
        if (shortfall > 0) {
          recordShortfall(
            demand,
            demand.plannedPlots.length >= demand.maxCount
              ? "max-count-reached"
              : "region-tiles-exhausted",
            shortfall
          );
        }
        regionMinimums.push({
          resourceType: demand.resourceType,
          regionSlot,
          required,
          fromRotation: have,
          forced,
          shortfall,
        });
      }
    }

    const perType = demands.map((demand) => ({
      resourceType: demand.resourceType,
      family: demand.family,
      laneId: demand.laneId,
      laneKind: demand.laneKind,
      weight: demand.weight,
      effectiveWeight: demand.effectiveWeight,
      authoredTargetCount: demand.authoredTargetCount,
      effectiveTargetCount: demand.effectiveTargetCount,
      minCount: demand.minCount,
      maxCount: demand.maxCount,
      spacingFloorTiles: demand.spacingFloorTiles,
      habitatTileCount: demand.habitatTileCount,
      legalTileCount: demand.legalTileCount,
      eligibleTileCount: demand.eligibleTileCount,
      plannedCount: demand.plannedPlots.length,
      rotationCount: demand.rotationCount,
      rangeFloorCount: demand.rangeFloorCount,
      regionMinimumCount: demand.regionMinimumCount,
      shortfalls: Array.from(demand.shortfalls.entries()).map(([reason, count]) => ({
        resourceType: demand.resourceType,
        reason: reason as
          | "eligible-tiles-exhausted"
          | "spacing-floor-preserved"
          | "max-count-reached"
          | "region-tiles-exhausted",
        count,
      })),
    }));

    return {
      width,
      height,
      seed,
      plannedCount: intents.length,
      rotationCount: intents.filter((intent) => intent.phase === "rotation").length,
      rangeFloorCount: intents.filter((intent) => intent.phase === "range-floor").length,
      regionMinimumCount: intents.filter((intent) => intent.phase === "region-minimum").length,
      siteSpacingTiles,
      equitySkippedSiteCount,
      intents,
      perType,
      regionMinimums,
      settings: {
        density,
        sparsity,
        rarityFidelity,
        perTypeSpacingFloorScale,
        equityMaxDensityRatio,
        affinityRuleCount: config.affinityRules.length,
        affinityRules: config.affinityRules.map((rule) => ({
          resourceA: rule.resourceA,
          resourceB: rule.resourceB,
          relation: rule.relation,
          radiusTiles: rule.radiusTiles,
        })),
      },
    };
  },
});
