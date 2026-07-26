import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares a parameter-free hotspot posture: admitted mesh, mantle forcing, and era membership
 * fully determine selection. This keeps hotspot identity causal rather than author-tuned.
 */
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
