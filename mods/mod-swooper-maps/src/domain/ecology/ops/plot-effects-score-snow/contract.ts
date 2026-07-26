import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import coldElevationDefinition from "./strategies/cold-elevation/config.js";

/** Scores cold land from freeze, elevation, and moisture under authored temperature and aridity limits. Every implementation shares this admitted input and output boundary. */
const PlotEffectsScoreSnowContract = defineOp({
  kind: "compute",
  id: "ecology/plot-effects/score/snow",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Snow suitability score per tile (0..1)." }),
    eligibleMask: TypedArraySchemas.u8({
      description: "Eligibility mask per tile (1=eligible for selection, 0=ineligible).",
    }),
  }),
  strategies: [coldElevationDefinition],
});

export default PlotEffectsScoreSnowContract;
