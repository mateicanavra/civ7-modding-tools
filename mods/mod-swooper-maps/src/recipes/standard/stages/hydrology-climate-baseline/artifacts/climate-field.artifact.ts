import { HydrologyWindFieldSchema } from "@mapgen/domain/hydrology";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Climate field produced by Hydrology climate-baseline.
 *
 * This artifact is a *buffer handle* routed through artifacts for gating/typing: it may be refined later in-place.
 */
export const ClimateFieldArtifactSchema = Type.Object(
  {
    /** Rainfall field (0..200) per tile; consumers should not invent their own rainfall proxies. */
    rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
    /** Humidity field (0..255) per tile; used by hydrology budget and downstream ecology heuristics. */
    humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) per tile." }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate field (buffer handle): rainfall/humidity outputs for Ecology/Narrative/Placement consumption.",
  }
);

export const Schema = ClimateFieldArtifactSchema;

export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:climateField",
  schema: Schema,
});
