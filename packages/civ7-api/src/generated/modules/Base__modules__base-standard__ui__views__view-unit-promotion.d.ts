/**
 * @file view-unit-promotion.ts
 * @copyright 2022-2024, Firaxis Games
 * @description Viewing and assigning unit promotions.
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class UnitPromotionView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    handleReceiveFocus(): void;
    handleLoseFocus(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
