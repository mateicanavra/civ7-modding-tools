import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import warmShallowLakeDefinition from "./strategies/warm-shallow-lake/config.js";

const common = {
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  landMask: TypedArraySchemas.u8({ description: "Unchanged physical land mask (1 = land, 0 = water)." }),
  surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  lakeMask: TypedArraySchemas.u8({
    description: "Hydrology lake mask per tile (1=lake, 0=non-lake).",
  }),
};

/** Scores warm shallow lake water near shore for lake-lotus habitat. Every implementation shares this admitted input and output boundary. */
const ScoreLotusContract = defineOp({
  kind: "compute",
  id: "ecology/reef/score/lotus",
  input: Type.Object({
      ...common,
      elevation: TypedArraySchemas.i16({
        description: "Unchanged physical ground in normalized model relief units, not meters.",
      }),
      bodyId: TypedArraySchemas.i32({
        description: "Certified wet-body identity per lake member; zero outside the lake footprint.",
      }),
      waterSurface: Type.Array(Type.Number(), {
        description: "Map-grid binary64 certified lake head, unchanged ground elsewhere; never quantized or native display elevation.",
      }),
    }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Lotus suitability score per tile (0..1)." }),
  }),
  strategies: [warmShallowLakeDefinition],
});

export default ScoreLotusContract;
