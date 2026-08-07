/**
 * @file civilization-tooltip.ts
 * @copyright 2024, Firaxis Games
 * @description Shows civilization tooltip info
 */
import { CivData } from "/core/ui/shell/create-panels/age-civ-select-model.js";
import { TooltipType } from "/core/ui/tooltips/tooltip-manager.js";
export declare class CivilizationInfoTooltipModelImpl {
    private _civData;
    get civData(): CivData[];
    set civData(value: CivData[]);
    clear(): void;
}
export declare class CivilizationInfoTooltip implements TooltipType {
    private tooltip;
    private tooltipContents;
    private civIndex;
    private civIcon;
    private civName;
    private civTraits;
    private historicalReason;
    private lockedInfo;
    constructor();
    getHTML(): any;
    reset(): void;
    isUpdateNeeded(target: HTMLElement): boolean;
    update(): void;
    isBlank(): boolean;
}
export declare const CivilizationInfoTooltipModel: CivilizationInfoTooltipModelImpl;
