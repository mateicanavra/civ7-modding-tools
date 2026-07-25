import placement from "@mapgen/domain/placement";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import type { MapContext, TraceJsonObject } from "@swooper/mapgen-core";
import {
  type ArtifactValueOf,
  createStep,
  type DeepReadonly,
  type Static,
} from "@swooper/mapgen-core/authoring";
import { runPlacementProductStep, warnLog } from "../../log.js";
import { config } from "./config.js";
import { projectStartAssignmentViz } from "./viz.js";

type PlanStartsOutput = Static<(typeof placement.starts.ops.planStarts)["output"]>;
type StartAssignmentArtifact = ArtifactValueOf<typeof placementStartArtifacts.startAssignment>;
type StartSeatRecord = PlanStartsOutput["seats"][number];

/**
 * Loud degradation surfacing: every non-regional seat and every below-floor
 * spacing is reported in live logs and verbose traces. Selection authority
 * remains entirely with the plan-starts operation.
 */
function warnStartDegradations(
  context: MapContext,
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
    context.trace.event(() => ({
      type: "placement.starts.fallback",
      level: "warn",
      path,
      seats: seatIndices.length,
      seatIndices,
    }));
  }
  for (const seat of seats) {
    if (seat.plotIndex < 0 || !seat.imputedFlags.includes("spacing-below-floor")) continue;
    warnLog(
      `[Placement] Seat ${seat.seatIndex} seated below the hard spacing floor ` +
        `(achievedSpacing=${seat.achievedSpacing}); the alternative was an unseated player.`
    );
    context.trace.event(() => ({
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
    context.trace.event(() => ({
      type: "placement.starts.regionReassigned",
      level: "warn",
      seats: reassigned.length,
      seatIndices,
    }));
  }
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

/**
 * Stamps the operation's typed seat intents and builds the immutable assignment
 * product. Unfillable maps remain degraded data; only a map with no settleable
 * candidate at all is rejected.
 */
function materializeStartAssignment(args: {
  context: MapContext;
  plan: DeepReadonly<PlanStartsOutput>;
  setStartPosition: (plotIndex: number, playerId: number) => void;
}): StartAssignmentArtifact {
  const { context, plan, setStartPosition } = args;
  const { width, height } = context.setup.dimensions;
  if (plan.width !== width || plan.height !== height) {
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
    setStartPosition(seat.plotIndex, seat.playerId);
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

/**
 * Assigns player seats against the resource plan and final physical truth,
 * before the support pass adjusts resources and stamping makes them immutable.
 */
export const AssignStartsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const resourcePlan = deps.artifacts.resourcePlan.read(context);
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const volcanoes = deps.artifacts.volcanoes.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const mapSizeId = deps.engine.getMapSizeId(context);
    const mapInfo = deps.engine.lookupMapInfo(context, mapSizeId);
    if (!mapInfo) {
      throw new Error("[Placement] Civ7 map metadata is unavailable for the active map size.");
    }
    const baseStarts = {
      playersLandmass1: mapInfo.PlayersLandmass1 ?? 4,
      playersLandmass2: mapInfo.PlayersLandmass2 ?? 4,
    };
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const { width, height } = context.setup.dimensions;
    const plan = ops.starts(
      {
        baseStarts,
        // Alive-majors READ surface; the op owns the slot-to-player mapping.
        alivePlayerIds: deps.engine.getAliveMajorIds(context),
        width,
        height,
        landMask: topography.landMask as Uint8Array,
        slotByTile,
        landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
        landmassTileCounts: landmasses.landmasses.map((landmass) => landmass.tileCount),
        coastalLand: shelf.coastalLand as Uint8Array,
        distanceToCoast: shelf.distanceToCoast as Uint16Array,
        shelfMask: shelf.shelfMask as Uint8Array,
        elevation: topography.elevation as Int16Array,
        fertility: pedology.fertility as Float32Array,
        effectiveMoisture: climateIndices.effectiveMoisture as Float32Array,
        surfaceTemperature: climateIndices.surfaceTemperatureC as Float32Array,
        aridityIndex: climateIndices.aridityIndex as Float32Array,
        riverClass: hydrography.riverClass as Uint8Array,
        lakeMask: lakePlan.lakeMask as Uint8Array,
        mountainMask: mountains.mountainMask as Uint8Array,
        volcanoMask: volcanoes.volcanoMask as Uint8Array,
        naturalWonderPlotIndices: [...naturalWonderPlacement.observedNaturalWonderPlotIndices],
        // Starts consume planned sites because resource stamping follows the
        // support-adjustment pass.
        plannedResourcePlotIndices: resourcePlan.intents.map((intent) => intent.plotIndex),
      },
      stepConfig.starts
    );
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };
    const assignment = runPlacementProductStep("placement.starts", emit, () =>
      materializeStartAssignment({
        context,
        plan,
        setStartPosition: (plotIndex, playerId) =>
          deps.engine.setStartPosition(context, plotIndex, playerId),
      })
    );
    deps.artifacts.startAssignment.publish(context, assignment);
    return { plan, assignment };
  },
  viz: ({ result, dimensions }) => projectStartAssignmentViz({ ...result, dimensions }),
});
