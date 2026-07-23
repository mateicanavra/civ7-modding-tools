import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import strategies from "./strategies/contract.js";

/** Scores hot, arid, sparse, unfrozen land in admitted biomes for burned plot-effect intent. Every implementation shares this admitted input and output boundary. */
const PlotEffectsScoreBurnedContract = defineOp({
  kind: "compute",
  id: "ecology/plot-effects/score/burned",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol indices per tile." }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Vegetation density per tile (0..1).",
    }),
    effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C).",
    }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Burned suitability score per tile (0..1)." }),
    eligibleMask: TypedArraySchemas.u8({
      description: "Eligibility mask per tile (1=eligible for selection, 0=ineligible).",
    }),
  }),
  strategies,
});

export default PlotEffectsScoreBurnedContract;
