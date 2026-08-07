/**
 * @file government-chooser-model.ts
 * @copyright 2026 Firaxis Games
 * @description Model for choosing your government
 */
import { TraditionDisplayItem } from "/base-standard/ui/policies/model-government.js";
export interface GovtScreenChooserModel {
    choicesAvailable: GovtChoiceItem[];
    currentlySelectedChoice: GovernmentType | null;
    onCardClick: (governmentType: GovernmentType) => void;
    onConfirmClicked: () => void;
    onCloseClicked: () => void;
}
export interface GovtChoiceItem {
    governmentName: string;
    governmentPassive?: string;
    celebrationItems: GovtDisplayItem[];
    governmentType: GovernmentType;
    traditionsUnlocked: TraditionDisplayItem[];
}
interface GovtDisplayItem {
    itemName?: string;
    image: string;
    description: string;
}
export declare function createGovtChooserModel(): any;
export declare const GovtChooserModel: any;
export declare const GovtChooserModelContext: any;
export declare function useGovtChooserModelContext(): any;
export {};
