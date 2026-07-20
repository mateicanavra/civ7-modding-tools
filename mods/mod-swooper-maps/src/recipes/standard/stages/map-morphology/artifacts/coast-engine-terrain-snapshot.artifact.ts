import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MapMorphologyEngineTerrainSnapshotArtifactSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask at this map-morphology boundary.",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot at this map-morphology boundary.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot at this map-morphology boundary.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Engine terrain snapshot captured at a map-morphology boundary for parity diagnostics.",
  }
);

/** Runtime schema for the engine terrain observed immediately after coast stamping. */
export const Schema = MapMorphologyEngineTerrainSnapshotArtifactSchema;

/** Registers engine terrain observed immediately after coast stamping. */
export const artifact = defineArtifact({
  name: "coastEngineTerrainSnapshot",
  id: "artifact:map.morphology.coastEngineTerrainSnapshot",
  schema: Schema,
});

/** Validates the coast-boundary snapshot's dimensions and typed tile surfaces. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") return Object.freeze(issues);
  const candidate = value as Record<string, unknown>;
  const cellCount = artifactCellCount(context);
  appendArtifactTypedArrayIssues(issues, "landMask", candidate.landMask, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "terrain", candidate.terrain, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "elevation", candidate.elevation, Int16Array, cellCount);
  return Object.freeze(issues);
}
