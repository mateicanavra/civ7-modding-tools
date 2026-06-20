import type { PlotEffectKey } from "@mapgen/domain/ecology/types.js";
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const createPlotEffectSelectorSchema = (defaultValue: { typeName: PlotEffectKey }) =>
  Type.Object(
    {
      typeName: Type.Unsafe<PlotEffectKey>(
        Type.String({
          description: "Explicit plot effect type name (ex: PLOTEFFECT_SAND).",
        })
      ),
    },
    {
      default: defaultValue,
    }
  );

const PlotEffectsSnowSelectorsSchema = Type.Object({
  light: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_SNOW_LIGHT_PERMANENT" }),
  medium: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_SNOW_MEDIUM_PERMANENT" }),
  heavy: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_SNOW_HEAVY_PERMANENT" }),
});

const PlotEffectsSnowPlanSchema = Type.Object({
  enabled: Type.Boolean({ default: true, description: "Enable planning of snow plot effects." }),
  selectors: PlotEffectsSnowSelectorsSchema,
  coveragePct: Type.Number({
    default: 80,
    minimum: 0,
    maximum: 100,
    description: "Percent of eligible snow tiles to place (deterministic top-coverage selection).",
  }),
  lightThreshold: Type.Number({
    default: 0.35,
    minimum: 0,
    maximum: 1,
    description: "Minimum snowScore01 to place at least the light snow selector.",
  }),
  mediumThreshold: Type.Number({
    default: 0.6,
    minimum: 0,
    maximum: 1,
    description: "Minimum snowScore01 to place the medium snow selector.",
  }),
  heavyThreshold: Type.Number({
    default: 0.8,
    minimum: 0,
    maximum: 1,
    description: "Minimum snowScore01 to place the heavy snow selector.",
  }),
  // Optional companion hazard (e.g. PLOTEFFECT_FROSTBITE) co-placed on the COLDEST selected
  // snow tiles — those with snowScore01 >= hazardThreshold. The snow selectors are cosmetic
  // (Damage=0, render via terrain material); the hazard carries the per-turn Damage. Genuinely
  // opt-in (no schema default): when omitted, only cosmetic snow is placed.
  hazard: Type.Optional(
    Type.Object({
      typeName: Type.Unsafe<PlotEffectKey>(
        Type.String({
          description: "Companion damaging plot effect type (ex: PLOTEFFECT_FROSTBITE).",
        })
      ),
    })
  ),
  hazardThreshold: Type.Number({
    default: 0.85,
    minimum: 0,
    maximum: 1,
    description:
      "Minimum snowScore01 (deepest cold) for a selected snow tile to also receive the hazard.",
  }),
});

const PlotEffectsSandPlanSchema = Type.Object({
  enabled: Type.Boolean({ default: false, description: "Enable planning of sand plot effects." }),
  selector: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_SAND" }),
  // Optional companion effect CO-PLACED on the SAME selected sand tiles. The `selector`
  // (PLOTEFFECT_SAND) is cosmetic (Damage=0) and provides the visible marker; the hazard
  // carries the per-turn Damage (e.g. PLOTEFFECT_DESERT_HEAT). Genuinely opt-in (no schema
  // default): when omitted, sand is placed alone (pure cosmetic). Both effects coexist on
  // the tile — the engine supports multiple plot effects per plot.
  hazard: Type.Optional(
    Type.Object({
      typeName: Type.Unsafe<PlotEffectKey>(
        Type.String({
          description: "Companion damaging plot effect type (ex: PLOTEFFECT_DESERT_HEAT).",
        })
      ),
    })
  ),
  coveragePct: Type.Number({
    default: 18,
    minimum: 0,
    maximum: 100,
    description: "Percent of eligible sand tiles to place (deterministic top-coverage selection).",
  }),
});

const PlotEffectsBurnedPlanSchema = Type.Object({
  enabled: Type.Boolean({ default: false, description: "Enable planning of burned plot effects." }),
  selector: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_BURNED" }),
  coveragePct: Type.Number({
    default: 8,
    minimum: 0,
    maximum: 100,
    description:
      "Percent of eligible burned tiles to place (deterministic top-coverage selection).",
  }),
});

// Jungle hazard channel. Unlike sand (cosmetic + companion hazard), jungle places ONLY the
// hazard (e.g. PLOTEFFECT_JUNGLE_FEVER) — the rainforest FEATURE is the visual, so no cosmetic
// co-placement is needed. The `selector` IS the damaging effect, placed on the hottest/wettest/
// densest rainforest tiles (jungle stress top-coverage).
const PlotEffectsJunglePlanSchema = Type.Object({
  enabled: Type.Boolean({ default: false, description: "Enable planning of jungle plot effects." }),
  selector: createPlotEffectSelectorSchema({ typeName: "PLOTEFFECT_JUNGLE_FEVER" }),
  coveragePct: Type.Number({
    default: 12,
    minimum: 0,
    maximum: 100,
    description:
      "Percent of eligible jungle tiles to place (deterministic top-coverage selection).",
  }),
});

const PlotEffectKeySchema = Type.Unsafe<PlotEffectKey>(
  Type.String({
    description: "Plot effect key (PLOTEFFECT_*).",
    pattern: "^PLOTEFFECT_",
  })
);

const PlotEffectPlacementSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  plotEffect: PlotEffectKeySchema,
});

const PlanPlotEffectsContract = defineOp({
  kind: "plan",
  id: "ecology/plot-effects/placement",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Number({ description: "Deterministic seed for tie-break ordering." }),
    snowScore01: TypedArraySchemas.f32({
      description: "Snow suitability score per tile (0..1).",
    }),
    snowEligibleMask: TypedArraySchemas.u8({
      description: "Snow eligibility mask per tile (1=eligible, 0=ineligible).",
    }),
    sandScore01: TypedArraySchemas.f32({
      description: "Sand suitability score per tile (0..1).",
    }),
    sandEligibleMask: TypedArraySchemas.u8({
      description: "Sand eligibility mask per tile (1=eligible, 0=ineligible).",
    }),
    burnedScore01: TypedArraySchemas.f32({
      description: "Burned suitability score per tile (0..1).",
    }),
    burnedEligibleMask: TypedArraySchemas.u8({
      description: "Burned eligibility mask per tile (1=eligible, 0=ineligible).",
    }),
    jungleScore01: TypedArraySchemas.f32({
      description: "Jungle stress score per tile (0..1).",
    }),
    jungleEligibleMask: TypedArraySchemas.u8({
      description: "Jungle eligibility mask per tile (1=eligible, 0=ineligible).",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(PlotEffectPlacementSchema),
  }),
  strategies: {
    default: Type.Object({
      snow: PlotEffectsSnowPlanSchema,
      sand: PlotEffectsSandPlanSchema,
      burned: PlotEffectsBurnedPlanSchema,
      jungle: PlotEffectsJunglePlanSchema,
    }),
  },
});

export default PlanPlotEffectsContract;
