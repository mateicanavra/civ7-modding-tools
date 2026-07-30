import type { RecipeInitialSetupInputOf } from "@swooper/mapgen-core/authoring";

import {
  STANDARD_INITIAL_SETUP,
  type StandardInitialSetupInput,
} from "../../../src/recipes/standard/initial-setup.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";

type IsEqual<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends <Type>() => Type extends Right ? 1 : 2
    ? true
    : false;
type Expect<Condition extends true> = Condition;

type RecipeSetupIsStandard = Expect<
  IsEqual<RecipeInitialSetupInputOf<typeof standardRecipe>, StandardInitialSetupInput>
>;
type RecipeRetainsExactAuthority = Expect<
  IsEqual<typeof standardRecipe.initialSetup, typeof STANDARD_INITIAL_SETUP>
>;
type MapOptionEvidence = StandardInitialSetupInput["options"]["map"][number];
type GameOptionEvidence = StandardInitialSetupInput["options"]["game"][number];
type PlayerOptionEvidence =
  StandardInitialSetupInput["options"]["player"][number]["options"][number];
type MapSeaLevelEvidence = Extract<MapOptionEvidence, { status: "available"; key: "MapSeaLevel" }>;
type MaxTurnsEvidence = Extract<GameOptionEvidence, { status: "available"; key: "MaxTurns" }>;
type CrisesEvidence = Extract<GameOptionEvidence, { status: "available"; key: "Crises" }>;
type PlayerTeamEvidence = Extract<PlayerOptionEvidence, { status: "available"; key: "PlayerTeam" }>;
type CustomMapSelection = Extract<
  StandardInitialSetupInput["map"]["selection"],
  { kind: "custom" }
>;
type MapSeaLevelUsesOfficialString = Expect<IsEqual<MapSeaLevelEvidence["value"], string>>;
type MaxTurnsUsesOfficialInteger = Expect<IsEqual<MaxTurnsEvidence["value"], number>>;
type CrisesUsesOfficialStringArray = Expect<IsEqual<CrisesEvidence["value"], readonly string[]>>;
type PlayerTeamUsesOfficialInteger = Expect<IsEqual<PlayerTeamEvidence["value"], number>>;
type CustomMapSelectionRequiresStableId = Expect<
  IsEqual<CustomMapSelection["id"], string | number>
>;

const admittedMapSeaLevel = {
  status: "available",
  key: "MapSeaLevel",
  value: "SEA_LEVEL_STANDARD",
} satisfies MapOptionEvidence;

const admittedMaxTurns = {
  status: "available",
  key: "MaxTurns",
  value: 300,
} satisfies GameOptionEvidence;

const rejectedMapSeaLevel: MapOptionEvidence = {
  status: "available",
  key: "MapSeaLevel",
  // @ts-expect-error MapSeaLevel uses the official string-valued Civ7 map-option schema.
  value: true,
};

const rejectedMaxTurns: GameOptionEvidence = {
  status: "available",
  key: "MaxTurns",
  // @ts-expect-error MaxTurns uses the official non-negative integer Civ7 game-option schema.
  value: "unbounded",
};

void (0 as unknown as RecipeSetupIsStandard);
void (0 as unknown as RecipeRetainsExactAuthority);
void (0 as unknown as MapSeaLevelUsesOfficialString);
void (0 as unknown as MaxTurnsUsesOfficialInteger);
void (0 as unknown as CrisesUsesOfficialStringArray);
void (0 as unknown as PlayerTeamUsesOfficialInteger);
void (0 as unknown as CustomMapSelectionRequiresStableId);
void admittedMapSeaLevel;
void admittedMaxTurns;
void rejectedMapSeaLevel;
void rejectedMaxTurns;
