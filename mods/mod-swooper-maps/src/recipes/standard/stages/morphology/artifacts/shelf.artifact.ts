import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyShelfArtifactSchema = Type.Object(
  {
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): post-island water admitted by the gentle local-gradient gate and connected to a shoreline seed; eligible for TERRAIN_COAST projection.",
    }),
    coastalLand: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island land tiles adjacent to water.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description: "POST-island minimum hex distance to the nearest coastline tile (0=coast).",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Diagnostic mask (1/0): water tiles near convergent or transform boundaries above the configured closeness threshold. This does not affect shelf membership.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles admitted by the gentle local-gradient gate; shoreline seeds are admitted even when their immediate seaward gradient is steep.",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): shoreline-adjacent water tiles that seed connectivity across the gentle pre-break apron.",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Diagnostic bathymetry (engine elevation units, <=0) of the steepest neighboring water tile when the local-gradient gate rejects a tile; 0 where no break is recorded.",
    }),
    shallowCutoff: Type.Number({
      description:
        "Retired depth-quantile compatibility field. The gradient-break classifier always emits 0.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Continental-shelf truth + post-island coastline metrics (stage morphology-shelf, after islands/mountains).",
  }
);

/** Runtime schema for post-island coastline metrics and gradient-break shelf truth. */
export const Schema = MorphologyShelfArtifactSchema;

/**
 * Registers post-island coastline and gradient-break shelf truth consumed by
 * coast projection; membership is gentle pre-break water connected to shore.
 */
export const artifact = defineArtifact({
  name: "shelf",
  id: "artifact:morphology.shelf",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    if (context?.dimensions) {
      errors.push({ message: "Missing shelf artifact." });
    }
    return errors;
  }
  const size = artifactCellCount(context);
  const c = value as Record<string, unknown>;
  appendArtifactTypedArrayIssues(errors, "shelf.shelfMask", c.shelfMask, Uint8Array, size);
  appendArtifactTypedArrayIssues(errors, "shelf.coastalLand", c.coastalLand, Uint8Array, size);
  appendArtifactTypedArrayIssues(errors, "shelf.coastalWater", c.coastalWater, Uint8Array, size);
  appendArtifactTypedArrayIssues(
    errors,
    "shelf.distanceToCoast",
    c.distanceToCoast,
    Uint16Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "shelf.activeMarginMask",
    c.activeMarginMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(errors, "shelf.depthGateMask", c.depthGateMask, Uint8Array, size);
  appendArtifactTypedArrayIssues(
    errors,
    "shelf.nearshoreCandidateMask",
    c.nearshoreCandidateMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "shelf.shelfBreakDepthByTile",
    c.shelfBreakDepthByTile,
    Int16Array,
    size
  );
  if (!Number.isFinite(c.shallowCutoff) || (c.shallowCutoff as number) > 0) {
    errors.push({ message: "shelf.shallowCutoff must be a finite number <= 0." });
  }
  return errors;
}

/**
 * Validates every shelf mask/diagnostic array against map dimensions and keeps
 * the retired `shallowCutoff` compatibility value finite and nonpositive.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}
