/**
 * @file view-age-transitions.ts
 * @copyright 2026, Firaxis Games
 * @description View for age transitions
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class AgeTransitionView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
