/**
 * @file view-resource-allocation.ts
 * @copyright 2021, Firaxis Games
 * @description Resource Allocation View
 */
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class ResourceAllocationView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
    handleReceiveFocus(): void;
    handleLoseFocus(): void;
}
