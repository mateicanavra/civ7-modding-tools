/**
 * @file age-progression-warning-popup-manager.ts
 * @copyright 2025, Firaxis Games
 * @description Manages age progression popups that warn the player that the age is almost over
 */
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
export interface AgeProgressionPopupData extends IDisplayRequestBase {
    turnsRemaining: number;
}
export declare const AgeProgressionMiniBannerShowEventName = "age-progression-mini-banner-show";
export declare class AgeProgressionMiniBannerShowEvent extends CustomEvent<{
    numTurns: number;
}> {
    constructor(numTurns: number);
}
declare class AgeProgressionPopupManagerClass extends DisplayHandlerBase<AgeProgressionPopupData> {
    private static instance;
    private onAgeProgressionListener;
    private _ageCountdownTimerValue;
    private _currentAgeProgressionPopupData;
    get currentAgeProgressionPopupData(): AgeProgressionPopupData | null;
    constructor();
    /**
     * @implements {IDisplayHandler}
     */
    show(request: AgeProgressionPopupData): void;
    /**
     * @implements {IDisplayHandler}
     */
    hide(_request: AgeProgressionPopupData, _options?: DisplayHideOptions): void;
    private onAgeProgression;
    closePopup: () => void;
}
declare const AgeProgressionPopupManager: AgeProgressionPopupManagerClass;
export { AgeProgressionPopupManager as default };
