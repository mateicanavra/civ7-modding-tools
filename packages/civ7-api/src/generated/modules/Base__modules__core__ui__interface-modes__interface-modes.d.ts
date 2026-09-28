/**
 * @file interface-modes.ts
 * @copyright 2019-2025, Firaxis Games
 * @description States of different "modes" the User Interface may be in while playing the game.
 */
import { InputEngineEvent, InputHandlerState, NavigateInputEvent } from "/core/ui/input/input-support.js";
export declare const InterfaceModeChangedEventName: "interface-mode-changed";
export declare class InterfaceModeChangedEvent extends CustomEvent<{
    prevMode: string;
    newMode: string;
}> {
    constructor(prevMode: string, newMode: string);
}
export declare class InterfaceModeReadyEvent extends CustomEvent<never> {
    constructor();
}
export declare namespace InterfaceMode {
    type ModeId = string;
    interface Context {
        ActionType: string;
    }
    interface Handler {
        /** Handle a transition from a different mode to the currently registered mode. */
        transitionTo(oldMode: ModeId, newMode: ModeId, context?: Context): void;
        /** Handle a transition going from the currently registered interface mode to a different mode. */
        transitionFrom(oldMode: ModeId, newMode: ModeId): void;
        /**
         * Given the environment, can this mode be entered?
         * @param {any} parameters passed into switchTo
         */
        canEnterMode?(parameters?: any): boolean;
        /** Check if this mode can be safely transitioned from */
        canLeaveMode?(newMode: ModeId): boolean;
        allowsHotKeys?(): boolean;
        /** (optional) Take an input event and potentially do something with it. */
        handleInput?(inputEvent: InputEngineEvent): InputHandlerState;
        /** (optional) Take an navigation event and attempt to handle it.
         * @returns true if still live, false if input should stop.
         */
        handleNavigation?(navigationEvent: NavigateInputEvent): InputHandlerState;
    }
    function getInterfaceModeHandler(mode: ModeId): InterfaceMode.Handler | null;
    function addHandler(mode: ModeId, handler: InterfaceMode.Handler): void;
    /**
     * Gets the current interface mode.
     *
     * @returns ModeId of the current interface mode.
     */
    function getCurrent(): ModeId;
    /**
     * Gets the parameters of the current interface mode.
     *
     * @returns Parameters passed into the current interface mode when it was switched to
     */
    function getParameters(): any;
    /**
     * Change to an interface mode.  Any input or associated views are changed as well.
     * @param mode
     * @param {any} parameters optional values that are specifically needed by a mode.
     * @returns true if successful
     */
    function switchTo(mode: ModeId, parameters?: any): boolean;
    /**
     * Default mode needs to exist, so if it doesn't assume it was called too early during a loading sequence.
     */
    function startup(): any;
    /**
     * Switch to the default interface mode.
     */
    function switchToDefault(): void;
    function isInInterfaceMode(targetMode: ModeId): boolean;
    function allowsHotKeys(): boolean;
    function handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * If the current interface mode handles navigation, let it inspect the navigation event.
     * @returns true if still live, false if input should stop.
     */
    function handleNavigation(navigationEvent: NavigateInputEvent): InputHandlerState;
    function isInDefaultMode(): boolean;
}
declare global {
    interface WindowEventMap {
        "interface-mode-ready": InterfaceModeReadyEvent;
        "interface-mode-changed": InterfaceModeChangedEvent;
    }
}
