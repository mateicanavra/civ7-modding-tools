import placement from "@mapgen/domain/placement";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import { warnLog } from "../../log.js";

type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;
type StartAssignmentArtifact = Static<
  typeof import("../../artifacts/index.js").artifacts["startAssignment"]["schema"]
>;
type StartSeatRecord = PlanStartsOutput["seats"][number];

/**
 * Loud degradation surfacing (E1.7): every non-regional seat and every
 * below-floor spacing is reported via warnLog (engine-safe; visible on live runs)
 * and a warn-tagged trace event (visible in verbose/studio traces). The
 * decisions themselves were already made — and recorded — by the plan-starts
 * op; this only makes them audible.
 */
function warnStartDegradations(
  context: ExtendedMapContext,
  seats: DeepReadonly<PlanStartsOutput["seats"]>
): void {
  const byRung = new Map<string, number[]>();
  for (const seat of seats) {
    if (seat.rung === "regional" && seat.plotIndex >= 0) continue;
    const key = seat.plotIndex < 0 ? "unseated" : seat.rung;
    const list = byRung.get(key) ?? [];
    list.push(seat.seatIndex);
    byRung.set(key, list);
  }
  for (const [path, seatIndices] of byRung) {
    warnLog(
      `[Placement] Start assignment degraded to ${path} for ${seatIndices.length} seat(s) ` +
        `(seat indices: ${seatIndices.join(", ")}); regional viability guarantees were relaxed for those seats.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.fallback",
      level: "warn",
      path,
      seats: seatIndices.length,
      seatIndices,
    }));
  }
  for (const seat of seats) {
    if (seat.plotIndex < 0) continue;
    if (!seat.imputedFlags.includes("spacing-below-floor")) continue;
    warnLog(
      `[Placement] Seat ${seat.seatIndex} seated below the hard spacing floor ` +
        `(achievedSpacing=${seat.achievedSpacing}); the alternative was an unseated player.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.spacingBelowFloor",
      level: "warn",
      seatIndex: seat.seatIndex,
      achievedSpacing: seat.achievedSpacing,
    }));
  }
  const reassigned = seats.filter((seat) => seat.imputedFlags.includes("region-reassigned"));
  if (reassigned.length) {
    const seatIndices = reassigned.map((seat) => seat.seatIndex);
    warnLog(
      `[Placement] ${reassigned.length} seat(s) region-reassigned (seat indices: ` +
        `${seatIndices.join(", ")}); their configured landmass region has zero start candidates on this map.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.regionReassigned",
      level: "warn",
      seats: reassigned.length,
      seatIndices,
    }));
  }
}

/**
 * Thin start materializer (placement-realignment S4): the plan-starts op owns
 * all selection authority and emits per-player typed seat intents; this shell
 * stamps them via adapter.setStartPosition, surfaces degradations loudly, and
 * builds the published startAssignment artifact. The old assign-or-throw is
 * gone: an unfillable map arrives here as degraded data. The ONLY hard-fail
 * left is a map with literally zero settleable land candidates.
 */
export function materializeStartAssignment(args: {
  context: ExtendedMapContext;
  plan: DeepReadonly<PlanStartsOutput>;
}): StartAssignmentArtifact {
  const { context, plan } = args;
  const { adapter } = context;
  const { width, height } = context.dimensions;
  if ((plan.width | 0) !== (width | 0) || (plan.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Start plan dimensions ${plan.width}x${plan.height} do not match map ${width}x${height}.`
    );
  }

  const seats = plan.seats;
  if (seats.length > 0 && plan.settleableTileCount === 0) {
    throw new Error(
      `[Placement] No settleable land candidates exist for ${seats.length} requested start seat(s) ` +
        `(candidates=${plan.candidateCount}, settleable=0).`
    );
  }

  let assigned = 0;
  const rungCounts = { regional: 0, openPool: 0, qualityRelaxed: 0, spacingRelaxed: 0 };
  const tierAssignments = { primary: 0, islandCluster: 0, marginal: 0, none: 0 };
  for (const seat of seats) {
    if (seat.plotIndex < 0) continue;
    adapter.setStartPosition(seat.plotIndex, seat.playerId);
    assigned++;
    if (seat.rung === "regional") rungCounts.regional++;
    else if (seat.rung === "open-pool") rungCounts.openPool++;
    else if (seat.rung === "quality-relaxed") rungCounts.qualityRelaxed++;
    else rungCounts.spacingRelaxed++;
    tierAssignments[seat.tier] += 1;
  }
  warnStartDegradations(context, seats);

  return {
    width,
    height,
    positions: seats.map((seat) => seat.plotIndex),
    seats: seats.map(cloneSeat),
    fairnessReport: {
      tolerance: plan.fairnessReport.tolerance,
      parity: [...plan.fairnessReport.parity],
      worstPairGap: plan.fairnessReport.worstPairGap,
      balanced: plan.fairnessReport.balanced,
      swaps: plan.fairnessReport.swaps.map((swap) => ({ ...swap })),
      relaxations: plan.fairnessReport.relaxations.map((entry) => ({ ...entry })),
    },
    status: plan.status,
    assigned,
    unseatedCount: seats.length - assigned,
    rungCounts,
    primaryAssigned: tierAssignments.primary,
    islandClusterAssigned: tierAssignments.islandCluster,
    marginalAssigned: tierAssignments.marginal,
    noneAssigned: tierAssignments.none,
    candidateCount: plan.candidateCount,
    rejectionCounts: plan.rejectionCounts.map((entry) => ({
      reason: entry.reason,
      count: entry.count,
    })),
    tierCounts: { ...plan.tierCounts },
    inputCoverage: plan.inputCoverage.map((row) => ({ ...row })),
  };
}

function cloneSeat(seat: DeepReadonly<StartSeatRecord>): StartSeatRecord {
  return {
    seatIndex: seat.seatIndex,
    playerId: seat.playerId,
    playerIdSource: seat.playerIdSource,
    regionSlot: seat.regionSlot,
    realizedRegionSlot: seat.realizedRegionSlot,
    plotIndex: seat.plotIndex,
    rung: seat.rung,
    status: seat.status,
    tier: seat.tier,
    score: seat.score,
    components: { ...seat.components },
    achievedSpacing: seat.achievedSpacing,
    imputedFlags: [...seat.imputedFlags],
  };
}
