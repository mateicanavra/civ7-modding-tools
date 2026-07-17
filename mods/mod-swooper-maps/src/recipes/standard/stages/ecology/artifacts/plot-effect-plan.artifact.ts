import { PlotEffectIntentKeySchema } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plot effects are authored as ecology truth because snow/sand/burned placement is
 * scored from biome, climate, and topography artifacts. The map-ecology stage only
 * projects these intents into the adapter, so this artifact preserves the contract
 * between planning and engine stamping without letting projection own the policy.
 */
export const PlotEffectPlacementIntentSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    plotEffect: PlotEffectIntentKeySchema,
  },
  { additionalProperties: false }
);

/** Ordered Ecology intent contract for plot effects projected later into Civ7 state. */
export const PlotEffectPlanArtifactSchema = Type.Array(PlotEffectPlacementIntentSchema);

export type PlotEffectPlanArtifact = Static<typeof PlotEffectPlanArtifactSchema>;

/** Canonical schema entrypoint for registering and validating the plot-effect plan. */
export const Schema = PlotEffectPlanArtifactSchema;

/**
 * Registers Ecology's deterministic snow, sand, burned, and hazard intent before Civ7
 * projection. The plan keeps semantic effect choice separate from engine mutation and
 * readback.
 */
export const artifact = defineArtifact({
  name: "plotEffectPlan",
  id: "artifact:ecology.plotEffectPlan",
  schema: Schema,
});

/** Returns every TypeBox schema issue for the plot-effect plan without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
