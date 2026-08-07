declare const parameters: readonly [
    "Difficulty",
    "GameSpeeds",
    "Map",
    "MapSize",
    "AgeTransitionSetting",
    "GameStartCivSelectionMode",
    "LeaderAssociatedCivSelectionMode"
];
export interface GameSetupOptionInfo {
    value: GameSetupParameterValue;
    name: string;
    icon: string;
    description: string;
}
export interface GameSetupOption {
    paramName: string;
    name: string;
    options: GameSetupOptionInfo[];
    selectedOption: GameSetupOptionInfo | undefined;
    value: GameSetupParameterValue;
    setValue: (value: GameSetupParameterValue) => void;
}
export type GameSetupModel = Record<(typeof parameters)[number], GameSetupOption>;
export declare function buildGameSetupModel(): GameSetupModel;
export declare const GameSetupModel: any;
export declare const GameSetupModelContext: any;
export declare function useGameSetupModelContext(): any;
export {};
