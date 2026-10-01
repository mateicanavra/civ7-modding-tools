/**
 * @file model-endgame.ts
 * @copyright 2026, Firaxis Games
 * @description Manages the data and logic for the end game screen
 */
export interface EndGameData {
    playerId: PlayerId;
    leader: string;
    leaderName: string;
    leaderQuote: string;
    victoryClassType: string;
    victoryName: string;
    victoryDescription: string;
    victoryIconUrl: string;
    victoryBgUrl: string;
    leaderQuoteAudioKey: string;
    isDefeated: boolean;
    movieType: string;
    victoryTab: string;
    isAlive: boolean;
    victorySound: string;
    allowOneMoreTurn: boolean;
    showNextTurnButton: boolean;
}
export interface EndGameContextModel {
    endgameData: EndGameData;
}
export declare function createEndGameContextModel(): {
    endgameData: any;
    refreshEndgameData: () => void;
};
export declare const EndGameScreenContext: any;
export declare function useEndGameContext(): any;
