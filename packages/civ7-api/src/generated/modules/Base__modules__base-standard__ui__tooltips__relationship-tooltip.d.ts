/**
 * @file relationship-tooltip
 * @copyright 2023, Firaxis Games
 * @description Custom tooltip for the relationship buttons.
 */
import { TooltipType } from "/core/ui/tooltips/tooltip-manager.js";
export declare class RelationshipTooltipType implements TooltipType {
    showDebugInformation: boolean;
    private fragment;
    private tooltip;
    private hoveredPlayerID;
    getHTML(): any;
    reset(): void;
    isUpdateNeeded(target: HTMLElement): boolean;
    update(): void;
    isBlank(): boolean;
}
