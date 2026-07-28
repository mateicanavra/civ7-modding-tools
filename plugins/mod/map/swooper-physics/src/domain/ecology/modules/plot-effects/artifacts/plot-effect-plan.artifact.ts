import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PlotEffectIntentKeySchema } from "../model/atoms/plot-effect-intent.schema.js";

/**
 * Plot effects are authored as ecology truth because snow/sand/burned placement is
 * scored from biome, climate, and topography artifacts. The map-ecology stage only
 * projects these intents into the adapter, so this artifact preserves the contract
 * between planning and engine stamping without letting projection own the policy.
 */
const PlotEffectPlacementIntentSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    plotEffect: PlotEffectIntentKeySchema,
  },
  {
    additionalProperties: false,
    description: "One Ecology plot-effect intent in map coordinates.",
  }
);

/**
 * Registers Ecology's deterministic snow, sand, burned, and hazard intent before Civ7
 * projection. The plan keeps semantic effect choice separate from engine mutation and
 * readback.
 */
export const artifact = defineArtifact({
  name: "plotEffectPlan",
  id: "artifact:ecology.plotEffectPlan",
  schema: Type.Array(PlotEffectPlacementIntentSchema, {
    description: "Ordered Ecology plot-effect intents admitted before Civ7 projection.",
  }),
});
