/**
 * @file Modding Registry Handler
 * @copyright 2025, Firaxis Games
 * @description Stores and manages any "mod" elements to add to moddable panels
 */
export interface ModComponentRegistryData {
    componentTag: string;
    parentID: string;
    modSlot: string;
}
declare class ModdingRegistryManager {
    private modElements;
    private static _Instance;
    static getInstance(): ModdingRegistryManager;
    /**
     * Called by the addon components to register themselves with the manager
     * @param modElementData Data package for registering a mod element
     */
    add(modElementData: ModComponentRegistryData): void;
    /**
     * Called by the panel that modding components attach to
     * @param requestingPanelID Which panel/component is requesting mod elements
     */
    attachModElements(requestingPanelID: string): void;
}
export declare const ModdingRegistry: ModdingRegistryManager;
export {};
