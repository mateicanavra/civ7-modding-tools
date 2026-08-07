/**
 * @file victories-popup-model.tsx
 * @copyright 2025-2026, Firaxis Games
 * @description SolidJS model for the victories countdown popup
 */
import { Accessor, Setter } from "solid-js";
interface VictoriesPlayerVictories {
    turnsLeft: Accessor<number>;
    setTurnsLeft: Setter<number>;
    victoryId: number;
    victoryName: string;
}
interface VictoriesOutputVictories {
    turnsLeft: number;
    victoryId: number;
    victoryName: string;
}
interface VictoriesPlayerRecord {
    turnsToVictory: Accessor<number>;
    setTurnsToVictory: Setter<number>;
    isCurrentlyDominant: boolean;
    playerId: number;
    playerName: string;
    victories: VictoriesPlayerVictories[];
    active: VictoriesOutputVictories[];
}
interface VictoriesUnlockedTiers {
    victoryName: string;
    tierName: string;
    percentage: number;
    multiplier: number;
}
export interface VictoriesPopupDataModel {
    anyPlayerDominant: Accessor<boolean>;
    setAnyPlayerDominant: Setter<boolean>;
    players: VictoriesPlayerRecord[];
    victoryUnlockBanner: boolean;
    unlockedVictories: VictoriesUnlockedTiers[];
    extraClass: Accessor<string>;
    setExtraClass: Setter<string>;
    startTimer: () => void;
    clickCloseButton: () => void;
}
export declare const VictoriesPopupDataModel: any;
export interface VictoriesPopupViewModel {
    players: VictoriesPlayerRecord[];
    victoryUnlockBanner: boolean;
    unlockedVictories: VictoriesUnlockedTiers[];
}
export declare const VictoriesPopupViewModel: any;
export {};
