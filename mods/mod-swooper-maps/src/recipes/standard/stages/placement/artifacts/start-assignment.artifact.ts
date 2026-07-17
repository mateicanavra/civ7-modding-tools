import placement from "@mapgen/domain/placement";
import {
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Verified start assignment (`artifact:placement.startAssignment`). One artifact per file by repo convention. */
const PlanStartsOutputSchema = placement.ops.planStarts.output;

const StartAssignmentArtifactSchema = Type.Object(
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

/** Runtime schema for stamped player starts and their fairness audit. */
export const Schema = StartAssignmentArtifactSchema;

/**
 * Registers the stamped, fairness-audited player start assignment consumed by
 * discovery exclusion and terminal placement evidence.
 */
export const artifact = defineArtifact({
  name: "startAssignment",
  id: "artifact:placement.startAssignment",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the startAssignment artifact (placement-realignment S4
 * artifact hygiene): cross-field invariants the schema cannot express —
 * seat/position alignment, rung/status consistency, duplicate plots, rung
 * count totals, and fairness-report coherence.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("startAssignment artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `startAssignment has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const seats = Array.isArray(value.seats) ? value.seats : null;
  const positions = Array.isArray(value.positions) ? value.positions : null;
  if (!seats) return [issue("startAssignment.seats must be an array.")];
  if (!positions) return [issue("startAssignment.positions must be an array.")];
  if (positions.length !== seats.length) {
    issues.push(
      issue(`startAssignment.positions length ${positions.length} != seats length ${seats.length}.`)
    );
  }

  const seenPlots = new Set<number>();
  let seated = 0;
  const rungTotals = { regional: 0, openPool: 0, qualityRelaxed: 0, spacingRelaxed: 0 };
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    if (!isRecord(seat)) {
      issues.push(issue(`startAssignment seat ${i} must be an object.`));
      continue;
    }
    const plotIndex = Number(seat.plotIndex);
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
      if (seat.status !== "degraded") {
        issues.push(issue(`startAssignment unseated seat ${i} must have status degraded.`));
      }
      const flags = Array.isArray(seat.imputedFlags) ? seat.imputedFlags : [];
      if (!flags.includes("unseated")) {
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
  const rungCounts = isRecord(value.rungCounts) ? value.rungCounts : null;
  if (rungCounts) {
    for (const [key, expected] of Object.entries(rungTotals)) {
      if (rungCounts[key] !== expected) {
        issues.push(
          issue(`startAssignment.rungCounts.${key} ${String(rungCounts[key])} != ${expected}.`)
        );
      }
    }
  } else {
    issues.push(issue("startAssignment.rungCounts must be an object."));
  }

  const report = isRecord(value.fairnessReport) ? value.fairnessReport : null;
  if (!report) {
    issues.push(issue("startAssignment.fairnessReport must be an object."));
  } else {
    const parity = Array.isArray(report.parity) ? report.parity : [];
    if (parity.length !== seats.length) {
      issues.push(
        issue(
          `startAssignment.fairnessReport.parity length ${parity.length} != seats ${seats.length}.`
        )
      );
    }
    const gap = report.worstPairGap;
    const tolerance = Number(report.tolerance);
    if (typeof gap === "number" && report.balanced !== gap <= tolerance) {
      issues.push(
        issue(
          `startAssignment.fairnessReport.balanced ${String(report.balanced)} inconsistent with gap ${gap} vs tolerance ${tolerance}.`
        )
      );
    }
  }

  if (
    seats.length > 0 &&
    seated === seats.length &&
    value.status === "degraded" &&
    seats.every((seat) => isRecord(seat) && seat.status === "full")
  ) {
    issues.push(issue("startAssignment.status degraded but every seat is full."));
  }

  return issues;
}

/**
 * Validates seat/position order, unique in-bounds plots, fallback rung and
 * degraded-state coherence, aggregate counts, and fairness report parity.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
