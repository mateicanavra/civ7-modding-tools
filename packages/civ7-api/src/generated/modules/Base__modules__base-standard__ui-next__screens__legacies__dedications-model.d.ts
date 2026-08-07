/**
 * @file dedications-model.ts
 * @copyright 2026, Firaxis Games
 * @description Manages all of the data and logic for the dedications screen and tab.
 */
export interface DedicationCardItem {
    id: string;
    containerID: string;
    type: string;
    description: string;
    traitIcon?: string;
    descriptionBG?: string;
}
export interface DedicationData {
    id: string;
    containerID: string;
    type: string;
    title: string;
    description: string;
    isDisabled: boolean;
    traitIcon?: string;
    descriptionBG?: string;
    filterOptions?: string[];
}
export declare enum DedicationsFilterOptions {
    ALL = "ALL",
    DEFAULT = "DEFAULT",
    CULTURAL = "CULTURAL",
    DIPLOMATIC = "DIPLOMATIC",
    ECONOMIC = "ECONOMIC",
    EXPANSIONIST = "EXPANSIONIST",
    MILITARISTIC = "MILITARISTIC",
    SCIENTIFIC = "SCIENTIFIC",
    CRISIS = "CRISIS"
}
export declare const DedicationsModel: any;
