import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { StartFairnessReportSchema } from "../model/atoms/start-fairness.schema.js";
import {
  StartInputCoverageRowSchema,
  StartRejectionCountSchema,
  StartTierCountsSchema,
} from "../model/atoms/start-planning-evidence.schema.js";
import { StartSeatSchema } from "../model/atoms/start-seat.schema.js";

/**
 * Registers the stamped, fairness-audited player start assignment consumed by
 * discovery exclusion and terminal placement evidence.
 */
export const artifact = defineArtifact({
  name: "startAssignment",
  id: "artifact:placement.startAssignment",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      positions: Type.Array(Type.Integer({ minimum: -1 }), {
        description: "Chosen plot per seat index; -1 records an explicitly unseated player.",
      }),
      seats: Type.Array(StartSeatSchema),
      fairnessReport: StartFairnessReportSchema,
      status: Type.Union([Type.Literal("full"), Type.Literal("degraded")]),
      assigned: Type.Integer({ minimum: 0 }),
      unseatedCount: Type.Integer({ minimum: 0 }),
      rungCounts: Type.Object(
        {
          regional: Type.Integer({ minimum: 0 }),
          openPool: Type.Integer({ minimum: 0 }),
          qualityRelaxed: Type.Integer({ minimum: 0 }),
          spacingRelaxed: Type.Integer({ minimum: 0 }),
        },
        {
          additionalProperties: false,
          description: "Seated player count at each ordered fallback rung.",
        }
      ),
      primaryAssigned: Type.Integer({ minimum: 0 }),
      islandClusterAssigned: Type.Integer({ minimum: 0 }),
      marginalAssigned: Type.Integer({ minimum: 0 }),
      noneAssigned: Type.Integer({ minimum: 0 }),
      candidateCount: Type.Integer({ minimum: 0 }),
      rejectionCounts: Type.Array(StartRejectionCountSchema),
      tierCounts: StartTierCountsSchema,
      inputCoverage: Type.Array(StartInputCoverageRowSchema),
    },
    {
      additionalProperties: false,
      description:
        "Stamped player starts with per-seat provenance, fairness evidence, fallback counts, and explicit input coverage.",
    }
  ),
  refine: (value, { issues }) => {
    const size = value.width * value.height;
    if (!Number.isSafeInteger(size) || size <= 0) {
      issues.add(
        `startAssignment has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      );
      return;
    }
    const { positions, seats } = value;
    if (positions.length !== seats.length) {
      issues.add(
        `startAssignment.positions length ${positions.length} != seats length ${seats.length}.`
      );
    }

    const seenPlots = new Set<number>();
    let seated = 0;
    const rungTotals = { regional: 0, openPool: 0, qualityRelaxed: 0, spacingRelaxed: 0 };
    const tierTotals = { primary: 0, islandCluster: 0, marginal: 0, none: 0 };
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i]!;
      const { plotIndex, realizedRegionSlot } = seat;
      if (positions[i] !== seat.plotIndex) {
        issues.add(`startAssignment.positions[${i}] does not match seats[${i}].plotIndex.`);
      }
      if (seat.seatIndex !== i) {
        issues.add(`startAssignment seats[${i}].seatIndex ${String(seat.seatIndex)} out of order.`);
      }
      if (plotIndex >= 0) {
        seated += 1;
        if (realizedRegionSlot !== 1 && realizedRegionSlot !== 2) {
          issues.add(
            `startAssignment seated seat ${i} must declare realizedRegionSlot 1 or 2; received ${String(seat.realizedRegionSlot)}.`
          );
        }
        if (plotIndex >= size) {
          issues.add(`startAssignment seat ${i} plotIndex ${plotIndex} out of bounds.`);
        }
        if (seenPlots.has(plotIndex)) {
          issues.add(`startAssignment seats two players on plot ${plotIndex}.`);
        }
        seenPlots.add(plotIndex);
        if (seat.rung === "regional") rungTotals.regional += 1;
        else if (seat.rung === "open-pool") rungTotals.openPool += 1;
        else if (seat.rung === "quality-relaxed") rungTotals.qualityRelaxed += 1;
        else if (seat.rung === "spacing-relaxed") rungTotals.spacingRelaxed += 1;
        tierTotals[seat.tier] += 1;
        if (seat.rung !== "regional" && seat.status !== "degraded") {
          issues.add(`startAssignment seat ${i} on rung ${String(seat.rung)} must be degraded.`);
        }
      } else {
        if (realizedRegionSlot !== 0) {
          issues.add(
            `startAssignment unseated seat ${i} must declare realizedRegionSlot 0; received ${String(seat.realizedRegionSlot)}.`
          );
        }
        if (seat.status !== "degraded") {
          issues.add(`startAssignment unseated seat ${i} must have status degraded.`);
        }
        if (!seat.imputedFlags.includes("unseated")) {
          issues.add(`startAssignment unseated seat ${i} must carry the 'unseated' flag.`);
        }
      }
    }

    if (value.assigned !== seated) {
      issues.add(`startAssignment.assigned ${String(value.assigned)} != seated seats ${seated}.`);
    }
    if (value.unseatedCount !== seats.length - seated) {
      issues.add(
        `startAssignment.unseatedCount ${String(value.unseatedCount)} != ${seats.length - seated}.`
      );
    }
    for (const key of ["regional", "openPool", "qualityRelaxed", "spacingRelaxed"] as const) {
      const expected = rungTotals[key];
      if (value.rungCounts[key] !== expected) {
        issues.add(
          `startAssignment.rungCounts.${key} ${String(value.rungCounts[key])} != ${expected}.`
        );
      }
    }
    for (const [field, tier] of [
      ["primaryAssigned", "primary"],
      ["islandClusterAssigned", "islandCluster"],
      ["marginalAssigned", "marginal"],
      ["noneAssigned", "none"],
    ] as const) {
      const expected = tierTotals[tier];
      if (value[field] !== expected) {
        issues.add(`startAssignment.${field} ${String(value[field])} != ${expected}.`);
      }
    }

    const report = value.fairnessReport;
    if (report.parity.length !== seats.length) {
      issues.add(
        `startAssignment.fairnessReport.parity length ${report.parity.length} != seats ${seats.length}.`
      );
    }
    const gap = report.worstPairGap;
    const { tolerance } = report;
    if (typeof gap === "number" && report.balanced !== gap <= tolerance) {
      issues.add(
        `startAssignment.fairnessReport.balanced ${String(report.balanced)} inconsistent with gap ${gap} vs tolerance ${tolerance}.`
      );
    }

    const expectedStatus = seats.every(
      (seat) =>
        seat.plotIndex >= 0 &&
        seat.rung === "regional" &&
        !seat.imputedFlags.includes("region-reassigned") &&
        !seat.imputedFlags.includes("spacing-below-floor") &&
        seat.status === "full"
    )
      ? "full"
      : "degraded";
    if (value.status !== expectedStatus) {
      issues.add(
        `startAssignment.status ${value.status} != derived ${expectedStatus} from per-seat assignment truth.`
      );
    }
  },
});
