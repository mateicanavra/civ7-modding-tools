/**
 * @file Government Screen Model
 * @copyright 2026 Firaxis Games
 * @description Handles general data for the government screen
 */
import { OrnateFrameProps } from "/core/ui-next/components/ornate-panel.js";
export interface CrisisEventsData {
    progressLabelStr: string;
    progressLabelStrRange: string;
    eventName: string;
    timelinePlacement: number;
}
export interface GovermentScreenData {
    ornatePanelData: OrnateFrameProps;
    governmentName: string;
    governmentDescription: string;
    happinessPerTurn: string;
    celebrationBonusItems: GovtEffectItem[];
    crisisProgress: string;
    showCrisisText: boolean;
    crisisBarWdith: string;
    crisisEventMarkers: CrisisEventsData[];
    celebrationTurnsLeftDesc: string;
    happinessRing: number;
    celebrationTurnsLeft: string;
    governmentAbilityDescription: string;
    happinessNeeded: number;
    happinessNextCelebrationThreshold: number;
    hasGovtBeenChosen: boolean;
    govtTraditions: TraditionDisplayItem[];
    inCelebration: boolean;
    settlementHappiness: () => HappinessStage[];
    displayCrisisTab: () => void;
}
export interface GovtEffectItem {
    itemName?: string;
    unlock?: string;
    image: string;
    description: string;
}
export interface GovtScreenContextModel {
    data: GovermentScreenData;
}
export interface TraditionDisplayItem {
    def: TraditionDefinition;
    unlock: string;
}
interface HappinessStage {
    stage: string;
    stageName: string;
    icon: string;
    textColor: string;
    min: number;
    max: number;
    settlements: number;
    happinessRange: string;
}
export declare const activePolicyTab: any, setActivePolicyTab: any;
export declare function createGovtScreenModel(): any;
export declare const GovtScreenModel: any;
export declare const GovtScreenModelContext: any;
export declare function usePoliciesModelContext(): any;
export {};
