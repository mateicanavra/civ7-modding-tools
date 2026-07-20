import type { OfficialResourceType } from "@civ7/map-policy";
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
 * choose the legal move that lexicographically reduces the complete vector of
 * pairwise seat disparities. A neutral destination may trim support only when
 * removing the source already improves that vector; additions are considered
 * only when no improving move exists.
 *
 * All adjusted destination tiles are inside their authored habitat and policy-legal for their type, hold the
 * per-type same-type spacing floor, keep cross-type adjacency clearance (the
 * official force-pass convention used by the region-minimum pass), respect
 * exclusion rules and the per-landmass density ceiling, and leave affinity as
 * a best-effort score. Unsatisfiable units become typed shortfalls.
 *
 * Determinism: candidate scans run in ascending plot/intent order; score ties
 * break on a splitmix-style hash of (seed, plotIndex, salt) — no call-order
 * coupling.
 */

type PlanIntent = {
  plotIndex: number;
  x: number;
  y: number;
  resourceType: OfficialResourceType;
  family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  laneId: string;
  laneKind: "land" | "water";
  phase: "rotation" | "range-floor" | "region-minimum" | "support";
  order: number;
  regionSlot: number;
  landmassId: number;
  inHabitat: boolean;
  support?:
    | {
        action: "move";
        reason: "support-floor" | "support-equity";
        seatIndex: number;
        fromPlotIndex: number;
      }
    | {
        action: "add";
        reason: "support-floor" | "support-equity";
        seatIndex: number;
      };
};

type AdjustmentEvidence = {
  reason: "support-floor" | "support-equity";
  resourceType: OfficialResourceType;
  toPlotIndex: number;
  seatIndex: number;
};

type Adjustment =
  | (AdjustmentEvidence & {
      action: "move";
      fromPlotIndex: number;
    })
  | (AdjustmentEvidence & {
      action: "add";
    });

type ApplyAdjustmentArgs =
  | {
      action: "move";
      sourceIntent: PlanIntent;
      reason: "support-floor" | "support-equity";
      seatIndex: number;
      resourceType: OfficialResourceType;
      toPlotIndex: number;
    }
  | {
      action: "add";
      reason: "support-floor" | "support-equity";
      seatIndex: number;
      resourceType: OfficialResourceType;
      toPlotIndex: number;
    };

type FloorShortfallReason =
  | "no-admitted-adjustment"
  | "floor-budget-exhausted"
  | "adjustment-disabled";

type EquityShortfallReason = "equity-unresolvable" | "equity-budget-exhausted";

type ShortfallReason = FloorShortfallReason | EquityShortfallReason;

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

