export const CIV7_RESTART_COMMAND = "Network.restartGame()";
export const CIV7_BEGIN_GAME_COMMAND = "UI.notifyUIReady()";
export const CIV7_EXIT_TO_MAIN_MENU_COMMAND = 'engine.call("exitToMainMenu")';
export const CIV7_RELOAD_UI_COMMAND = "UI.reloadUI()";
export const CIV7_UI_LOADING_STATES = {
  NotStarted: 0,
  WaitingForGameplayData: 1,
  WaitingForLoadingCurtain: 2,
  WaitingForConfiguration: 3,
  WaitingForGameCore: 4,
  WaitingForVisualization: 5,
  WaitingForUIReady: 6,
  WaitingToStart: 7,
  GameStarted: 8,
  WaitingForGameUnloadScreenReady: 9,
} as const;
export const DEFAULT_CIV7_SETUP_PARAMETER_IDS = [
  "Ruleset",
  "Age",
  "Difficulty",
  "DifficultyIndependentsCombat",
  "DifficultyCombat",
  "DifficultyArmyXP",
  "DifficultyUnitProduction",
  "DifficultyBuildingProduction",
  "DifficultyFreeStuff",
  "DifficultyGold",
  "DifficultyScience",
  "DifficultyCulture",
  "DifficultyHappiness",
  "DifficultyTechCost",
  "DifficultyCivicCost",
  "DifficultyOceanDamage",
  "AgeLength",
  "AgeCountdownTimer",
  "AgeTransitionSetting",
  "IndependentHostility",
  "NoCivUnlocks",
  "Map",
  "MapSize",
  "MapRandomSeed",
  "GameRandomSeed",
  "GameSpeeds",
  "StartPosition",
  "TurnLimit",
  "MaxTurns",
  "DisasterIntensity",
  "Crises",
  "EnableScoreVictory",
  "LegacyPaths",
] as const;

export const DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS = [
  "PlayerCivilization",
  "PlayerLeader",
  "PlayerDifficulty",
] as const;
