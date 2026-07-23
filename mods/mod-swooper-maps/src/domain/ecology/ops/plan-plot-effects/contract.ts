import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { PlotEffectIntentKeySchema } from "../../model/schemas/plot-effect-intent.schema.js";
import strategies from "./strategies/contract.js";

const PlotEffectPlacementSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  plotEffect: PlotEffectIntentKeySchema,
});

/** Ranks snow, sand, burned, and jungle suitability into deterministic coverage budgets and optional hazard intent. Every implementation shares this admitted input and output boundary. */
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
  strategies,
});

export default PlanPlotEffectsContract;
