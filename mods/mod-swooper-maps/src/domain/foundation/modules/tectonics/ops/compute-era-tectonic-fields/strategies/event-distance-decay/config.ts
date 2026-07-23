import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Configuration contract for spreading tectonic events through bounded distance decay. */
export default defineStrategy({
  id: "event-distance-decay",
  config: Type.Object(
    {
      beltInfluenceDistance: Type.Integer({
        default: 8,
        minimum: 1,
        maximum: 64,
        description: "Controls how far tectonic belt influence spreads across mesh-neighbor steps.",
      }),
      beltDecay: Type.Number({
        default: 0.55,
        minimum: 0.01,
        maximum: 10,
        description:
          "Controls the exponential decay rate for tectonic belt influence per mesh-neighbor step.",
      }),
      orogenyActivityGain: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description:
          "Activity gain on convergent-uplift and subduction-volcanism emission intensity, applied AFTER boundary-regime classification (so regime topology is fixed and the lever stays smooth/monotonic). Set by the foundation-tectonics plateActivity knob; a direct authored value is overwritten by the knob. 1 is an exact no-op.",
      }),
    },
    { additionalProperties: false }
  ),
});
