import { Type, type Static } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";

export const PlacementInputsConfigSchema = Type.Object(
  {
    wonders: placement.ops.planWonders.config,
    naturalWonders: placement.ops.planNaturalWonders.config,
    discoveries: placement.ops.planDiscoveries.config,
  },
  { additionalProperties: false }
);

const PlacementRuntimeStartsSchema = placement.ops.planStarts["input"].properties.baseStarts;

export const PlacementInputsV1Schema = Type.Object(
  {
    mapInfo: placement.ops.planWonders["input"].properties.mapInfo,
    starts: PlacementRuntimeStartsSchema,
    wonders: placement.ops.planWonders["output"],
    naturalWonderPlan: placement.ops.planNaturalWonders["output"],
    discoveryPlan: placement.ops.planDiscoveries["output"],
    placementConfig: PlacementInputsConfigSchema,
  },
  { additionalProperties: false }
);

type MapInfo = Static<typeof placement.ops.planWonders["input"]["properties"]["mapInfo"]>;
export type PlacementInputsV1 = Static<typeof PlacementInputsV1Schema> & { mapInfo: MapInfo };
