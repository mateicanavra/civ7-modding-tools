import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";
import { PlacementInputsV1Schema } from "./placement-inputs.js";
import { PlacementOutputsV1Schema } from "./placement-outputs.js";

const PlacementEngineStateV1Schema = Type.Object(
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
    resourcesAttempted: Type.Boolean(),
    resourcesError: Type.Optional(Type.String()),
    waterDriftCount: Type.Integer({
      minimum: 0,
      description: "Mismatch count between physics landMask and engine landMask at placement completion.",
    }),
  },
  { additionalProperties: false }
);

export const placementArtifacts = {
  placementInputs: defineArtifact({
    name: "placementInputs",
    id: "artifact:placementInputs",
    schema: PlacementInputsV1Schema,
  }),
  placementOutputs: defineArtifact({
    name: "placementOutputs",
    id: "artifact:placementOutputs",
    schema: PlacementOutputsV1Schema,
  }),
  engineState: defineArtifact({
    name: "engineState",
    id: "artifact:placementEngineState",
    schema: PlacementEngineStateV1Schema,
  }),
} as const;
