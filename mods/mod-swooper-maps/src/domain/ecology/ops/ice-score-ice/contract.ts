import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Scores sea and alpine ice suitability from temperature, elevation, freeze persistence, and land-water state. Every implementation shares this admitted input and output boundary. */
const ScoreIceContract = defineOp({
  kind: "compute",
  id: "ecology/ice/score/ice",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation in meters." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
  }),
  strategies,
});

export default ScoreIceContract;
