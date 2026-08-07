/**
 * @file model-endgame.ts
 * @copyright 2023, Firaxis Games
 * @description Data model for end of game screen
 */
export interface PlayerVictory {
    victoryType: VictoryType;
    claimed: boolean;
    place: number;
    score: number;
}
export interface PlayerAgeScore {
    id: PlayerId;
    leaderName: string;
    leaderPortrait: string;
    currentAgeScore: number;
    previousAgesScore: number;
    totalScore: number;
    isAlive: boolean;
    victories: PlayerVictory[];
}
declare class EndGameModel {
    private onUpdate?;
    private updateGate;
    private ageOverListener;
    private cityAddedToMapListener;
    private cityRemovedRemovedMapListener;
    private teamVictoryListener;
    private tradeRouteChangeListener;
    private greatWorkCreatedListener;
    private wonderCompletedListener;
    private _playerScores;
    get playerScores(): PlayerAgeScore[];
    set updateCallback(callback: (model: EndGameModel) => void);
    constructor();
    private getLeaderPortrait;
    private update;
    private onAgeOver;
    private onCityAddedToMap;
    private onCityRemovedFromMap;
    private onTeamVictory;
    private onTradeRouteUpdate;
    private onGreatWorkCreated;
    private onWonderCompleted;
    getVictoryIconByVictoryClass(victoryType: VictoryType): string;
}
declare const EndGame: EndGameModel;
export { EndGame as default };
