/**
 * model-age-scores.ts
 * @copyright 2023-2024, Firaxis Games
 * @description Age Scores data model
 */
export interface VictoryData {
    victoryName: string;
    victoryDescription: string;
    victoryType: string;
    victoryClass: string;
    victoryIcon: string;
    victoryBackground: string;
    scoreNeeded: number;
    localPlayerPercent: number;
    playerData: PlayerData[];
}
export interface PlayerData {
    playerID: PlayerId;
    leaderName: string;
    score: number;
    percentToVictory: number;
    leaderPortrait: string;
    civIcon: string;
    rank: number;
    rankString: string;
    primaryColor: string;
    secondaryColor: string;
}
declare class AgeScoresModel {
    private onUpdate?;
    private _victories;
    get victories(): VictoryData[];
    constructor();
    private onVictoryManagerUpdate;
    set updateCallback(callback: (model: AgeScoresModel) => void);
    private updateGate;
    private createPlayerData;
    private getBackdropByVictoryClass;
    private madeRankString;
}
declare const AgeScores: AgeScoresModel;
export { AgeScores as default };
