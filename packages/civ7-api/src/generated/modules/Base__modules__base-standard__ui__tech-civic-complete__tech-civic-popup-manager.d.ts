/**
 * @file tech-civic-popup-manager.ts
 * @copyright 2022-2026, Firaxis Games
 * @description Manages the data and queue for tech and civic completed popups
 */
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
export declare enum ProgressionTreeTypes {
    TECH = "TECH",
    CULTURE = "CULTURE"
}
export interface TechCivicPopupData extends IDisplayRequestBase {
    node?: ProgressionTreeNodeDefinition;
    treeType: ProgressionTreeTypes;
}
export declare const TechCivicPopupVisibility: "tech-civic-popup-visibility";
declare class TechCivicPopupManagerClass extends DisplayHandlerBase<TechCivicPopupData> {
    private static instance;
    private techNodeCompletedListener;
    private cultureNodeCompletedListener;
    currentTechCivicPopupData: TechCivicPopupData | null;
    isFirstCivic: boolean;
    isFirstTech: boolean;
    isFirstPopup: boolean;
    constructor();
    private initializeListeners;
    private isShowing;
    /**
     * @implements {IDisplayHandler}
     */
    show(request: TechCivicPopupData): void;
    /**
     * @implements {IDisplayHandler}
     */
    hide(_request: TechCivicPopupData, _options?: DisplayHideOptions): void;
    closePopup: () => void;
    private onTechNodeCompleted;
    private onCultureNodeCompleted;
}
declare const TechCivicPopupManager: TechCivicPopupManagerClass;
export { TechCivicPopupManager as default };
