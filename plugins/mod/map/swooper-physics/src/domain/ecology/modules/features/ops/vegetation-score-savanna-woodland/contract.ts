import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import warmSeasonalDefinition from "./strategies/warm-seasonal/config.js";

/** Scores warm seasonal woodland from energy, water stress, and biomass evidence. Every implementation shares this admitted input and output boundary. */
const ScoreVegetationSavannaWoodlandContract = defineOp({
  kind: "compute",
  id: "ecology/vegetation/score/savanna-woodland",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      energy01: TypedArraySchemas.f32({ description: "Growth energy proxy (0..1)." }),
      plantWater01: TypedArraySchemas.f32({ description: "Plant growth water opportunity (0..1)." }),
      climaticAridity01: TypedArraySchemas.f32({ description: "Atmospheric climatic dryness habitat band (0..1), not plant stress." }),
      coldStress01: TypedArraySchemas.f32({ description: "Cold stress proxy (0..1)." }),
      biomass01: TypedArraySchemas.f32({ description: "Biomass proxy (0..1)." }),
      fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    score01: TypedArraySchemas.f32({
      description: "Savanna woodland suitability score per tile (0..1).",
    }),
  }),
  strategies: [warmSeasonalDefinition],
});

export default ScoreVegetationSavannaWoodlandContract;
