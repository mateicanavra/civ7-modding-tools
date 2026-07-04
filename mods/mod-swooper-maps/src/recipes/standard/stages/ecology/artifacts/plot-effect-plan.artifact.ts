import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const PlotEffectKeyArtifactSchema = Type.Unsafe<PlotEffectKey>(
  Type.String({
    description: "Engine plot-effect key planned by Ecology and later projected by map-ecology.",
    pattern: "^PLOTEFFECT_",
  })
);

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
    plotEffect: PlotEffectKeyArtifactSchema,
  },
  { additionalProperties: false }
);

export const PlotEffectPlanArtifactSchema = Type.Array(PlotEffectPlacementIntentSchema);

export type PlotEffectPlanArtifact = Static<typeof PlotEffectPlanArtifactSchema>;

export const Schema = PlotEffectPlanArtifactSchema;

export const artifact = defineArtifact({
  name: "plotEffectPlan",
  id: "artifact:ecology.plotEffectPlan",
  schema: Schema,
});
