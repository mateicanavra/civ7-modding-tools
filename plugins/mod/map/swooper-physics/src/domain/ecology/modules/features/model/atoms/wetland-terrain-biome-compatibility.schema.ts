import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Closed static terrain/biome compatibility grids supplied by the recipe, not native feasibility. */
export const WetlandTerrainBiomeCompatibilityMasksSchema = Type.Object(
  {
    marsh: TypedArraySchemas.u8({ description: "1 = statically compatible marsh tile." }),
    "tundra-bog": TypedArraySchemas.u8({ description: "1 = statically compatible tundra-bog tile." }),
    mangrove: TypedArraySchemas.u8({ description: "1 = statically compatible mangrove tile." }),
    oasis: TypedArraySchemas.u8({ description: "1 = statically compatible oasis tile." }),
    "watering-hole": TypedArraySchemas.u8({
      description: "1 = statically compatible watering-hole tile.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Per-family official terrain/biome compatibility masks; dynamic native feasibility still requires projection checks.",
  }
);

export type WetlandTerrainBiomeCompatibilityMasks = Static<
  typeof WetlandTerrainBiomeCompatibilityMasksSchema
>;
