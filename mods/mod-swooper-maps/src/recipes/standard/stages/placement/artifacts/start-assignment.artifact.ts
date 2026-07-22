import placement from "@mapgen/domain/placement";
import {
  type ArtifactValidationIssue,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Verified start assignment (`artifact:placement.startAssignment`). One artifact per file by repo convention. */
const PlanStartsOutputSchema = placement.ops.planStarts.output;

/** Runtime schema for stamped player starts and their fairness audit. */
export const Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    positions: Type.Array(Type.Integer({ minimum: -1 }), {
      description: "Chosen plot per seat index (-1 = unseated, recorded as degraded data).",
    }),
    seats: PlanStartsOutputSchema.properties.seats,
    fairnessReport: PlanStartsOutputSchema.properties.fairnessReport,
    status: PlanStartsOutputSchema.properties.status,
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
        description:
          "Seated count per fallback ladder rung (regional → open-pool → quality-relaxed → spacing-relaxed). Non-regional rungs are surfaced as warnings when they fire.",
      }
    ),
    primaryAssigned: Type.Integer({ minimum: 0 }),
    islandClusterAssigned: Type.Integer({ minimum: 0 }),
    marginalAssigned: Type.Integer({ minimum: 0 }),
    noneAssigned: Type.Integer({ minimum: 0 }),
    candidateCount: Type.Integer({ minimum: 0 }),
    rejectionCounts: PlanStartsOutputSchema.properties.rejectionCounts,
    tierCounts: PlanStartsOutputSchema.properties.tierCounts,
    inputCoverage: PlanStartsOutputSchema.properties.inputCoverage,
  },
  {
    additionalProperties: false,
    description:
      "Verified player start assignment produced by the starts product step: per-player StartRecord[] (component vectors, rung, status, achieved spacing, imputed flags), the fairness report (worst-pair gap, relaxations, swaps), and rung/tier aggregates. Selection authority lives in the plan-starts op; this artifact is the stamped record.",
  }
);

/**
 * Registers the stamped, fairness-audited player start assignment consumed by
 * discovery exclusion and terminal placement evidence.
 */
export const artifact = defineArtifact({
  name: "startAssignment",
  id: "artifact:placement.startAssignment",
  schema: Schema,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validate hook for the startAssignment artifact (placement-realignment S4
 * artifact hygiene): cross-field invariants the schema cannot express —
 * seat/position alignment, rung/status consistency, duplicate plots, rung
 * count totals, and fairness-report coherence.
 */

function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `startAssignment has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const { positions, seats } = value;
  if (positions.length !== seats.length) {
    issues.push(
      issue(`startAssignment.positions length ${positions.length} != seats length ${seats.length}.`)
    );
  }

  const seenPlots = new Set<number>();
  let seated = 0;
  const rungTotals = { regional: 0, openPool: 0, qualityRelaxed: 0, spacingRelaxed: 0 };
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i]!;
    const { plotIndex, realizedRegionSlot } = seat;
    if (positions[i] !== seat.plotIndex) {
      issues.push(issue(`startAssignment.positions[${i}] does not match seats[${i}].plotIndex.`));
    }
    if (seat.seatIndex !== i) {
      issues.push(
        issue(`startAssignment seats[${i}].seatIndex ${String(seat.seatIndex)} out of order.`)
      );
    }
    if (plotIndex >= 0) {
      seated += 1;
      if (realizedRegionSlot !== 1 && realizedRegionSlot !== 2) {
        issues.push(
          issue(
            `startAssignment seated seat ${i} must declare realizedRegionSlot 1 or 2; received ${String(seat.realizedRegionSlot)}.`
          )
        );
      }
      if (plotIndex >= size) {
        issues.push(issue(`startAssignment seat ${i} plotIndex ${plotIndex} out of bounds.`));
      }
      if (seenPlots.has(plotIndex)) {
        issues.push(issue(`startAssignment seats two players on plot ${plotIndex}.`));
      }
      seenPlots.add(plotIndex);
      if (seat.rung === "regional") rungTotals.regional += 1;
      else if (seat.rung === "open-pool") rungTotals.openPool += 1;
      else if (seat.rung === "quality-relaxed") rungTotals.qualityRelaxed += 1;
      else if (seat.rung === "spacing-relaxed") rungTotals.spacingRelaxed += 1;
      if (seat.rung !== "regional" && seat.status !== "degraded") {
        issues.push(
          issue(`startAssignment seat ${i} on rung ${String(seat.rung)} must be degraded.`)
        );
      }
    } else {
      if (realizedRegionSlot !== 0) {
        issues.push(
          issue(
            `startAssignment unseated seat ${i} must declare realizedRegionSlot 0; received ${String(seat.realizedRegionSlot)}.`
          )
        );
      }
      if (seat.status !== "degraded") {
        issues.push(issue(`startAssignment unseated seat ${i} must have status degraded.`));
      }
      if (!seat.imputedFlags.includes("unseated")) {
        issues.push(issue(`startAssignment unseated seat ${i} must carry the 'unseated' flag.`));
      }
    }
  }

  if (value.assigned !== seated) {
    issues.push(
      issue(`startAssignment.assigned ${String(value.assigned)} != seated seats ${seated}.`)
    );
  }
  if (value.unseatedCount !== seats.length - seated) {
    issues.push(
      issue(
        `startAssignment.unseatedCount ${String(value.unseatedCount)} != ${seats.length - seated}.`
      )
    );
  }
  for (const key of ["regional", "openPool", "qualityRelaxed", "spacingRelaxed"] as const) {
    const expected = rungTotals[key];
    if (value.rungCounts[key] !== expected) {
      issues.push(
        issue(`startAssignment.rungCounts.${key} ${String(value.rungCounts[key])} != ${expected}.`)
      );
    }
  }

  const report = value.fairnessReport;
  if (report.parity.length !== seats.length) {
    issues.push(
      issue(
        `startAssignment.fairnessReport.parity length ${report.parity.length} != seats ${seats.length}.`
      )
    );
  }
  const gap = report.worstPairGap;
  const { tolerance } = report;
  if (typeof gap === "number" && report.balanced !== gap <= tolerance) {
    issues.push(
      issue(
        `startAssignment.fairnessReport.balanced ${String(report.balanced)} inconsistent with gap ${gap} vs tolerance ${tolerance}.`
      )
    );
  }

  if (
    seats.length > 0 &&
    seated === seats.length &&
    value.status === "degraded" &&
    seats.every((seat) => seat.status === "full")
  ) {
    issues.push(issue("startAssignment.status degraded but every seat is full."));
  }

  return issues;
}

/**
 * Validates seat/position order, unique in-bounds plots, terminal realized-region state,
 * fallback/degraded coherence, aggregate counts, and fairness report parity.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
