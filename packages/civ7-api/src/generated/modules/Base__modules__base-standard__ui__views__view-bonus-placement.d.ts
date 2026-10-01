/**
 * @file view-bonus-placement.ts
 * @copyright 2023, Firaxis Games
 * @description The view for the placement part of the advanced start flow.
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class BonusPlacementView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
