/**
 * @file age-civ-select-model.ts
 * @copyright 2024, Firaxis Games
 * @description Age and civ support functions/classes used by shell screens
 */
export interface CivBonusData {
    title: string;
    icon: string;
    text: string;
    description: string;
    kind: string;
}
export interface UnlockedByData {
    text: string;
    isUnlocked: boolean;
}
export interface CivData {
    civID: string;
    name: string;
    description: string;
    icon: string;
    image: string;
    abilityTitle: string;
    abilityText: string;
    bonuses: CivBonusData[];
    tags: string[];
    unlocks: string[];
    unlockedBy: UnlockedByData[];
    isHistoricalChoice: boolean;
    historicalChoiceReason: string | null;
    historicalChoiceType: string | null;
    isLocked: boolean;
    isOwned: boolean;
    unlockCondition: string;
    sortIndex: number;
}
export interface AgeData {
    type: string;
    domain: string;
    name: string;
}
export declare function GetAgeMap(): Map<string, AgeData>;
export declare function GetCivilizationData(Stylize?: boolean): CivData[];
