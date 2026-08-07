/**
 * @file view-diplomacy-world.ts
 * @copyright 2026 Firaxis Games
 * @description A specific view of the game world with most elements disabled for use with diplomacy peace deals
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class DiplomacyWorldView implements IGameView {
    private canPlayExitSound;
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    readInputEvent(inputEvent: InputEngineEvent): boolean;
    getRules(): ViewRules[];
}
