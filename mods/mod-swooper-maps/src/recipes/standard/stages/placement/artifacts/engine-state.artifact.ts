import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime schema for terminal Civ7 placement readback and product totals. */
const Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotByTile: TypedArraySchemas.u8({
      description: "Requested landmass slot by tile at placement time (0=none,1=west,2=east).",
    }),
    engineLandMask: TypedArraySchemas.u8({
      description: "Engine land mask snapshot at end of placement (1=land,0=water).",
    }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    startsAssigned: Type.Integer({ minimum: 0 }),
    wondersPlanned: Type.Integer({ minimum: 0 }),
    wondersPlaced: Type.Integer({ minimum: 0 }),
    wondersError: Type.Optional(Type.String()),
    resourcesAttempted: Type.Boolean(),
    resourcesPlaced: Type.Integer({ minimum: 0 }),
    resourcesError: Type.Optional(Type.String()),
    discoveriesPlanned: Type.Integer({ minimum: 0 }),
    discoveriesPlaced: Type.Integer({ minimum: 0 }),
    discoveriesError: Type.Optional(Type.String()),
    waterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Mismatch count between physics landMask and engine landMask at placement completion.",
    }),
  },
  { additionalProperties: false }
);

/** Registers the terminal Civ7 placement readback and aggregate product outcomes. */
export const artifact = defineArtifact({
  name: "engineState",
  id: "artifact:placementEngineState",
  schema: Schema,
  refine: validateLocal,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validates map-sized slot and land surfaces, a slot-count total equal to map
 * size, and bounded wonder/discovery outcomes before publication. It does not
 * reconcile each slot count against the slot buffer.
 */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const product = value.width * value.height;
  const size = Number.isSafeInteger(product) && product > 0 ? product : undefined;
  if (size === undefined) {
    issues.push(
      issue(`engineState has invalid dimensions ${String(value.width)}x${String(value.height)}.`)
    );
  }
  appendArtifactTypedArrayIssues(
    issues,
    "engineState.slotByTile",
    value.slotByTile,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "engineState.engineLandMask",
    value.engineLandMask,
    Uint8Array,
    size
  );
  const { slotCounts } = value;
  if (size !== undefined && slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  if (value.wondersPlaced > value.wondersPlanned) {
    issues.push(
      issue(`wondersPlaced ${value.wondersPlaced} exceeds wondersPlanned ${value.wondersPlanned}.`)
    );
  }
  if (value.discoveriesPlaced > value.discoveriesPlanned) {
    issues.push(
      issue(
        `discoveriesPlaced ${value.discoveriesPlaced} exceeds discoveriesPlanned ${value.discoveriesPlanned}.`
      )
    );
  }
  return issues;
}
