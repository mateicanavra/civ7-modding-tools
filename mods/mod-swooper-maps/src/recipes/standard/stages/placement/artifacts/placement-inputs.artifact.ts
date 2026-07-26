import placement from "@mapgen/domain/placement";
import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Authored placement configuration retained with the shared runtime input snapshot. */
const PlacementInputsConfigSchema = Type.Object(
  {
    wonders: placement.ops.planWonders.config,
    naturalWonders: placement.ops.planNaturalWonders.config,
  },
  { additionalProperties: false }
);

const PlacementRuntimeStartsSchema = placement.ops.planStarts["input"].properties.baseStarts;

/**
 * Shared planning-input schema for map facts, regional slot contributions,
 * wonder intent, and authored placement configuration.
 */
export const Schema = Type.Object(
  {
    mapInfo: placement.ops.planWonders["input"].properties.mapInfo,
    starts: PlacementRuntimeStartsSchema,
    wonders: placement.ops.planWonders["output"],
    placementConfig: PlacementInputsConfigSchema,
  },
  { additionalProperties: false }
);

type MapInfo = Static<(typeof placement.ops.planWonders)["input"]["properties"]["mapInfo"]>;
/** Admitted runtime placement inputs consumed by the Standard placement product steps. */
export type PlacementInputsV1 = Static<typeof Schema> & { mapInfo: MapInfo };

/**
 * Registers the single planning input snapshot shared by wonders, starts, and
 * terminal placement. Its `starts` values sum to the map-size seat-capacity
 * bound, not fixed regional demand; `plan-starts` admits alive-major identities
 * and may reapportion them across generated regions.
 */
export const artifact = defineArtifact({
  name: "placementInputs",
  id: "artifact:placementInputs",
  schema: Schema,
});

/** Validates the shared placement input snapshot against its exact schema. */
export const validate = defineArtifactValidator(artifact);
