import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";
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
  resourcePlan: defineArtifact({
    name: "resourcePlan",
    id: "artifact:placement.resourcePlan",
    schema: placement.ops.planResources.output,
  }),
  naturalWonderPlan: defineArtifact({
    name: "naturalWonderPlan",
    id: "artifact:placement.naturalWonderPlan",
    schema: placement.ops.planNaturalWonders.output,
  }),
  discoveryPlan: defineArtifact({
    name: "discoveryPlan",
    id: "artifact:placement.discoveryPlan",
    schema: placement.ops.planDiscoveries.output,
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
