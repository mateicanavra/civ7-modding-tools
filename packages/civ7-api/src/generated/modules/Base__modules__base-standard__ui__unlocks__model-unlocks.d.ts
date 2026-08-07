/**
 * model-victory-progress.ts
 * @copyright 2021-2024, Firaxis Games
 * @description Gathers the score data for the era victory conditions
 */
export interface UnlockLegacies {
    name: string;
    description: string;
    unlockRequirements?: string[];
    icon?: string;
}
export interface AgelessConstructs {
    name: string;
    quantity: number;
    description: string;
    type: string;
}
export interface AgelessCommander {
    name: string;
    icon?: string;
    level: number;
    unitTypeName: string;
    type: string;
}
declare class PlayerUnlockModel {
    private onUpdate?;
    private _legacyCurrency;
    private updateGate;
    private _localPlayer;
    contructor(): void;
    private update;
    get legacyCurrency(): CardCategoryInstance[];
    get localPlayer(): PlayerLibrary | null;
    set updateCallback(callback: (model: PlayerUnlockModel) => void);
    getLegacyCurrency(): CardCategoryInstance[];
    getRewardItems(): AgeProgressionRewardDefinition[];
    getAgelessCommanderItems(): AgelessCommander[];
    getAgelessConstructsAndImprovements(): AgelessConstructs[];
    getAgelessWonders(): ConstructibleDefinition[];
    getAgelessTraditions(): TraditionDefinition[];
}
declare const PlayerUnlocks: PlayerUnlockModel;
export { PlayerUnlocks as default };
