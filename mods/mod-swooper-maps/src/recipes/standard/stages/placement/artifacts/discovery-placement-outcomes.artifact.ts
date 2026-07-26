import {
  type ArtifactValidationIssue,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

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

/** Runtime schema reconciling official-generator discovery attempts and outcomes. */
export const Schema = Type.Object(
  {
    summary: DiscoveryPlacementSummarySchema,
  },
  {
    additionalProperties: false,
    description:
      "Observed discovery placement counts from the official generator: attempts (plannedCount), engine-accepted placements (placedCount), and the rejected shortfall.",
  }
);

/** Registers observed attempt, acceptance, and rejection counts from Civ7's discovery generator. */
export const artifact = defineArtifact({
  name: "discoveryPlacementOutcomes",
  id: "artifact:placement.discoveryPlacementOutcomes",
  schema: Schema,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validate hook for the discovery placement summary artifact. Discoveries are
 * placed by the official generator, so this checks the cross-field law that
 * planned attempts equal accepted plus rejected outcomes.
 */

function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const { plannedCount, placedCount, rejectedCount } = value.summary;
  return placedCount + rejectedCount === plannedCount
    ? []
    : [
        issue(
          `summary.placedCount ${placedCount} + rejectedCount ${rejectedCount} != plannedCount ${plannedCount}.`
        ),
      ];
}

/** Ensures `placed + rejected === planned` after structural count admission. */
export const validate = defineArtifactValidator(artifact, validateLocal);
