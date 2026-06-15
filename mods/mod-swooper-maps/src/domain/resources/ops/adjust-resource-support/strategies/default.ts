import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexRadiusIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import AdjustResourceSupportContract from "../contract.js";

/**
 * Default support pass: bounded move/add adjustment over the resource plan.
 *
 * Phase 1 (floor, E3.1): every seated start gets at least supportFloor
 * planned sites within supportRadiusTiles. Each deficit unit prefers MOVING a
 * site that serves no start (count-preserving — per-type ranges, Spearman
 * stratification, and region minimums hold exactly) and falls back to ADDING
 * a site for a type with maxCount headroom.
 *
 * Phase 2 (equity, E3.2): while max−min support exceeds equityTolerance,
 * move one site out of the richest start's radius — preferably into the
 * poorest start's radius, otherwise to a neutral in-habitat plot — with
 * removal/gain safety checks so no seat drops below the floor or the current
 * minimum and no destination recreates the old maximum.
 *
 * All destination tiles are policy-legal for their type, hold the per-type
 * same-type spacing floor, keep cross-type adjacency clearance (the official
 * force-pass convention used by the region-minimum pass), respect
 * affinity/exclusion rules echoed in the plan settings, and respect the
 * per-landmass equity ceiling. Unsatisfiable units become typed shortfalls.
 *
 * Determinism: candidate scans run in ascending plot/intent order; score ties
 * break on a splitmix-style hash of (seed, plotIndex, salt) — no call-order
 * coupling.
 */

type PlanIntent = {
  plotIndex: number;
  x: number;
  y: number;
  resourceType: string;
  resourceTypeId: number;
  family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  laneId: string;
  laneKind: "land" | "water";
  phase: "rotation" | "range-floor" | "region-minimum" | "support";
  order: number;
  regionSlot: number;
  landmassId: number;
  inHabitat: boolean;
  support?: {
    action: "move" | "add";
    reason: "support-floor" | "support-equity";
    seatIndex: number;
    fromPlotIndex?: number;
  };
};

type Adjustment = {
  action: "move" | "add";
  reason: "support-floor" | "support-equity";
  resourceType: string;
  resourceTypeId: number;
  fromPlotIndex?: number;
  toPlotIndex: number;
  seatIndex: number;
};

type ShortfallReason =
  | "no-legal-tile-in-radius"
  | "spacing-floor-preserved"
  | "no-movable-site"
  | "equity-unresolvable"
  | "adjustment-budget-exhausted"
  | "adjustment-disabled";

const EQUITY_ITERATION_CAP = 64;
const CROSS_TYPE_CLEARANCE = 2;

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

