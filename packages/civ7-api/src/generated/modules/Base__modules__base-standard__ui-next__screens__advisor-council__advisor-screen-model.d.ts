/**
 * @file advisor-screen-model.ts
 * @copyright 2026, Firaxis Games
 * @description Manages the data and logic for the advisor screens
 */
import { OrnateFrameProps } from "/core/ui-next/components/ornate-panel.js";
import { AdvicePage } from "/base-standard/ui/advice/advice-defines.js";
export declare const AgeAdviceTags: Record<AgeType, string>;
interface AdvisorData {
    type: AdvisorType;
    title: string;
    pages: AdvicePage[];
}
export declare enum AdvicePanelTypes {
    Quote = 1,
    Message = 2,
    Note = 3,
    None = 4
}
export interface AdvisorCouncilScreenContextModel {
    clickCloseScreen: () => void;
    clickClosePopup: () => void;
    advisorInitialQuote: (title: string) => string;
    advisorsLastQuote: (advisor: AdvisorType) => string;
    advisorPortraitURL: (advisor: AdvisorType) => string;
    advisorsData: AdvisorData[];
    follow: (advisor: AdvisorType) => void;
    unfollow: (advisor: AdvisorType) => void;
    isFollowing: (advisor: AdvisorType) => boolean;
    getSelectedAdvisorCard: () => AdvisorType;
    setSelectedAdvisorCard: (advisor: AdvisorType) => void;
    getSelectedPanel: () => AdvicePanelTypes;
    setSelectedPanel: (panel: AdvicePanelTypes) => void;
    playFollowAudio: (advisor: AdvisorType) => void;
    ornatePanelData: OrnateFrameProps;
}
export declare function createAdvisorCouncilScreenModel(): any;
export declare const AdvisorCouncilScreenContext: any;
export declare function useAdvisorScreenContext(): any;
export {};