function resourceSalt(resourceType: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < resourceType.length; i++) {
    hash ^= resourceType.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Moves or adds a bounded number of resource intents toward per-start support and equity
 * targets. It never mutates the engine; adjusted destinations pass the hard gates above while
 * affinity only biases their score. Each correction records provenance or a typed shortfall.
 */
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
      resourceType: OfficialResourceType;
      habitatMask: Uint8Array;
      legalMask: Uint8Array;
      intensity: Float32Array;
    };
    const eligibilityByType = new Map<OfficialResourceType, Eligibility>();
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
    const metaByType = new Map<OfficialResourceType, TypeMeta>();
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
    type CompiledRule = {
      partner: OfficialResourceType;
      relation: "affinity" | "exclusion";
      radius: number;
    };
    const rulesByType = new Map<OfficialResourceType, CompiledRule[]>();
    for (const rule of plan.settings.affinityRules ?? []) {
      const push = (from: OfficialResourceType, partner: OfficialResourceType) => {
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
    const plotsByType = new Map<OfficialResourceType, number[]>();
    const countByType = new Map<OfficialResourceType, number>();
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
    const supportChangingPlots = [...seatsByPlot.keys()].sort((left, right) => left - right);

    // Immutable destination capacity breaks equal-support ties by the amount
    // of admitted room available to each seat, rather than by incidental
    // iteration position. Counting type/plot pairs preserves type-specific
    // habitat and policy admission.
    const admittedCapacityBySeat = seatZones.map((zone) => {
      let capacity = 0;
      for (const eligibility of eligibilityByType.values()) {
        for (const plotIndex of zone) {
          if (eligibility.habitatMask[plotIndex] !== 0 && eligibility.legalMask[plotIndex] !== 0) {
            capacity += 1;
          }
        }
      }
      return capacity;
    });

    const counts = seats.map((_seat, seatPos) => {
      let count = 0;
      for (const intent of intents) if (seatZones[seatPos]!.has(intent.plotIndex)) count += 1;
      return count;
    });
    const supportBefore = [...counts];
    const compareSeatPriority = (left: number, right: number): number =>
      counts[left]! - counts[right]! ||
      admittedCapacityBySeat[left]! - admittedCapacityBySeat[right]! ||
      seats[left]!.seatIndex - seats[right]!.seatIndex;

    const adjustments: Adjustment[] = [];
    const floorShortfallReasons = new Map<number, FloorShortfallReason>();
    let equityShortfallReason: EquityShortfallReason | null = null;

    const gapOf = (): number | null => {
      if (counts.length < 2) return null;
      return Math.max(...counts) - Math.min(...counts);
    };
    const gapBefore = gapOf();

    // --- invariant helpers ---------------------------------------------------------------------
    const violatesTypeSpacing = (
      plotIndex: number,
      resourceType: OfficialResourceType,
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
      resourceType: OfficialResourceType,
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

    const admittedDestinationsFor = function* (
      resourceType: OfficialResourceType,
      candidatePlots: Iterable<number>,
      args: {
        ignorePlot: number | null;
        removedLandmassId: number | null;
        sourceIntent?: PlanIntent;
      }
    ): Iterable<Destination> {
      const eligibility = eligibilityByType.get(resourceType);
      if (!eligibility) return;
      for (const plotIndex of candidatePlots) {
        if (plotIndex < 0 || plotIndex >= size) continue;
        if (eligibility.legalMask[plotIndex] === 0) continue;
        if (eligibility.habitatMask[plotIndex] === 0) continue;
        if (usedPlots.has(plotIndex) && plotIndex !== args.ignorePlot) continue;
        if (seatPlots.has(plotIndex)) continue;
        if (violatesTypeSpacing(plotIndex, resourceType, args.ignorePlot)) continue;
        if (violatesCrossClearance(plotIndex, args.ignorePlot)) continue;
        const ruleState = excludedAt(resourceType, plotIndex, args.ignorePlot);
        if (ruleState.excluded) continue;
        if (exceedsLandmassCeiling(plotIndex, args.removedLandmassId)) continue;
        if (
          args.sourceIntent &&
          !moveAllowedFrom(args.sourceIntent, regionSlotByTile[plotIndex] ?? 0)
        ) {
          continue;
        }
        // Habitat and policy have already admitted the destination; intensity
        // and affinity only order candidates within that closed set.
        const score =
          (eligibility.intensity[plotIndex] ?? 0) +
          ruleState.affinityBonus +
          hash01(seed, plotIndex, (0x5e5 ^ resourceSalt(eligibility.resourceType)) >>> 0) * 1e-3;
        yield { plotIndex, score };
      }
    };

    const destinationFor = (
      resourceType: OfficialResourceType,
      candidatePlots: Iterable<number>,
      args: {
        ignorePlot: number | null;
        removedLandmassId: number | null;
        sourceIntent?: PlanIntent;
      }
    ): Destination | null => {
      let best: Destination | null = null;
      for (const candidate of admittedDestinationsFor(resourceType, candidatePlots, args)) {
        if (best === null || candidate.score > best.score) best = candidate;
      }
      return best;
    };

    // Prefer repairing the sole legal-only exception (region-minimum intents)
    // when several sources can serve the same admitted destination.
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

    const applyAdjustment = (args: ApplyAdjustmentArgs): void => {
      const toPlot = args.toPlotIndex;
      const y = (toPlot / width) | 0;
      const x = toPlot - y * width;
      const destRegionSlot = regionSlotByTile[toPlot] ?? 0;
      const destLandmassId = landmassIdByTile[toPlot] ?? -1;

      if (args.action === "move") {
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
        intent.inHabitat = true;
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
          family: templates ? templates.family : "terrestrial",
          laneId: templates ? templates.laneId : "unknown",
          laneKind: templates ? templates.laneKind : "land",
          phase: "support",
          order: nextOrder++,
          regionSlot: destRegionSlot,
          landmassId: destLandmassId,
          inHabitat: true,
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

    if (!enabled || strength === 0) {
      for (let seatPos = 0; seatPos < seats.length; seatPos++) {
        const deficit = supportFloor - counts[seatPos]!;
        if (deficit > 0) {
          floorShortfallReasons.set(seats[seatPos]!.seatIndex, "adjustment-disabled");
        }
      }
    } else {
      // --- phase 1: per-start support floor (E3.1) --------------------------------------------
      const seatOrder = seats.map((_seat, seatPos) => seatPos).sort(compareSeatPriority);
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
            if (intent.support) continue;
            if (seatsByPlot.has(intent.plotIndex)) continue;
            const dest = destinationFor(intent.resourceType, seatZones[seatPos]!, {
              ignorePlot: intent.plotIndex,
              removedLandmassId: intent.landmassId,
              sourceIntent: intent,
            });
            if (!dest) continue;
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
            let bestAdd: { resourceType: OfficialResourceType; dest: Destination } | null = null;
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
            floorShortfallReasons.set(seat.seatIndex, "no-admitted-adjustment");
            break;
          }
          filled += 1;
        }
        if (counts[seatPos]! < supportFloor && filled >= budget && budget < deficit) {
          floorShortfallReasons.set(seat.seatIndex, "floor-budget-exhausted");
        }
      }

      // --- phase 2: cross-player support equity (E3.2) ----------------------------------------
      if (counts.length >= 2) {
        type EquityVector = readonly number[];
        type EquityMove = {
          intent: PlanIntent;
          dest: Destination;
          vector: EquityVector;
          score: number;
          evidenceSeatPos: number;
        };
        type EquityAdd = {
          resourceType: OfficialResourceType;
          dest: Destination;
          vector: EquityVector;
          evidenceSeatPos: number;
        };

        const equityVector = (values: readonly number[]): EquityVector => {
          const disparities: number[] = [];
          for (let left = 0; left < values.length; left += 1) {
            for (let right = left + 1; right < values.length; right += 1) {
              disparities.push(Math.abs(values[left]! - values[right]!));
            }
          }
          return disparities.sort((left, right) => right - left);
        };
        const compareEquityVectors = (left: EquityVector, right: EquityVector): number => {
          for (let index = 0; index < left.length; index += 1) {
            const difference = left[index]! - right[index]!;
            if (difference !== 0) return difference;
          }
          return 0;
        };
        const simulatedMoveCounts = (
          sourcePlotIndex: number,
          destinationPlotIndex: number
        ): readonly number[] => {
          const sourceSeats = new Set(seatsByPlot.get(sourcePlotIndex) ?? []);
          const destinationSeats = new Set(seatsByPlot.get(destinationPlotIndex) ?? []);
          return counts.map(
            (count, seatPos) =>
              count - (sourceSeats.has(seatPos) ? 1 : 0) + (destinationSeats.has(seatPos) ? 1 : 0)
          );
        };
        const simulatedAddCounts = (destinationPlotIndex: number): readonly number[] => {
          const destinationSeats = new Set(seatsByPlot.get(destinationPlotIndex) ?? []);
          return counts.map((count, seatPos) => count + (destinationSeats.has(seatPos) ? 1 : 0));
        };
        const admittedEquityVector = (
          simulated: readonly number[],
          currentVector: EquityVector,
          currentMin: number,
          currentMax: number
        ): EquityVector | null => {
          if (simulated.some((count) => count < supportFloor || count < currentMin)) return null;
          if (Math.max(...simulated) > currentMax) return null;
          const vector = equityVector(simulated);
          return compareEquityVectors(vector, currentVector) < 0 ? vector : null;
        };
        const evidenceSeatForMove = (
          sourcePlotIndex: number,
          destinationPlotIndex: number
        ): number | null => {
          const sourceSeats = new Set(seatsByPlot.get(sourcePlotIndex) ?? []);
          const destinationSeats = new Set(seatsByPlot.get(destinationPlotIndex) ?? []);
          const recipients = [...destinationSeats].filter((seatPos) => !sourceSeats.has(seatPos));
          if (recipients.length > 0) {
            recipients.sort(
              (left, right) =>
                counts[left]! - counts[right]! || seats[left]!.seatIndex - seats[right]!.seatIndex
            );
            return recipients[0]!;
          }
          const donors = [...sourceSeats].filter((seatPos) => !destinationSeats.has(seatPos));
          donors.sort(
            (left, right) =>
              counts[right]! - counts[left]! || seats[left]!.seatIndex - seats[right]!.seatIndex
          );
          return donors[0] ?? null;
        };
        const evidenceSeatForAdd = (destinationPlotIndex: number): number | null => {
          const recipients = [...(seatsByPlot.get(destinationPlotIndex) ?? [])];
          recipients.sort(
            (left, right) =>
              counts[left]! - counts[right]! || seats[left]!.seatIndex - seats[right]!.seatIndex
          );
          return recipients[0] ?? null;
        };
        const moveRanksBefore = (candidate: EquityMove, incumbent: EquityMove): boolean => {
          const objective = compareEquityVectors(candidate.vector, incumbent.vector);
          return objective < 0 || (objective === 0 && candidate.score > incumbent.score);
        };
        const addRanksBefore = (candidate: EquityAdd, incumbent: EquityAdd): boolean => {
          const objective = compareEquityVectors(candidate.vector, incumbent.vector);
          return objective < 0 || (objective === 0 && candidate.dest.score > incumbent.dest.score);
        };

        const equityBudget = Math.min(
          EQUITY_ITERATION_CAP,
          Math.ceil(strength * seats.length * Math.max(1, supportFloor) * 2)
        );
        let equityApplied = 0;
        while (equityApplied < equityBudget) {
          const max = Math.max(...counts);
          const min = Math.min(...counts);
          if (max - min <= equityTolerance) break;
          const currentVector = equityVector(counts);
          let bestMove: EquityMove | null = null;
          for (const intent of intents) {
            if (intent.support) continue;
            const destinationArgs = {
              ignorePlot: intent.plotIndex,
              removedLandmassId: intent.landmassId,
              sourceIntent: intent,
            };

            for (const dest of admittedDestinationsFor(
              intent.resourceType,
              supportChangingPlots,
              destinationArgs
            )) {
              const vector = admittedEquityVector(
                simulatedMoveCounts(intent.plotIndex, dest.plotIndex),
                currentVector,
                min,
                max
              );
              if (!vector) continue;
              const evidenceSeatPos = evidenceSeatForMove(intent.plotIndex, dest.plotIndex);
              if (evidenceSeatPos === null) continue;
              const candidate = {
                intent,
                dest,
                vector,
                score: movePairScore(intent, dest),
                evidenceSeatPos,
              };
              if (bestMove === null || moveRanksBefore(candidate, bestMove)) bestMove = candidate;
            }

            // Every neutral destination has the same support signature. Scan
            // that larger surface only when removing this source already
            // improves the complete disparity vector.
            const removalVector = admittedEquityVector(
              simulatedMoveCounts(intent.plotIndex, -1),
              currentVector,
              min,
              max
            );
            if (!removalVector) continue;
            const neutralDest = destinationFor(intent.resourceType, neutralPlotStream(), {
              ignorePlot: intent.plotIndex,
              removedLandmassId: intent.landmassId,
              sourceIntent: intent,
            });
            if (!neutralDest) continue;
            const evidenceSeatPos = evidenceSeatForMove(intent.plotIndex, neutralDest.plotIndex);
            if (evidenceSeatPos === null) continue;
            const candidate = {
              intent,
              dest: neutralDest,
              vector: removalVector,
              score: movePairScore(intent, neutralDest),
              evidenceSeatPos,
            };
            if (bestMove === null || moveRanksBefore(candidate, bestMove)) bestMove = candidate;
          }

          if (bestMove) {
            applyAdjustment({
              action: "move",
              reason: "support-equity",
              seatIndex: seats[bestMove.evidenceSeatPos]!.seatIndex,
              resourceType: bestMove.intent.resourceType,
              toPlotIndex: bestMove.dest.plotIndex,
              sourceIntent: bestMove.intent,
            });
            equityApplied += 1;
            continue;
          }

          // No improving move: try an admitted addition that improves the same
          // complete objective without exceeding the current maximum.
          let bestAdd: EquityAdd | null = null;
          for (const resourceType of typeOrder) {
            const meta = metaByType.get(resourceType);
            if (!meta) continue;
            if ((countByType.get(resourceType) ?? 0) >= meta.maxCount) continue;
            for (const dest of admittedDestinationsFor(resourceType, supportChangingPlots, {
              ignorePlot: null,
              removedLandmassId: null,
            })) {
              const vector = admittedEquityVector(
                simulatedAddCounts(dest.plotIndex),
                currentVector,
                min,
                max
              );
              if (!vector) continue;
              const evidenceSeatPos = evidenceSeatForAdd(dest.plotIndex);
              if (evidenceSeatPos === null) continue;
              const candidate = { resourceType, dest, vector, evidenceSeatPos };
              if (bestAdd === null || addRanksBefore(candidate, bestAdd)) bestAdd = candidate;
            }
          }
          if (bestAdd) {
            applyAdjustment({
              action: "add",
              reason: "support-equity",
              seatIndex: seats[bestAdd.evidenceSeatPos]!.seatIndex,
              resourceType: bestAdd.resourceType,
              toPlotIndex: bestAdd.dest.plotIndex,
            });
            equityApplied += 1;
            continue;
          }

          equityShortfallReason = "equity-unresolvable";
          break;
        }
        const finalGap = gapOf();
        if (
          finalGap !== null &&
          finalGap > equityTolerance &&
          equityApplied >= equityBudget &&
          equityShortfallReason === null
        ) {
          equityShortfallReason = "equity-budget-exhausted";
        }
      }
    }

    function* neutralPlotStream(): Iterable<number> {
      for (let plotIndex = 0; plotIndex < size; plotIndex++) {
        if (seatsByPlot.has(plotIndex)) continue;
        yield plotIndex;
      }
    }

    const shortfalls: Array<{
      seatIndex: number;
      reason: ShortfallReason;
      missing: number;
    }> = [];
    for (let seatPos = 0; seatPos < seats.length; seatPos++) {
      const seatIndex = seats[seatPos]!.seatIndex;
      const missing = Math.max(0, supportFloor - counts[seatPos]!);
      if (missing === 0) continue;
      const reason = floorShortfallReasons.get(seatIndex);
      if (!reason) {
        throw new Error(
          `[resources] Missing terminal floor-shortfall reason for seat ${seatIndex} (${missing} support missing).`
        );
      }
      shortfalls.push({ seatIndex, reason, missing });
    }
    const gapAfter = gapOf();
    const equityMissing =
      enabled && strength > 0 && gapAfter !== null ? Math.max(0, gapAfter - equityTolerance) : 0;
    if (equityMissing > 0) {
      if (!equityShortfallReason) {
        throw new Error(
          `[resources] Missing terminal equity-shortfall reason for support gap ${gapAfter}.`
        );
      }
      const poorestPos = counts.findIndex((count) => count === Math.min(...counts));
      const poorestSeat = seats[poorestPos];
      if (!poorestSeat) {
        throw new Error("[resources] Missing minimum-support seat for terminal equity shortfall.");
      }
      shortfalls.push({
        seatIndex: poorestSeat.seatIndex,
        reason: equityShortfallReason,
        missing: equityMissing,
      });
    }
    shortfalls.sort((a, b) => a.seatIndex - b.seatIndex || a.reason.localeCompare(b.reason));

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
        gapAfter,
      },
      settings,
    };
  },
});
