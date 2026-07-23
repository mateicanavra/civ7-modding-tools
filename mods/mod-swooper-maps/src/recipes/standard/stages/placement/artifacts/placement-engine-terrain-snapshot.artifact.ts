import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for the terminal placement terrain readback used in parity checks. */
const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot (e.g. map-hydrology/lakes).",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask snapshot (1=land, 0=water), tile order.",
    }),
    terrain: TypedArraySchemas.i32({
      description: "Engine-derived terrain type snapshot (tile order).",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot (tile order).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Machine-readable engine terrain snapshot captured at a projection boundary for parity diagnostics.",
  }
);

/** Registers the final placement-boundary engine terrain readback for parity diagnostics. */
export const artifact = defineArtifact({
  name: "placementEngineTerrainSnapshot",
  id: "artifact:map.placementEngineTerrainSnapshot",
  schema: Schema,
  refine: validateLocal,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/** Validates positive dimensions and map-sized land, terrain, and elevation surfaces. */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const product = width * height;
  const size = Number.isSafeInteger(product) && product > 0 ? product : undefined;
  if (size === undefined) {
    issues.push(
      issue(
        `placementEngineTerrainSnapshot has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      )
    );
  }
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.landMask",
    value.landMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.terrain",
    value.terrain,
    Int32Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.elevation",
    value.elevation,
    Int16Array,
    size
  );
  return issues;
}
