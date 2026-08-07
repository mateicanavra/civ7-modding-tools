/**
 * @file leader-select-model.ts
 * @copyright 2020-2024, Firaxis Games
 * @description Loads and stores leader data for game creation
 */
export declare enum OwnershipAction {
    None = 0,
    IncludedWith = 1,
    LinkAccount = 2
}
export interface OwnershipData {
    action: OwnershipAction;
    reason: string;
}
export interface LeaderData {
    leaderID: string;
    name: string;
    icon: string;
    description: string;
    quote: string;
    abilityTitle: string;
    abilityText: string;
    ageUnlocks: string[];
    unlocks: string[];
    nextReward?: LegendPathReward;
    playCount: number;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    prevLevelXp: number;
    tags: string[];
    isLocked: boolean;
    isOwned: boolean;
    ownershipData?: OwnershipData;
    sortIndex: number;
}
export interface MementoData {
    value: string | null;
    name: string | null;
    description: string | null;
    functionalDescription?: string | null;
    icon: string | null;
}
export declare enum MementoSlotType {
    Major = 0,
    Minor = 1
}
export interface MementoSlotData {
    gameParameter: string;
    slotType: MementoSlotType;
    isLocked: boolean;
    unlockReason: string;
    currentMemento: MementoData;
    availableMementos: MementoData[];
}
export declare function getMementoData(): MementoSlotData[];
export declare function getLeaderData(Stylize?: boolean): LeaderData[];
