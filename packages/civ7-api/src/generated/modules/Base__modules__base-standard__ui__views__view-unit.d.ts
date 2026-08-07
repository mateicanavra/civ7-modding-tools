/**
 * @file view-unit.ts
 * @copyright 2021-2023, Firaxis Games
 * @description When viewing a particular unit.
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class UnitView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
    handleReceiveFocus(): void;
}
