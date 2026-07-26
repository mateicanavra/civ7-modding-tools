import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for deterministic lake intent, map dimensions, and the sink evidence that
 * explains how many planned tiles came from hydrography minima.
 */
const Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description: "Deterministic Hydrology lake intent mask (1=planned lake, 0=not planned).",
    }),
    plannedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles marked as planned lakes.",
    }),
    sinkLakeCount: Type.Integer({
      minimum: 0,
      description: "Count of hydrography sink tiles mapped to lake tiles.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology-owned deterministic lake intent plan consumed by map-hydrology projection and placement.",
  }
);

/**
 * Registers deterministic lake intent and its drainage evidence before map-hydrology stamps
 * static water. Projection outcomes cannot retroactively redefine this Hydrology plan.
 */
export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Schema,
  refine: validateLocal,
});

/** Validates lake-plan structure, mask kind, and map-sized cardinality when known. */
/** Admits the map-sized typed lake-intent mask after Core validates the plan shape. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const candidate = value as Record<string, unknown>;
  appendArtifactTypedArrayIssues(
    issues,
    "lakeMask",
    candidate.lakeMask,
    Uint8Array,
    artifactCellCount(context)
  );
  return Object.freeze(issues);
}
