import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ClimatePhaseFrameSchema, ClimateSamplingModelSchema } from "../../model/atoms/climate-phase.schema.js";
import periodicCycle from "./strategies/periodic-cycle/config.js";

/** Owns latitude and phase sampling identity while leaving thermal forcing to its separate operation. */
export default defineOp({
  kind: "compute",
  id: "hydrology/compute-seasonal-sampling",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    topLatitude: Type.Number({ minimum: -90, maximum: 90 }),
    bottomLatitude: Type.Number({ minimum: -90, maximum: 90 }),
    modeCount: Type.Union([Type.Literal(2), Type.Literal(4)]),
    axialTiltDeg: Type.Number({ minimum: 0, maximum: 90 }),
    rngSeed: Type.Integer({ minimum: 0, maximum: 2_147_483_647 }),
  }, { additionalProperties: false }),
  output: Type.Object({
    model: ClimateSamplingModelSchema,
    latitudeByRow: TypedArraySchemas.f32({ cardinality: ["height"], description: "True latitude for solar and ocean operations." }),
    phases: Type.Array(Type.Number({ minimum: 0, exclusiveMaximum: 1 }), { minItems: 1 }),
    weights: Type.Array(Type.Number({ exclusiveMinimum: 0 }), { minItems: 1 }),
    observationIndices: Type.Array(Type.Integer({ minimum: 0 }), { minItems: 2, maxItems: 4 }),
    frames: Type.Array(ClimatePhaseFrameSchema, { minItems: 1 }),
  }, { additionalProperties: false }),
  strategies: [periodicCycle],
});
