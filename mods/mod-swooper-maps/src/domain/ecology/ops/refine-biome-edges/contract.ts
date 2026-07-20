import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Contract for Gaussian biome-edge smoothing that preserves water sentinel tiles. */
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
  defaultStrategy: "gaussian",
  strategies: {
    gaussian: Type.Object({
      radius: Type.Integer({ minimum: 1, maximum: 5, default: 1 }),
      iterations: Type.Integer({ minimum: 1, maximum: 4, default: 1 }),
    }),
  },
});

export default RefineBiomeEdgesContract;
