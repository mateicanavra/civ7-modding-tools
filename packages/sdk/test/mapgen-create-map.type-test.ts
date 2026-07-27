import { defineInitialSetup, type RecipeModule, Type } from "@swooper/mapgen-core/authoring";

import { createMap } from "../src/mapgen/createMap.js";

const ProductInitialSetup = defineInitialSetup({
  id: "test/product",
  schema: Type.Object(
    {
      physical: Type.Object(
        {
          mapSeed: Type.Integer(),
          dimensions: Type.Object(
            { width: Type.Integer(), height: Type.Integer() },
            { additionalProperties: false }
          ),
          latitudeBounds: Type.Object(
            { topLatitude: Type.Number(), bottomLatitude: Type.Number() },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      ),
      gameSeed: Type.Integer(),
      seaLevel: Type.String(),
    },
    { additionalProperties: false }
  ),
  physical: (value) => value.physical,
});

const CollidingPhysicalInitialSetup = defineInitialSetup({
  id: "mapgen/physical",
  schema: Type.Object(
    {
      physical: Type.Object(
        {
          mapSeed: Type.Integer(),
          dimensions: Type.Object(
            { width: Type.Integer(), height: Type.Integer() },
            { additionalProperties: false }
          ),
          latitudeBounds: Type.Object(
            { topLatitude: Type.Number(), bottomLatitude: Type.Number() },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      ),
      marker: Type.Literal("custom"),
    },
    { additionalProperties: false }
  ),
  physical: (value) => value.physical,
});

declare const baseRecipe: RecipeModule<Readonly<Record<string, never>>>;
declare const productRecipe: RecipeModule<
  Readonly<Record<string, never>>,
  Readonly<Record<string, never>>,
  typeof ProductInitialSetup
>;
declare const collidingPhysicalRecipe: RecipeModule<
  Readonly<Record<string, never>>,
  Readonly<Record<string, never>>,
  typeof CollidingPhysicalInitialSetup
>;

function mapDefinitionTypeAssertions(): void {
  createMap({
    id: "base",
    name: "Base",
    recipe: baseRecipe,
    config: {},
  });

  // @ts-expect-error Textual id equality does not make a custom authority Core's branded base.
  createMap({
    id: "missing-colliding-projector",
    name: "Missing Colliding Projector",
    recipe: collidingPhysicalRecipe,
    config: {},
  });

  createMap({
    id: "colliding-projector",
    name: "Colliding Projector",
    recipe: collidingPhysicalRecipe,
    config: {},
    initialSetup: {
      requestedMapOptionKeys: [],
      requestedGameOptionKeys: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        marker: "custom",
      }),
    },
  });

  createMap({
    id: "product",
    name: "Product",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      requestedMapOptionKeys: ["SeaLevel", "StartPosition"],
      requestedGameOptionKeys: ["Ruleset"],
      project: (capture) => {
        const mapKey: "SeaLevel" | "StartPosition" = capture.options.map[0]!.key;
        const gameKey: "Ruleset" = capture.options.game[0]!.key;
        void mapKey;
        void gameKey;
        return {
          physical: {
            mapSeed: capture.mapSeed,
            dimensions: capture.dimensions,
            latitudeBounds: capture.latitudeBounds,
          },
          gameSeed: capture.gameSeed,
          seaLevel: "normal",
        };
      },
    },
  });

  // @ts-expect-error A recipe-owned initial setup requires its Civ7 capture projector.
  createMap({
    id: "missing-product-projector",
    name: "Missing Product Projector",
    recipe: productRecipe,
    config: {},
  });

  createMap({
    id: "wrong-product-projector",
    name: "Wrong Product Projector",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      requestedMapOptionKeys: [],
      requestedGameOptionKeys: [],
      // @ts-expect-error The projector must return the recipe's complete exact initial input.
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
      }),
    },
  });
}

void mapDefinitionTypeAssertions;
