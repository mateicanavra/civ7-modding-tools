/**
 * @file trade-route-tooltip.ts
 * @copyright 2024, Firaxis Games
 * @description Shows trade route tooltip information.
 */
import { TooltipType } from "/core/ui/tooltips/tooltip-manager.js";
export declare class TradeRouteTooltip implements TooltipType {
    private readonly tooltip;
    private tooltipContents;
    private tradeRouteIndex;
    constructor();
    getHTML(): any;
    reset(): void;
    isUpdateNeeded(target: HTMLElement): boolean;
    update(): void;
    isBlank(): boolean;
}
