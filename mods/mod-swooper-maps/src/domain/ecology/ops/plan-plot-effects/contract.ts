import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { PlotEffectIntentKeySchema } from "../../model/schemas/plot-effect-intent.schema.js";

const PlotEffectsSnowPlanSchema = Type.Object({
  enabled: Type.Boolean({ default: true, description: "Enable planning of snow plot effects." }),
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
    description: "Minimum snowScore01 to place at least light snow intent.",
  }),
  mediumThreshold: Type.Number({
    default: 0.6,
    minimum: 0,
    maximum: 1,
    description: "Minimum snowScore01 to place medium snow intent.",
  }),
  heavyThreshold: Type.Number({
    default: 0.8,
    minimum: 0,
    maximum: 1,
    description: "Minimum snowScore01 to place heavy snow intent.",
  }),
  hazardEnabled: Type.Boolean({
    default: false,
    description: "Co-place frostbite intent on the coldest selected snow tiles.",
  }),
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
  hazardEnabled: Type.Boolean({
    default: false,
    description: "Co-place desert-heat intent on selected sand tiles.",
  }),
  coveragePct: Type.Number({
    default: 18,
    minimum: 0,
    maximum: 100,
    description: "Percent of eligible sand tiles to place (deterministic top-coverage selection).",
  }),
});

const PlotEffectsBurnedPlanSchema = Type.Object({
  enabled: Type.Boolean({ default: false, description: "Enable planning of burned plot effects." }),
  coveragePct: Type.Number({
    default: 8,
    minimum: 0,
    maximum: 100,
    description:
      "Percent of eligible burned tiles to place (deterministic top-coverage selection).",
  }),
});

const PlotEffectsJunglePlanSchema = Type.Object({
  enabled: Type.Boolean({ default: false, description: "Enable planning of jungle plot effects." }),
  coveragePct: Type.Number({
    default: 12,
    minimum: 0,
    maximum: 100,
    description:
      "Percent of eligible jungle tiles to place (deterministic top-coverage selection).",
  }),
});

const PlotEffectPlacementSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  plotEffect: PlotEffectIntentKeySchema,
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
