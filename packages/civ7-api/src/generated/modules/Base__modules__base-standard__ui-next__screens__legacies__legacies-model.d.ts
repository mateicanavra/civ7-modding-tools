/**
 * @file legacies-model.ts
 * @copyright 2025, Firaxis Games
 * @description Manages all of the data and logic for the legacies screen
 */
import { Accessor, Setter } from "solid-js";
export interface TriumphData {
    triumphName: string;
    triumphRequirements: string;
    triumphDescription: string;
    isTriggered: boolean;
    isFirstOnly: boolean;
    progressString: string;
    currentProgress: number;
    progressGoal: number;
    lockedReason?: string;
    traitIcon: string;
    bgColor: string;
    descriptionBG: string;
    raceWinnerName?: string;
    isComingSoon: boolean;
    triumphType: string;
    isTracked: boolean;
    isMajor: boolean;
    progressPips?: number[];
    filterOptions: string[];
}
interface TriumphTabData {
    titleText: string;
    triumphs: TriumphData[];
}
export interface LegacyScreenContextModel {
    triumphSections: TriumphTabData[];
    playerColor: string;
    bgSrc: string;
    onClickClose: () => void;
    selectedTriumphFilter: Accessor<TriumphFilterOptions | undefined>;
    setSelectedTriumphFilter: Setter<TriumphFilterOptions | undefined>;
    isShowingDetails: Accessor<boolean>;
    setIsShowingDetails: Setter<boolean>;
}
export declare enum TriumphFilterOptions {
    DEFAULT = "DEFAULT",
    CULTURAL = "CULTURAL",
    DIPLOMATIC = "DIPLOMATIC",
    ECONOMIC = "ECONOMIC",
    EXPANSIONIST = "EXPANSIONIST",
    MILITARISTIC = "MILITARISTIC",
    SCIENTIFIC = "SCIENTIFIC",
    CRISIS = "CRISIS",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETE = "COMPLETE",
    INCOMPLETE = "INCOMPLETE",
    FIRST_ONLY = "FIRST_ONLY",
    TRACKED = "TRACKED",
    UNTRACKED = "UNTRACKED"
}
export declare enum CivFilterOptions {
    ALL_ATTRIBUTES = "LOC_LEGACIES_FILTER_ALL_ATTRIBUTES",
    CULTURAL = "LOC_TAG_TRAIT_CULTURAL_NAME",
    ECONOMIC = "LOC_TAG_TRAIT_ECONOMIC_NAME",
    SCIENTIFIC = "LOC_TAG_TRAIT_EXPANSIONIST_NAME",
    MILITARISTIC = "LOC_TAG_TRAIT_MILITARISTIC_NAME",
    EXPANSIONIST = "LOC_TAG_TRAIT_POLITICAL_NAME",
    DIPLOMATIC = "LOC_TAG_TRAIT_SCIENTIFIC_NAME",
    WILDCARD = "LOC_TAG_TRAIT_WILDCARD_NAME"
}
export declare function createTriumphData(triumphDef: LegacyDefinition): TriumphData;
export declare function createLegaciesScreenModel(): any;
export declare const LegaciesScreenContext: any;
export declare function useLegaciesScreenContext(): any;
export {};
