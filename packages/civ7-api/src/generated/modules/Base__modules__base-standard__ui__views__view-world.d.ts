/**
 * @file view-world.ts
 * @copyright 2021-2024, Firaxis Games
 * @description The most common view for when playing the default game, exploring the world.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare class WorldView implements IGameView {
    private deviceTypeChangedListener;
    private wasMouseKeyboard;
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    getRules(): ViewRules[];
    handleLoseFocus(): void;
    handleReceiveFocus(): void;
    readInputEvent(inputEvent: InputEngineEvent): boolean;
    private onDeviceTypeChanged;
}
