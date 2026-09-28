import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { NAVIGABLE_RIVER_PROJECTION_POLICY } from "./model/policy/navigable-river-projection.js";
import { PlotRiversStep } from "./steps/plot-rivers/step.js";

/** Exposes only projection controls applicable to the selected physical model. */
export default createStage({
  id: "map-rivers",
  public: Type.Object({
    projection: Type.Union([
      Type.Object({
        model: Type.Literal("legacy-procedural"),
        navigableRiverDensity: Type.Union([Type.Null({ description: "Preserves the authored advanced projection thresholds." }), Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")], {
          default: null,
          description: "Optional legacy navigable density preset; null preserves advanced thresholds.",
        }),
        endpointDischargePercentileMin: Type.Number({
          minimum: 0,
          maximum: 1,
          default: NAVIGABLE_RIVER_PROJECTION_POLICY.normal.endpointDischargePercentileMin,
          description: "Minimum discharge percentile among terminal endpoints considered for legacy navigable chains.",
        }),
        targetMajorTileFraction: Type.Number({
          minimum: 0,
          maximum: 1,
          default: NAVIGABLE_RIVER_PROJECTION_POLICY.normal.targetMajorTileFraction,
          description: "Target fraction of engine-projectable major river tiles selected for legacy navigable chains.",
        }),
      }, {
        additionalProperties: false,
        description: "Legacy procedural rivers with threshold-based navigable terrain selection.",
      }),
      Type.Object({ model: Type.Literal("authored-network") }, {
        additionalProperties: false,
        description: "Projects every certified physical river source with its authored receiver and class.",
      }),
    ], {
      description: "Selects the native river projection appropriate to the physical water model.",
      default: { model: "legacy-procedural", navigableRiverDensity: null, ...NAVIGABLE_RIVER_PROJECTION_POLICY.normal },
    }),
  }, { additionalProperties: false }),
  compile: ({ config }) => {
    const projection = config.projection;
    if (projection.model === "authored-network") return { "plot-rivers": { projection } };
    const { navigableRiverDensity, ...advanced } = projection;
    return {
      "plot-rivers": { projection: navigableRiverDensity === null
        ? advanced
        : { ...advanced, ...NAVIGABLE_RIVER_PROJECTION_POLICY[navigableRiverDensity] } },
    };
  },
  steps: orderStandardStageSteps("map-rivers", {
    "plot-rivers": PlotRiversStep,
  }),
});
