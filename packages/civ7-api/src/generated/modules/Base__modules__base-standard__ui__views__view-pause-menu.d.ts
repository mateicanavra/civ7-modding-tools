/**
 * @file view-pause-menu.ts
 * @copyright 2025, Firaxis Games
 * @description View for pause menu
 */
import { InputEngineEvent, InputHandlerState } from "/core/ui/input/input-support.js";
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class PauseMenuView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    handleReceiveFocus(): void;
    handleInputEvent(inputEvent: InputEngineEvent): InputHandlerState;
    handleLoseFocus(): void;
    getRules(): ViewRules[];
}
