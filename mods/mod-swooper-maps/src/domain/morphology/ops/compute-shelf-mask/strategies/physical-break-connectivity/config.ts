import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `physical-break-connectivity` implementation of `morphology/compute-shelf-mask`. */
export default defineStrategy({
  id: "physical-break-connectivity",
  config: Type.Object(
    {
      breakGradient: Type.Number({
        default: 8,
        minimum: 0.5,
        maximum: 200,
        description:
          "Seabed gradient (bathymetry units per tile-hop) at or above which the seafloor is treated as the steep continental slope (post-break), excluding it from the shelf. A difference of bathymetry, so the datum cancels — NOT a depth quantile and NOT a depth band. Read against the sculpted margin profile.",
      }),
      breakGradientScale: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 8,
        description:
          "Global break-gradient scale set from the shelfWidth knob (narrow<1 => stricter gradient => narrower shelf; wide>1 => more permissive => wider). Authors use the knob; normalize() injects this value.",
      }),
      activeClosenessThreshold: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description:
          "Boundary-closeness (0..1) above which a convergent/transform margin counts as active. Diagnostic only: the margin posture is already sculpted into the terrain the gradient reads.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Physical-break shelf classifier: the gentle pre-break apron (seabed gradient below the break-gradient threshold) flood-connected to shore. No depth quantile, no datum reference, no tile-distance caps.",
    }
  ),
});
