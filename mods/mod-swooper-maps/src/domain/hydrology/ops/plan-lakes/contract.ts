import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import sinkDischargeBudgetDefinition from "./strategies/sink-discharge-budget/config.js";

/**
 * Hydrology lake planning is the truth-side counterpart to engine lake stamping.
 * The contract owns the typed inputs and strategy config so implementations can
 * focus on deterministic intent instead of repeating validation already handled
 * by the authoring/runtime boundary.
 */
const PlanLakesContract = defineOp({
  kind: "compute",
  id: "hydrology/plan-lakes",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    flowDir: TypedArraySchemas.i32({
      description:
        "Hydrology-conditioned receiver index per tile (or -1 for typed terminal basins).",
    }),
    discharge: TypedArraySchemas.f32({
      description:
        "Accumulated drainage proxy per tile, used to admit only meaningful terminal basins.",
    }),
    sinkMask: TypedArraySchemas.u8({
      description:
        "Hydrology lake/depression candidate mask (1=candidate, 0=not candidate), tile order.",
    }),
  }),
  output: Type.Object({
    lakeMask: TypedArraySchemas.u8({
      description: "Deterministic lake plan mask (1=planned lake tile, 0=non-lake).",
    }),
    plannedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles marked as planned lakes.",
    }),
    sinkLakeCount: Type.Integer({
      minimum: 0,
      description: "Count of sink tiles mapped to lake tiles.",
    }),
  }),
  strategies: [sinkDischargeBudgetDefinition],
});

export default PlanLakesContract;
