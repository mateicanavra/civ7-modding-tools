/**
 * @file view-reinforcement.ts
 * @copyright 2023, Firaxis Games
 * @description Commander Reinforcement View
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class ReinforcementView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
}
