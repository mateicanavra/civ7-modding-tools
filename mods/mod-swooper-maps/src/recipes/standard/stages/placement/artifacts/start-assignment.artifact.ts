import placement from "@mapgen/domain/placement";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

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

export const Schema = StartAssignmentArtifactSchema;

export const artifact = defineArtifact({
  name: "startAssignment",
  id: "artifact:placement.startAssignment",
  schema: Schema,
});

export const startAssignmentArtifact = artifact;
