import { Accessor } from "solid-js";
export interface ReactiveGameSetupParameter extends GameSetupParameter {
    setValue: (value: GameSetupParameterValue) => void;
    update: () => void;
    destroyed: boolean;
    setDestroyed: (value: boolean) => void;
}
export interface ConfigurationPlayerSlot {
    playerId: PlayerId;
    isLocalPlayer: boolean;
    slotStatus: SlotStatus;
    setSlotStatus: (value: SlotStatus) => void;
}
export type GameParametersName = "Difficulty" | "GameSpeeds" | "Map" | "MapSize" | "AgeTransitionSetting" | string;
export type GameSetupParameters = Record<GameParametersName, ReactiveGameSetupParameter>;
export type PlayerParameterName = "PlayerLeader" | "PlayerCivilization" | "AgeTransitionPlayerCivilization" | string;
export type PlayerSetupParameters = Record<PlayerParameterName, ReactiveGameSetupParameter>;
/**
 * Usage: GameParametersModel.get().[ParameterName]
 */
export type GameSetupParametersModel = GameSetupParameters;
export interface GameSetupParametersByGroupModel {
    groups: Record<string, GameSetupParameters>;
    groupNames: ReadonlyMap<string, string>;
}
export interface PlayerSlotConfiguration {
    allSlots: Accessor<ConfigurationPlayerSlot[]>;
    openSlots: Accessor<ConfigurationPlayerSlot[]>;
    activeSlots: Accessor<ConfigurationPlayerSlot[]>;
    reload: () => void;
}
/**
 * Usage: GameParametersModel.get().players[playerId].[ParameterName]
 */
export interface PlayerSetupParametersModel {
    players: Record<number, PlayerSetupParameters>;
    configuration: PlayerSlotConfiguration;
}
export interface CombinedSetupParamaterModels {
    gameParametersModel: GameSetupParametersModel;
    gameParametersByGroupModel: GameSetupParametersByGroupModel;
    playerParametersModel: PlayerSetupParametersModel;
    forceRefresh: () => void;
    resetToDefaults: () => void;
}
export declare const SetupParametersModel: any;
export declare const PlayerSetupParametersModel: any;
export declare const GameSetupParametersModel: any;
export declare const GameSetupParameterGroupsModel: any;
