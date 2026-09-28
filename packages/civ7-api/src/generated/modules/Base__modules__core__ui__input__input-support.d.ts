/**
 * @file input-support.ts
 * @copyright 2021-2023, Firaxis Games
 * @description Defines game engine based input.
 */
interface InputEventDetails {
    readonly name: string;
    readonly status: InputActionStatuses;
    readonly x: number;
    readonly y: number;
    readonly isTouch: boolean;
    readonly isMouse: boolean;
}
export declare const InputEngineEventName: "engine-input";
export declare class InputEngineEvent extends CustomEvent<InputEventDetails> {
    constructor(name: string, status: InputActionStatuses, x: number, y: number, isTouch: boolean, isMouse: boolean, bubbles?: boolean);
    static CreateNewEvent(oldEvent: InputEngineEvent, bubbles?: boolean): InputEngineEvent;
    isCancelInput(): boolean;
}
interface NavigateInputEventDetails {
    readonly name: string;
    readonly status: InputActionStatuses;
    readonly x: number;
    readonly y: number;
    navigation: InputNavigationAction;
}
export declare const NavigateInputEventName: "navigate-input";
export declare class NavigateInputEvent extends CustomEvent<NavigateInputEventDetails> {
    getDirection(): InputNavigationAction;
    static CreateNewEvent(oldEvent: NavigateInputEvent, bubbles?: boolean): NavigateInputEvent;
}
export declare namespace AnalogInput {
    const deadzoneThreshold = 0.2;
}
export declare enum InputHandlerState {
    Active = 0,
    Handled = 1
}
/**
 * Handler interface for input that's raised from the engine.
 */
export interface IEngineInputHandler {
    /**
     * Handling an input from the engine.
     * @param {InputEngineEvent} inputEvent of type 'engine-input' with details on the event name, status, (x), (y)
     */
    handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * Handle a focus navigation event.
     * @param {NavigateInputEvent} navigationEvent of type 'navigate-input' with both engine input and navigation information
     * @returns Active if still live, Handled if input should stop.
     */
    handleNavigation(navigationEvent: NavigateInputEvent): InputHandlerState;
}
declare global {
    interface WindowEventMap {
        "engine-input": InputEngineEvent;
        "navigate-input": NavigateInputEvent;
    }
    interface HTMLElementEventMap {
        "engine-input": InputEngineEvent;
        "navigate-input": NavigateInputEvent;
    }
}
export {};
