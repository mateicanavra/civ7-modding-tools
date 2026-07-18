import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyRoutingArtifactSchema = Type.Object(
  {
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
    basinId: Type.Optional(
      TypedArraySchemas.i32({
        description: "Optional basin identifier per tile (or -1 when unassigned).",
      })
    ),
  },
  {
    description:
      "Immutable Morphology drainage routing snapshot with one receiver and accumulation value per tile.",
  }
);

/** Runtime schema for publish-once receivers, accumulation, and basin assignments. */
export const Schema = MorphologyRoutingArtifactSchema;

/**
 * Registers publish-once drainage routing: each tile's receiver, accumulation,
 * and optional basin assignment for erosion and Hydrology consumers.
 */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
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
      errors.push({ message: "Missing routing artifact value." });
    }
    return errors;
  }
  const size = artifactCellCount(context);
  const candidate = value as { flowDir?: unknown; flowAccum?: unknown; basinId?: unknown };
  appendArtifactTypedArrayIssues(errors, "routing.flowDir", candidate.flowDir, Int32Array, size);
  appendArtifactTypedArrayIssues(
    errors,
    "routing.flowAccum",
    candidate.flowAccum,
    Float32Array,
    size
  );
  if (candidate.basinId !== undefined) {
    appendArtifactTypedArrayIssues(errors, "routing.basinId", candidate.basinId, Int32Array, size);
  }
  return errors;
}

/**
 * Validates routing array kinds and, when dimensions are supplied, exact
 * map-sized cardinality; `-1` receiver/basin sentinels remain schema values.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}
