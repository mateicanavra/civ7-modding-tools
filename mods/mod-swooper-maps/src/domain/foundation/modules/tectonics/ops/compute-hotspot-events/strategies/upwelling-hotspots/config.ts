import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for mantle-upwelling hotspot selection. */
export default defineStrategy({
  id: "upwelling-hotspots",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Mantle-upwelling hotspot selection is fixed by admitted forcing evidence and exposes no authored parameters.",
    }
  ),
});