export const defaultStrategy = createStrategy(AdjustResourceSupportContract, "default", {
  run: (input, config) => {
    const plan = input.plan;
    const width = plan.width | 0;
    const height = plan.height | 0;
    const size = width * height;
    const seed = input.seed | 0;
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new Error(`[resources] Invalid grid for adjust-resource-support: ${width}x${height}.`);
    }
    if (input.landmassIdByTile.length !== size || input.regionSlotByTile.length !== size) {
      throw new Error(
        "[resources] adjust-resource-support landmass/region fields must match grid size."
      );
    }
    const landmassIdByTile = input.landmassIdByTile;
    const regionSlotByTile = input.regionSlotByTile;

    const enabled = config.enabled;
    const supportFloor = Math.max(0, config.supportFloor | 0);
    const radius = Math.max(1, config.supportRadiusTiles | 0);
    const equityTolerance = Math.max(0, config.equityTolerance | 0);
    const strength = Math.min(1, Math.max(0, config.strength));

    const settings = {
      enabled,
      supportFloor,
      supportRadiusTiles: radius,
      equityTolerance,
      strength,
    };

    // --- eligibility / per-type metadata -----------------------------------------------------
    type Eligibility = {
      resourceType: string;
      resourceTypeId: number;
      habitatMask: Uint8Array;
      legalMask: Uint8Array;
      intensity: Float32Array;
    };
    const eligibilityByType = new Map<string, Eligibility>();
    for (const row of input.eligibility) {
      if (row.habitatMask.length !== size || row.legalMask.length !== size) {
        throw new Error(
          `[resources] adjust-resource-support eligibility masks for ${row.resourceType} must match grid size ${size}.`
        );
      }
      if (row.intensity.length !== size) {
        throw new Error(
          `[resources] adjust-resource-support intensity for ${row.resourceType} must match grid size.`
        );
      }
      eligibilityByType.set(row.resourceType, {
        resourceType: row.resourceType,
        resourceTypeId: row.resourceTypeId,
        habitatMask: row.habitatMask as Uint8Array,
        legalMask: row.legalMask as Uint8Array,
        intensity: row.intensity as Float32Array,
      });
    }

    type TypeMeta = {
      spacingFloorTiles: number;
      minCount: number;
      maxCount: number;
    };
    const metaByType = new Map<string, TypeMeta>();
    for (const row of plan.perType) {
      metaByType.set(row.resourceType, {
        spacingFloorTiles: row.spacingFloorTiles,
        minCount: row.minCount,
        maxCount: row.maxCount,
      });
    }

    // Region-minimum guard: a move must not drop a type's per-region count to
    // (or below) its satisfied requirement (E2.2).
    const requiredByTypeRegion = new Map<string, number>();
    for (const row of plan.regionMinimums) {
      requiredByTypeRegion.set(`${row.resourceType}:${row.regionSlot}`, row.required);
    }

    // Exclusion/affinity rules echoed from selection settings (E3.4 parity).
    type CompiledRule = { partner: string; relation: "affinity" | "exclusion"; radius: number };
    const rulesByType = new Map<string, CompiledRule[]>();
    for (const rule of plan.settings.affinityRules ?? []) {
      const push = (from: string, partner: string) => {
        const list = rulesByType.get(from) ?? [];
        list.push({ partner, relation: rule.relation, radius: rule.radiusTiles });
        rulesByType.set(from, list);
      };
      push(rule.resourceA, rule.resourceB);
      push(rule.resourceB, rule.resourceA);
    }

    // --- mutable plan state --------------------------------------------------------------------
    const intents: PlanIntent[] = plan.intents.map((intent) => ({
      plotIndex: intent.plotIndex,
      x: intent.x,
      y: intent.y,
      resourceType: intent.resourceType,
      resourceTypeId: intent.resourceTypeId,
      family: intent.family,
      laneId: intent.laneId,
      laneKind: intent.laneKind,
      phase: intent.phase,
      order: intent.order,
      regionSlot: intent.regionSlot,
      landmassId: intent.landmassId,
      inHabitat: intent.inHabitat,
    }));
    let nextOrder = intents.reduce((acc, intent) => Math.max(acc, intent.order + 1), 0);

    const usedPlots = new Set<number>(intents.map((intent) => intent.plotIndex));
    const plotsByType = new Map<string, number[]>();
    const countByType = new Map<string, number>();
    const countByTypeRegion = new Map<string, number>();
    for (const intent of intents) {
      const typePlots = plotsByType.get(intent.resourceType) ?? [];
      typePlots.push(intent.plotIndex);
      plotsByType.set(intent.resourceType, typePlots);
      countByType.set(intent.resourceType, (countByType.get(intent.resourceType) ?? 0) + 1);
      const regionKey = `${intent.resourceType}:${intent.regionSlot}`;
      countByTypeRegion.set(regionKey, (countByTypeRegion.get(regionKey) ?? 0) + 1);
    }

    // --- landmass equity state (E2.8) ----------------------------------------------------------
    const totalLand = input.landmassTileCounts.reduce((acc, count) => acc + count, 0);
    const qualifyingLandmassIds = new Set(
      input.landmassTileCounts
        .map((count, id) => ({ id, count }))
        .filter((row) => totalLand > 0 && row.count / totalLand >= 0.1)
        .map((row) => row.id)
    );
    const qualifyingLandTiles = input.landmassTileCounts.reduce(
      (acc, count, id) => (qualifyingLandmassIds.has(id) ? acc + count : acc),
      0
    );
    const placedByLandmass = new Map<number, number>();
    let placedOnQualifyingLand = 0;
    for (const intent of intents) {
      if (intent.landmassId >= 0 && qualifyingLandmassIds.has(intent.landmassId)) {
        placedByLandmass.set(intent.landmassId, (placedByLandmass.get(intent.landmassId) ?? 0) + 1);
        placedOnQualifyingLand += 1;
      }
    }
    const equityMaxDensityRatio = plan.settings.equityMaxDensityRatio;

    // --- seat zones ----------------------------------------------------------------------------
    const seats = input.starts.filter((seat) => seat.plotIndex >= 0 && seat.plotIndex < size);
    const seatPlots = new Set(seats.map((seat) => seat.plotIndex));
    const seatZones: Array<Set<number>> = seats.map(
      (seat) => new Set(getHexRadiusIndicesOddQ(seat.plotIndex, width, height, radius))
    );
    const seatsByPlot = new Map<number, number[]>();
    seatZones.forEach((zone, seatPos) => {
      for (const plot of zone) {
        const list = seatsByPlot.get(plot) ?? [];
        list.push(seatPos);
        seatsByPlot.set(plot, list);
      }
    });

    const counts = seats.map((_seat, seatPos) => {
      let count = 0;
      for (const intent of intents) if (seatZones[seatPos]!.has(intent.plotIndex)) count += 1;
      return count;
    });
    const supportBefore = [...counts];

    const adjustments: Adjustment[] = [];
    const shortfallCounts = new Map<string, number>();
    const recordShortfall = (seatIndex: number, reason: ShortfallReason, missing: number): void => {
      if (missing <= 0) return;
      const key = `${seatIndex}:${reason}`;
      shortfallCounts.set(key, (shortfallCounts.get(key) ?? 0) + missing);
    };

    const gapOf = (): number | null => {
      if (counts.length < 2) return null;
      return Math.max(...counts) - Math.min(...counts);
    };
    const gapBefore = gapOf();

    // --- invariant helpers ---------------------------------------------------------------------
    const violatesTypeSpacing = (
      plotIndex: number,
      resourceType: string,
      ignorePlot: number | null
    ): boolean => {
      const meta = metaByType.get(resourceType);
      const floor = meta ? meta.spacingFloorTiles : 0;
      if (floor <= 0) return false;
      for (const placed of plotsByType.get(resourceType) ?? []) {
        if (ignorePlot !== null && placed === ignorePlot) continue;
        if (hexDistanceOddQPeriodicX(plotIndex, placed, width) < floor) return true;
      }
      return false;
    };

    // CROSS_TYPE_CLEARANCE = 2 means "no other site on the plot or adjacent
    // to it" (the official force-pass convention), so an O(7) neighborhood
    // membership test suffices.
    const violatesCrossClearance = (plotIndex: number, ignorePlot: number | null): boolean => {
      for (const idx of getHexRadiusIndicesOddQ(
        plotIndex,
        width,
        height,
        CROSS_TYPE_CLEARANCE - 1
      )) {
        if (ignorePlot !== null && idx === ignorePlot) continue;
        if (usedPlots.has(idx)) return true;
      }
      return false;
    };

    const excludedAt = (
      resourceType: string,
      plotIndex: number,
      ignorePlot: number | null
    ): {
      excluded: boolean;
      affinityBonus: number;
    } => {
      const rules = rulesByType.get(resourceType);
      if (!rules || rules.length === 0) return { excluded: false, affinityBonus: 0 };
      let affinityBonus = 0;
      for (const rule of rules) {
        for (const partnerPlot of plotsByType.get(rule.partner) ?? []) {
          if (ignorePlot !== null && partnerPlot === ignorePlot) continue;
          if (hexDistanceOddQPeriodicX(plotIndex, partnerPlot, width) <= rule.radius) {
            if (rule.relation === "exclusion") return { excluded: true, affinityBonus: 0 };
            affinityBonus += 0.75;
            break;
          }
        }
      }
      return { excluded: false, affinityBonus };
    };

    const exceedsLandmassCeiling = (
      plotIndex: number,
      removedLandmassId: number | null
    ): boolean => {
      const landmassId = landmassIdByTile[plotIndex] ?? -1;
      if (landmassId < 0 || !qualifyingLandmassIds.has(landmassId)) return false;
      if (qualifyingLandmassIds.size < 2) return false;
      let total = placedOnQualifyingLand;
      let onLandmass = placedByLandmass.get(landmassId) ?? 0;
      if (
        removedLandmassId !== null &&
        removedLandmassId >= 0 &&
        qualifyingLandmassIds.has(removedLandmassId)
      ) {
        total -= 1;
        if (removedLandmassId === landmassId) onLandmass -= 1;
      }
      if (total < qualifyingLandmassIds.size * 2) return false;
      const tiles = input.landmassTileCounts[landmassId] ?? 0;
      const meanDensity = qualifyingLandTiles > 0 ? (total + 1) / qualifyingLandTiles : 0;
      const landmassDensity = tiles > 0 ? (onLandmass + 1) / tiles : 0;
      return meanDensity > 0 && landmassDensity > equityMaxDensityRatio * meanDensity;
    };

    /**
     * A move out of a region must not break a satisfied region minimum and
     * must not deepen an existing region-minimum shortfall (E2.2).
     */
    const moveAllowedFrom = (intent: PlanIntent, destRegionSlot: number): boolean => {
      if (intent.regionSlot === destRegionSlot) return true;
      const required = requiredByTypeRegion.get(`${intent.resourceType}:${intent.regionSlot}`) ?? 0;
      if (required <= 0) return true;
      const current = countByTypeRegion.get(`${intent.resourceType}:${intent.regionSlot}`) ?? 0;
      return current > required;
    };

    type Destination = { plotIndex: number; score: number };

    const destinationFor = (
      resourceType: string,
      candidatePlots: Iterable<number>,
      args: {
        ignorePlot: number | null;
        removedLandmassId: number | null;
        gainSafe?: (plotIndex: number) => boolean;
        /** Hard habitat gate (used for free-map destinations so adjustments do not erode E2.3). */
        requireHabitat?: boolean;
      }
    ): Destination | null => {
      const eligibility = eligibilityByType.get(resourceType);
      if (!eligibility) return null;
      let best: Destination | null = null;
      for (const plotIndex of candidatePlots) {
        if (plotIndex < 0 || plotIndex >= size) continue;
        if (eligibility.legalMask[plotIndex] === 0) continue;
        if (args.requireHabitat && eligibility.habitatMask[plotIndex] === 0) continue;
        if (usedPlots.has(plotIndex) && plotIndex !== args.ignorePlot) continue;
        if (seatPlots.has(plotIndex)) continue;
        if (violatesTypeSpacing(plotIndex, resourceType, args.ignorePlot)) continue;
        if (violatesCrossClearance(plotIndex, args.ignorePlot)) continue;
        const ruleState = excludedAt(resourceType, plotIndex, args.ignorePlot);
        if (ruleState.excluded) continue;
        if (exceedsLandmassCeiling(plotIndex, args.removedLandmassId)) continue;
        if (args.gainSafe && !args.gainSafe(plotIndex)) continue;
        // Habitat dominates (E2.3): in-lane destinations always outrank
        // out-of-lane ones; intensity + affinity order within the lane.
        const score =
          (eligibility.habitatMask[plotIndex] !== 0 ? 10 : 0) +
          (eligibility.intensity[plotIndex] ?? 0) +
          ruleState.affinityBonus +
          hash01(seed, plotIndex, 0x5e5 + eligibility.resourceTypeId) * 1e-3;
        if (best === null || score > best.score) best = { plotIndex, score };
      }
      return best;
    };

    // Fidelity-aware pair ranking (E2.3): relocating an out-of-lane site is
    // fidelity-neutral-or-positive, so out-of-lane sources get a bonus that
    // sits between the habitat-destination bonus (10) and the intensity term.
    // Aggregation-aware (E2.5): moving a site that participates in a
    // same-family proximity pair erodes the blue-noise-above-floor clustering
    // the geological gate measures, so paired sources are penalized —
    // isolated sites move first.
    const breaksAggregationPair = (sourceIntent: PlanIntent): boolean => {
      const meta = metaByType.get(sourceIntent.resourceType);
      const floor = meta ? meta.spacingFloorTiles : 0;
      for (const other of intents) {
        if (other === sourceIntent) continue;
        if (other.family !== sourceIntent.family) continue;
        const d = hexDistanceOddQPeriodicX(sourceIntent.plotIndex, other.plotIndex, width);
        if (d > floor && d <= floor + 2) return true;
      }
      return false;
    };
    const movePairScore = (sourceIntent: PlanIntent, dest: Destination): number =>
      dest.score + (sourceIntent.inHabitat ? 0 : 5) - (breaksAggregationPair(sourceIntent) ? 4 : 0);

    const applyAdjustment = (args: {
      action: "move" | "add";
      reason: "support-floor" | "support-equity";
      seatIndex: number;
      resourceType: string;
      toPlotIndex: number;
      sourceIntent?: PlanIntent;
    }): void => {
      const eligibility = eligibilityByType.get(args.resourceType)!;
      const toPlot = args.toPlotIndex;
      const y = (toPlot / width) | 0;
      const x = toPlot - y * width;
      const destRegionSlot = regionSlotByTile[toPlot] ?? 0;
      const destLandmassId = landmassIdByTile[toPlot] ?? -1;

      if (args.sourceIntent) {
        const intent = args.sourceIntent;
        const fromPlot = intent.plotIndex;
        usedPlots.delete(fromPlot);
        const typePlots = plotsByType.get(intent.resourceType) ?? [];
        const fromIdx = typePlots.indexOf(fromPlot);
        if (fromIdx >= 0) typePlots.splice(fromIdx, 1);
        typePlots.push(toPlot);
        const fromRegionKey = `${intent.resourceType}:${intent.regionSlot}`;
        countByTypeRegion.set(fromRegionKey, (countByTypeRegion.get(fromRegionKey) ?? 1) - 1);
        if (intent.landmassId >= 0 && qualifyingLandmassIds.has(intent.landmassId)) {
          placedByLandmass.set(
            intent.landmassId,
            (placedByLandmass.get(intent.landmassId) ?? 1) - 1
          );
          placedOnQualifyingLand -= 1;
        }
        for (const seatPos of seatsByPlot.get(fromPlot) ?? []) counts[seatPos]! -= 1;

        intent.plotIndex = toPlot;
        intent.x = x;
        intent.y = y;
        intent.regionSlot = destRegionSlot;
        intent.landmassId = destLandmassId;
        intent.inHabitat = eligibility.habitatMask[toPlot] !== 0;
        intent.support = {
          action: "move",
          reason: args.reason,
          seatIndex: args.seatIndex,
          fromPlotIndex: fromPlot,
        };
        adjustments.push({
          action: "move",
          reason: args.reason,
          resourceType: intent.resourceType,
          resourceTypeId: intent.resourceTypeId,
          fromPlotIndex: fromPlot,
          toPlotIndex: toPlot,
          seatIndex: args.seatIndex,
        });
      } else {
        const templates = plan.perType.find((row) => row.resourceType === args.resourceType);
        const intent: PlanIntent = {
          plotIndex: toPlot,
          x,
          y,
          resourceType: args.resourceType,
          resourceTypeId: eligibility.resourceTypeId,
          family: templates ? templates.family : "terrestrial",
          laneId: templates ? templates.laneId : "unknown",
          laneKind: templates ? templates.laneKind : "land",
          phase: "support",
          order: nextOrder++,
          regionSlot: destRegionSlot,
          landmassId: destLandmassId,
          inHabitat: eligibility.habitatMask[toPlot] !== 0,
          support: { action: "add", reason: args.reason, seatIndex: args.seatIndex },
        };
        intents.push(intent);
        const typePlots = plotsByType.get(args.resourceType) ?? [];
        typePlots.push(toPlot);
        plotsByType.set(args.resourceType, typePlots);
        countByType.set(args.resourceType, (countByType.get(args.resourceType) ?? 0) + 1);
        adjustments.push({
          action: "add",
          reason: args.reason,
          resourceType: args.resourceType,
          resourceTypeId: eligibility.resourceTypeId,
          toPlotIndex: toPlot,
          seatIndex: args.seatIndex,
        });
      }

      usedPlots.add(toPlot);
      const toRegionKey = `${args.resourceType}:${destRegionSlot}`;
      countByTypeRegion.set(toRegionKey, (countByTypeRegion.get(toRegionKey) ?? 0) + 1);
      if (destLandmassId >= 0 && qualifyingLandmassIds.has(destLandmassId)) {
        placedByLandmass.set(destLandmassId, (placedByLandmass.get(destLandmassId) ?? 0) + 1);
        placedOnQualifyingLand += 1;
      }
      for (const seatPos of seatsByPlot.get(toPlot) ?? []) counts[seatPos]! += 1;
    };

    // Deterministic type order for destination probing: corpus order from the plan.
    const typeOrder = plan.perType.map((row) => row.resourceType);

    const classifyFloorShortfall = (seatPos: number): ShortfallReason => {
      // Dominant-cause classification for an unfillable deficit unit.
      const zone = seatZones[seatPos]!;
      let anyLegalFree = false;
      for (const resourceType of typeOrder) {
        const eligibility = eligibilityByType.get(resourceType);
        if (!eligibility) continue;
        for (const plotIndex of zone) {
          if (eligibility.legalMask[plotIndex] === 0) continue;
          if (usedPlots.has(plotIndex) || seatPlots.has(plotIndex)) continue;
          anyLegalFree = true;
          if (
            !violatesTypeSpacing(plotIndex, resourceType, null) &&
            !violatesCrossClearance(plotIndex, null)
          ) {
            // A destination existed; the limit was source/headroom availability.
            return "no-movable-site";
          }
        }
      }
      return anyLegalFree ? "spacing-floor-preserved" : "no-legal-tile-in-radius";
    };

    if (!enabled || strength === 0) {
      for (let seatPos = 0; seatPos < seats.length; seatPos++) {
        const deficit = supportFloor - counts[seatPos]!;
        if (deficit > 0) recordShortfall(seats[seatPos]!.seatIndex, "adjustment-disabled", deficit);
      }
    } else {
      // --- phase 1: per-start support floor (E3.1) --------------------------------------------
      const seatOrder = seats
        .map((_seat, seatPos) => seatPos)
        .sort((a, b) => counts[a]! - counts[b]! || a - b);
      for (const seatPos of seatOrder) {
        const seat = seats[seatPos]!;
        const deficit = supportFloor - counts[seatPos]!;
        if (deficit <= 0) continue;
        const budget = Math.ceil(strength * deficit);
        let filled = 0;
        while (counts[seatPos]! < supportFloor && filled < budget) {
          let applied = false;

          // Prefer MOVE of a site serving no start (count-preserving).
          let bestMove: { intent: PlanIntent; dest: Destination; score: number } | null = null;
          for (const intent of intents) {
            if (seatsByPlot.has(intent.plotIndex)) continue;
            const dest = destinationFor(intent.resourceType, seatZones[seatPos]!, {
              ignorePlot: intent.plotIndex,
              removedLandmassId: intent.landmassId,
            });
            if (!dest) continue;
            const destRegion = regionSlotByTile[dest.plotIndex] ?? 0;
            if (!moveAllowedFrom(intent, destRegion)) continue;
            const score = movePairScore(intent, dest);
            if (bestMove === null || score > bestMove.score) {
              bestMove = { intent, dest, score };
            }
          }
          if (bestMove) {
            applyAdjustment({
              action: "move",
              reason: "support-floor",
              seatIndex: seat.seatIndex,
              resourceType: bestMove.intent.resourceType,
              toPlotIndex: bestMove.dest.plotIndex,
              sourceIntent: bestMove.intent,
            });
            applied = true;
          }

          // Fall back to ADD for a type with maxCount headroom.
          if (!applied) {
            let bestAdd: { resourceType: string; dest: Destination } | null = null;
            for (const resourceType of typeOrder) {
              const meta = metaByType.get(resourceType);
              if (!meta) continue;
              if ((countByType.get(resourceType) ?? 0) >= meta.maxCount) continue;
              const dest = destinationFor(resourceType, seatZones[seatPos]!, {
                ignorePlot: null,
                removedLandmassId: null,
              });
              if (!dest) continue;
              if (bestAdd === null || dest.score > bestAdd.dest.score) {
                bestAdd = { resourceType, dest };
              }
            }
            if (bestAdd) {
              applyAdjustment({
                action: "add",
                reason: "support-floor",
                seatIndex: seat.seatIndex,
                resourceType: bestAdd.resourceType,
                toPlotIndex: bestAdd.dest.plotIndex,
              });
              applied = true;
            }
          }

          if (!applied) {
            recordShortfall(
              seat.seatIndex,
              classifyFloorShortfall(seatPos),
              supportFloor - counts[seatPos]!
            );
            break;
          }
          filled += 1;
        }
        if (counts[seatPos]! < supportFloor && filled >= budget && budget < deficit) {
          recordShortfall(
            seat.seatIndex,
            "adjustment-budget-exhausted",
            supportFloor - counts[seatPos]!
          );
        }
      }

      // --- phase 2: cross-player support equity (E3.2) ----------------------------------------
      if (counts.length >= 2) {
        const equityBudget = Math.min(
          EQUITY_ITERATION_CAP,
          Math.ceil(strength * seats.length * Math.max(1, supportFloor) * 2)
        );
        let equityApplied = 0;
        while (equityApplied < equityBudget) {
          const max = Math.max(...counts);
          const min = Math.min(...counts);
          if (max - min <= equityTolerance) break;
          const richestPos = counts.findIndex((count) => count === max);
          const poorestPos = counts.findIndex((count) => count === min);
          const richest = seats[richestPos]!;
          const poorest = seats[poorestPos]!;

          // Removal safety: every seat covering the source plot stays at or
          // above both the floor and the current minimum. (Sources are
          // restricted to the richest seat's zone, so removal always lowers
          // the maximum.)
          const removalSafe = (plotIndex: number): boolean => {
            for (const seatPos of seatsByPlot.get(plotIndex) ?? []) {
              const after = counts[seatPos]! - 1;
              if (after < supportFloor || after < min) return false;
            }
            return true;
          };
          // Gain safety: no seat covering the destination reaches the old max.
          const gainSafe = (plotIndex: number): boolean => {
            for (const seatPos of seatsByPlot.get(plotIndex) ?? []) {
              if (counts[seatPos]! + 1 >= max) return false;
            }
            return true;
          };

          let bestMove: { intent: PlanIntent; dest: Destination; score: number } | null = null;
          for (const intent of intents) {
            if (!seatZones[richestPos]!.has(intent.plotIndex)) continue;
            if (!removalSafe(intent.plotIndex)) continue;
            // Preferred destination: the poorest seat's zone.
            let dest = destinationFor(intent.resourceType, seatZones[poorestPos]!, {
              ignorePlot: intent.plotIndex,
              removedLandmassId: intent.landmassId,
              gainSafe,
            });
            // Fallback: a neutral plot covered by no seat zone. The whole map
            // is available, so in-lane is required (E2.3 must not erode).
            if (!dest) {
              dest = destinationFor(intent.resourceType, neutralPlotStream(), {
                ignorePlot: intent.plotIndex,
                removedLandmassId: intent.landmassId,
                gainSafe: (plotIndex) => !seatsByPlot.has(plotIndex),
                requireHabitat: true,
              });
            }
            if (!dest) continue;
            const destRegion = regionSlotByTile[dest.plotIndex] ?? 0;
            if (!moveAllowedFrom(intent, destRegion)) continue;
            const score = movePairScore(intent, dest);
            if (bestMove === null || score > bestMove.score) {
              bestMove = { intent, dest, score };
            }
          }

          if (bestMove) {
            applyAdjustment({
              action: "move",
              reason: "support-equity",
              // Served seat: the poorest when the site lands in its radius,
              // otherwise the richest whose excess the move trims.
              seatIndex: seatZones[poorestPos]!.has(bestMove.dest.plotIndex)
                ? poorest.seatIndex
                : richest.seatIndex,
              resourceType: bestMove.intent.resourceType,
              toPlotIndex: bestMove.dest.plotIndex,
              sourceIntent: bestMove.intent,
            });
            equityApplied += 1;
            continue;
          }

          // No safe move: try ADD near the poorest seat (raises the minimum).
          let bestAdd: { resourceType: string; dest: Destination } | null = null;
          for (const resourceType of typeOrder) {
            const meta = metaByType.get(resourceType);
            if (!meta) continue;
            if ((countByType.get(resourceType) ?? 0) >= meta.maxCount) continue;
            const dest = destinationFor(resourceType, seatZones[poorestPos]!, {
              ignorePlot: null,
              removedLandmassId: null,
              gainSafe,
            });
            if (!dest) continue;
            if (bestAdd === null || dest.score > bestAdd.dest.score) {
              bestAdd = { resourceType, dest };
            }
          }
          if (bestAdd) {
            applyAdjustment({
              action: "add",
              reason: "support-equity",
              seatIndex: poorest.seatIndex,
              resourceType: bestAdd.resourceType,
              toPlotIndex: bestAdd.dest.plotIndex,
            });
            equityApplied += 1;
            continue;
          }

          recordShortfall(poorest.seatIndex, "equity-unresolvable", max - min - equityTolerance);
          break;
        }
        const finalGap = gapOf();
        if (
          finalGap !== null &&
          finalGap > equityTolerance &&
          equityApplied >= equityBudget &&
          !Array.from(shortfallCounts.keys()).some((key) => key.endsWith(":equity-unresolvable"))
        ) {
          const poorestPos = counts.findIndex((count) => count === Math.min(...counts));
          recordShortfall(
            seats[poorestPos]!.seatIndex,
            "adjustment-budget-exhausted",
            finalGap - equityTolerance
          );
        }
      }
    }

    function* neutralPlotStream(): Iterable<number> {
      for (let plotIndex = 0; plotIndex < size; plotIndex++) {
        if (seatsByPlot.has(plotIndex)) continue;
        yield plotIndex;
      }
    }

    const shortfalls = Array.from(shortfallCounts.entries())
      .map(([key, missing]) => {
        const splitAt = key.indexOf(":");
        return {
          seatIndex: Number(key.slice(0, splitAt)),
          reason: key.slice(splitAt + 1) as ShortfallReason,
          missing,
        };
      })
      .sort((a, b) => a.seatIndex - b.seatIndex || a.reason.localeCompare(b.reason));

    return {
      width,
      height,
      seed,
      plannedCount: intents.length,
      moveCount: adjustments.filter((adjustment) => adjustment.action === "move").length,
      addCount: adjustments.filter((adjustment) => adjustment.action === "add").length,
      intents,
      adjustments,
      shortfalls,
      perStart: seats.map((seat, seatPos) => ({
        seatIndex: seat.seatIndex,
        playerId: seat.playerId,
        plotIndex: seat.plotIndex,
        supportBefore: supportBefore[seatPos]!,
        supportAfter: counts[seatPos]!,
      })),
      equity: {
        gapBefore,
        gapAfter: gapOf(),
        tolerance: equityTolerance,
      },
      settings,
    };
  },
});
