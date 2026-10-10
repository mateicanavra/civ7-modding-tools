import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import coldForestDefinition from "./strategies/cold-forest/config.js";

/** Scores cold forest opportunity from annual energy, atmospheric water, biomass, and plant stress. Every implementation retains this shared vegetation input and output boundary. */
const ScoreVegetationTaigaContract = defineOp({
  kind: "compute",
  id: "ecology/vegetation/score/taiga",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      energy01: TypedArraySchemas.f32({ description: "Growth energy proxy (0..1)." }),
      atmosphericWater01: TypedArraySchemas.f32({ description: "Atmospheric moisture habitat band (0..1), not local growth water or waterlogging." }),
      plantWaterStress01: TypedArraySchemas.f32({ description: "Plant water limitation (0..1)." }),
      coldStress01: TypedArraySchemas.f32({ description: "Shared cold stress context (0..1); cold-forest selects habitat through annual energy instead." }),
      biomass01: TypedArraySchemas.f32({ description: "Biomass proxy (0..1)." }),
      fertility01: TypedArraySchemas.f32({ description: "Shared fertility context (0..1); cold-forest consumes its upstream biomass contribution." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Taiga suitability score per tile (0..1)." }),
  }),
  strategies: [coldForestDefinition],
});

export default ScoreVegetationTaigaContract;
