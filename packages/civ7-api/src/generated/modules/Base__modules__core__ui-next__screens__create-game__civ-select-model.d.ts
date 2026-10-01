/**
 * @file age-civ-select-model.ts
 * @copyright 2024, Firaxis Games
 * @description Age and civ support functions/classes used by shell screens
 */
import { Accessor, Setter } from "solid-js";
export interface CivBonusData {
    title: string;
    icon: string;
    text: string;
    plainText?: string;
    description: string;
    kind: string;
    age?: string;
}
export interface TraditionData {
    civic: string;
    title: string;
    text: string;
    plainText?: string;
    age?: string;
}
export interface UnlockedByData {
    text: string;
    isUnlocked: boolean;
    isGameplayUnlock?: boolean;
}
export interface CivInfo {
    civID: string;
    name: string;
    icon: string;
    bgImage: string;
    perAgeAbilities: {
        abilityTextTag: string;
        abilityTitle: string;
        abilityText: string;
        abilityPlainText?: string;
        age: string;
    }[];
    traits: string[];
    buildings: CivBonusData[];
    units: CivBonusData[];
    traditions: TraditionData[];
    isLocked: boolean;
    isOwned: boolean;
    apexAge: string;
    ageName: string;
    ageSortIndex: number;
    fulltext: string;
    colors: HexColor | null;
    introText: string;
    unlocks: string[];
    unlockedBy: UnlockedByData[];
    isCurrentCiv?: boolean;
    isPreviousCiv?: boolean;
}
export interface CivSelectModel {
    civs: CivInfo[];
    randomCiv: CivInfo;
    previousCiv: Accessor<CivInfo | undefined>;
    selectedCiv: Accessor<CivInfo>;
    setSelectedCiv: (civ: CivInfo) => void;
    viewCiv: Accessor<CivInfo | undefined>;
    setViewCiv: (civ: CivInfo | undefined) => void;
    selectNext: () => void;
    selectPrev: () => void;
    fulltextSearch: (text: string) => Set<string>;
}
export declare function createCivSelectModel(): CivSelectModel;
export declare const createAgeFilterModel: () => AgeFilterModel;
export declare const attrFilter: {
    getFilter: any;
    setFilter: any;
    reset: () => any;
};
export declare const CivSelectModel: any;
export declare const CivSelectModelContext: any;
export declare function useCivSelectModelContext(): any;
export interface AgeFilterItem {
    ageId: string;
    name: string;
}
interface AgeFilterModel {
    selected: Accessor<AgeFilterItem>;
    setSelected: Setter<AgeFilterItem>;
    options: AgeFilterItem[];
    isMatch: (ageId: string) => boolean;
    reset: () => void;
}
export {};
