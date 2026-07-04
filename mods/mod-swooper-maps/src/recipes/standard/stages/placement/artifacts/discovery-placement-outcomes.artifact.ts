import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Discovery placement summary (`artifact:placement.discoveryPlacementOutcomes`).
 *
 * Discoveries are placed by Civ7's official discovery generator (run through the
 * adapter), whose type/site selection is a live narrative-system product. The
 * mod therefore records observed COUNTS rather than per-tile intent
 * reconciliation: `plannedCount` is the number of `addDiscovery` attempts the
 * generator made, `placedCount` is how many the engine accepted, and
 * `rejectedCount = plannedCount - placedCount` is the engine-side shortfall
 * (commonly narrative-budget exhaustion). One artifact per file by repo convention.
 */
const DiscoveryPlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const DiscoveryPlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: DiscoveryPlacementSummarySchema,
  },
  {
    additionalProperties: false,
    description:
      "Observed discovery placement counts from the official generator: attempts (plannedCount), engine-accepted placements (placedCount), and the rejected shortfall.",
  }
);

export const Schema = DiscoveryPlacementOutcomesArtifactSchema;

export const artifact = defineArtifact({
  name: "discoveryPlacementOutcomes",
  id: "artifact:placement.discoveryPlacementOutcomes",
  schema: Schema,
});

export const discoveryPlacementOutcomesArtifact = artifact;
