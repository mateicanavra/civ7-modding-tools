import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Smooths land-biome boundaries over the hex grid while retaining the water sentinel unchanged. Every implementation shares this admitted input and output boundary. */
const RefineBiomeEdgesContract = defineOp({
  kind: "compute",
  id: "ecology/biomes/refine-edge",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    biomeIndex: TypedArraySchemas.u8({ description: "Biome indices per tile." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
  }),
  output: Type.Object({
    biomeIndex: TypedArraySchemas.u8({ description: "Smoothed biome indices per tile." }),
  }),
  strategies,
});

export default RefineBiomeEdgesContract;
