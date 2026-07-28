import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
} from "@civ7/adapter";
import {
  createRecipe,
  defineInitialSetup,
  type RecipeModule,
  Type,
} from "@swooper/mapgen-core/authoring";

import { createMap } from "../src/mapgen/createMap.js";

const MAP_SEA_LEVEL_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "MapSeaLevel");
const START_POSITION_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "StartPosition");
const RULESET_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Ruleset");
const PLAYER_TEAM_OPTION = descriptorById(CIV7_PLAYER_OPTION_DESCRIPTORS, "PlayerTeam");
const FORGED_MAP_OPTION = {
  configurationGroup: "Map",
  parameterId: "ForgedMapOption",
  cardinality: "scalar",
  valueKind: "string",
  physicalProjections: {
    configuration: { key: "ForgedMapOption", encoding: "literal" },
    authoredValue: { key: "ForgedMapOption" },
  },
  authoredValueRead: {
    kind: "configuration",
    key: "ForgedMapOption",
    source: "configuration-key",
  },
} as const;

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

const concreteProductRecipe = createRecipe({
  id: "concrete-product",
  initialSetup: ProductInitialSetup,
  stages: [],
  operations: {},
});

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
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
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
      requestedMapOptions: [START_POSITION_OPTION, MAP_SEA_LEVEL_OPTION],
      requestedGameOptions: [RULESET_OPTION],
      requestedPlayerOptions: [PLAYER_TEAM_OPTION],
      project: (capture) => {
        const firstMapKey: "StartPosition" = capture.options.map[0].key;
        const secondMapKey: "MapSeaLevel" = capture.options.map[1].key;
        const gameKey: "Ruleset" = capture.options.game[0].key;
        const playerKey: "PlayerTeam" = capture.options.player[0]!.options[0].key;
        if (capture.options.map[1].status === "available") {
          const seaLevel: string = capture.options.map[1].value;
          void seaLevel;
        }
        if (capture.options.game[0].status === "available") {
          const ruleset: string = capture.options.game[0].value;
          void ruleset;
        }
        void firstMapKey;
        void secondMapKey;
        void gameKey;
        void playerKey;
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

  createMap({
    id: "concrete-product",
    name: "Concrete Product",
    recipe: concreteProductRecipe,
    config: {},
    initialSetup: {
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        gameSeed: capture.gameSeed,
        seaLevel: "normal",
      }),
    },
  });

  createMap({
    id: "forged-option",
    name: "Forged Option",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      // @ts-expect-error Map capture accepts only exact generated descriptor unions.
      requestedMapOptions: [FORGED_MAP_OPTION],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        gameSeed: capture.gameSeed,
        seaLevel: "normal",
      }),
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
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
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

function descriptorById<
  Descriptor extends Readonly<{ parameterId: string }>,
  const ParameterId extends Descriptor["parameterId"],
>(
  descriptors: readonly Descriptor[],
  parameterId: ParameterId
): Extract<Descriptor, { parameterId: ParameterId }> {
  const descriptor = descriptors.find(
    (candidate): candidate is Extract<Descriptor, { parameterId: ParameterId }> =>
      candidate.parameterId === parameterId
  );
  if (!descriptor) throw new Error(`Missing generated Civ7 setup descriptor: ${parameterId}`);
  return descriptor;
}
