/**
 * @file view-placement.ts
 * @copyright 2021 - 2024, Firaxis Games
 * @description The view when placing an object on a map (e.g., build, selecting plot, etc...)
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class PlacementView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
