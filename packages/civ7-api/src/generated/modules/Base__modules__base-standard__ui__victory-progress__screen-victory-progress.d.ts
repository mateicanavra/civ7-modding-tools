/**
 * @file screen-victory-progress.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Shows a list of player rankings for the Era victory conditions
 */
import { PlayerScore } from "/base-standard/ui/victory-progress/model-victory-progress.js";
export type VictoriesOverview = Record<string, PlayerScore[]>;
export declare enum VictoryProgressOpenTab {
    None = 0,
    LegacyPathsEconomic = 1,
    LegacyPathsMilitary = 2,
    LegacyPathsScience = 3,
    LegacyPathsCulture = 4,
    RankingsOverView = 5,
    RankingsLegacyPoints = 6
}
