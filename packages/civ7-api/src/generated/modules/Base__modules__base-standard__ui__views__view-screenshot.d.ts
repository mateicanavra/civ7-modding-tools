/**
 * @file view-screenshot.ts
 * @copyright 2021, Firaxis Games
 * @description Marketing view for screenshots and other non-game functions.
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class ScreenshotView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    private populateHarness;
    private addButtonTo;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
