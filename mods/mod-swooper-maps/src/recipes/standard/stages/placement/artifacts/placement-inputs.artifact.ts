import placement from "@mapgen/domain/placement";
import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Authored placement configuration retained with the shared runtime input snapshot. */
const PlacementInputsConfigSchema = Type.Object(
  {
    wonders: placement.wonders.ops.planWonders.config,
    naturalWonders: placement.wonders.ops.planNaturalWonders.config,
  },
  { additionalProperties: false }
);

const PlacementRuntimeStartsSchema = placement.starts.ops.planStarts.input.properties.baseStarts;

/**
 * Shared planning-input schema for map facts, regional slot contributions,
 * wonder intent, and authored placement configuration.
 */
const Schema = Type.Object(
  {
    mapInfo: placement.wonders.ops.planWonders.input.properties.mapInfo,
    starts: PlacementRuntimeStartsSchema,
    wonders: placement.wonders.ops.planWonders.output,
    placementConfig: PlacementInputsConfigSchema,
  },
  { additionalProperties: false }
);

type MapInfo = Static<(typeof placement.wonders.ops.planWonders)["input"]["properties"]["mapInfo"]>;
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
