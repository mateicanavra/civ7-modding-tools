/**
 * @file view-diplomacy.ts
 * @copyright 2021-2024, Firaxis Games
 * @description Entering diplomatic conversations.
 */
import { InputEngineEvent, InputHandlerState, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class DiplomacyView implements IGameView {
    private canPlayExitSound;
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleInputEvent(inputEvent: InputEngineEvent): InputHandlerState;
    handleNavigation(navigationEvent: NavigateInputEvent): InputHandlerState;
    getRules(): ViewRules[];
    handleReceiveFocus(): void;
    handleLoseFocus(): void;
    private getCurrentPanels;
    private getCurrentScreens;
}
