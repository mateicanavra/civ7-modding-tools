import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Numerical sampling semantics, independent of which phases are observed. */
export const ClimateSamplingModelSchema = Type.Union([
  Type.Literal("legacy-snapshots"),
  Type.Literal("periodic-cycle"),
]);
export type ClimateSamplingModel = Static<typeof ClimateSamplingModelSchema>;

/** One seasonal phase's circulation/moisture frames and deterministic weather identity. */
export const ClimatePhaseFrameSchema = Type.Object({
  phase: Type.Number({ minimum: 0, exclusiveMaximum: 1 }),
  circulationLatitude: TypedArraySchemas.f32({ cardinality: ["height"], description: "Circulation latitude per row in degrees." }),
  thermalLatitude: TypedArraySchemas.f32({ cardinality: ["height"], description: "Legacy shifted latitude per row retained for moisture heuristics, not periodic solar geometry." }),
  transientSalt: Type.Integer({ minimum: 0, maximum: 2_147_483_647 }),
}, { additionalProperties: false });
export type ClimatePhaseFrame = Static<typeof ClimatePhaseFrameSchema>;
