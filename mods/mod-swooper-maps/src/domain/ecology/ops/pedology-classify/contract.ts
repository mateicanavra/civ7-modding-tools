import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import balancedDefinition from "./strategies/balanced/config.js";
import coastalShelfDefinition from "./strategies/coastal-shelf/config.js";
import orogenyBoostedDefinition from "./strategies/orogeny-boosted/config.js";

/** Derives soil class and fertility from climate, relief, sediment, and bedrock through one shared classifier boundary. Every implementation shares this admitted input and output boundary. */
const PedologyClassifyContract = defineOp({
  kind: "compute",
  id: "ecology/pedology/classify",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation in meters above sea level." }),
    rainfall: TypedArraySchemas.u8({ description: "Rainfall per tile (0..255)." }),
    humidity: TypedArraySchemas.u8({ description: "Humidity per tile (0..255)." }),
    sedimentDepth: Type.Optional(
      Type.Union([
        TypedArraySchemas.f32({ description: "Optional sediment depth proxy (meters)." }),
        Type.Undefined(),
      ])
    ),
    bedrockAge: Type.Optional(
      Type.Union([
        TypedArraySchemas.i16({ description: "Optional bedrock age proxy (millions of years)." }),
        Type.Undefined(),
      ])
    ),
    slope: Type.Optional(
      Type.Union([
        TypedArraySchemas.f32({ description: "Optional slope or relief proxy (0..1)." }),
        Type.Undefined(),
      ])
    ),
  }),
  output: Type.Object({
    soilType: TypedArraySchemas.u8({ description: "Soil palette index per tile." }),
    fertility: TypedArraySchemas.f32({ description: "Fertility score per tile (0..1)." }),
  }),
  defaultStrategy: "balanced",
  strategies: [balancedDefinition, coastalShelfDefinition, orogenyBoostedDefinition],
});

export default PedologyClassifyContract;
