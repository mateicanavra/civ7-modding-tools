import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the mesh-neighbor influence radius, exponential decay, and neutral activity gain for
 * per-era event emission. Defaults spread evidence across eight hops while preserving authored
 * plate activity until a stage-level knob scales it.
 */
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
          "Authored baseline gain for convergent-uplift and subduction-volcanism emission intensity after boundary-regime classification. The foundation-tectonics plateActivity knob scales this value; its neutral setting preserves the authored value exactly.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Mesh-neighbor spread and distance-decay controls that project per-era tectonic events into bounded influence fields.",
    }
  ),
});
