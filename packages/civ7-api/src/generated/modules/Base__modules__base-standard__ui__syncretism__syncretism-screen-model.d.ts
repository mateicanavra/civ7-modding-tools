/**
 * @file syncretism-screen-model.ts
 * @copyright 2025 Firaxis Games
 * @description SolidJS model for the syncretism screen.
 */
import { Accessor, Setter, type JSX } from "solid-js";
export declare const attributeFilters: string[];
export interface SyncretismCard extends JSX.HTMLAttributes<HTMLElement> {
    class?: string;
    civ: string;
    civIcon: string;
    itemsAvailable: SyncretismItem[];
    civDef: CivilizationType;
    flagType: SyncreticChoiceType;
    static?: boolean;
    traits: string[];
    bgImage: string;
    addInfo1?: string;
    addInfo2?: string;
    isSyncretized: boolean;
    hasSyncreticChoiceBeenMade: boolean;
}
export interface SyncretizedCard {
    civ: string;
    flagType: SyncreticChoiceType;
}
export interface SyncItemProps {
    class: string;
    title: string;
    icon: string;
    pack?: string;
    description: string;
    addInfo1?: string;
    addInfo2?: string;
}
export interface SyncretismScreenContext {
    title: string;
    data: SyncretismCard[];
    selectedCiv: SyncretismCard;
    selectedCivBg: string;
    syncretismChoiceMade: boolean;
    isFirstSeen: boolean;
    onCardClick: (card: SyncretismCard) => void;
    onFinalizeChoice: (civ: CivilizationType, flagType: SyncreticChoiceType) => void;
    clickCloseButton: () => void;
    clickCloseInfoButton: () => void;
    isSmallScreen: () => boolean;
    activeTab: Accessor<string>;
    setActiveTab: Setter<string>;
}
export interface SyncretismItem {
    name: string;
    icon: string;
    description: string;
    addInfo1: string;
    addInfo2: string;
}
export declare function getOpFlagString(flag: SyncreticChoiceType): "LOC_UI_SYNCRETISM_UNITS" | "LOC_UI_SYNCRETISM_INFRASTRUCTURE" | "LOC_UI_SYNCRETISM_SELF" | "";
export declare function getChoiceTypeShort(flagType: SyncreticChoiceType): string;
export declare function createSyncretismScreenModel(): any;
export declare function getAge(): any;
export declare function getCivNameString(): string;
export declare function getTraitIcon(trait: string): string;
export declare const SyncretismScreenModel: any;
export declare const SyncretismScreenModelContext: any;
export declare function useSyncretismModelContext(): any;
