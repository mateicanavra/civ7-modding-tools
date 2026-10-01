/**
 * @file hotkey-manager.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Handles catching keyboard hotkeys and triggering events to handle that hotkey functionality
 */
import { IEngineInputHandler, InputEngineEvent, InputHandlerState } from "/core/ui/input/input-support.js";
export type UnitHotkeyEventName = "unit-ranged-attack" | "unit-move" | "unit-skip-turn" | "unit-sleep" | "unit-heal" | "unit-fortify" | "unit-alert" | "unit-auto-explore" | "cycle-next" | "cycle-prev";
export interface UnitHotkeyEventDetail {
    name: UnitHotkeyEventName;
}
export declare class UnitHotkeyEvent extends CustomEvent<UnitHotkeyEventDetail> {
    constructor(eventName: UnitHotkeyEventName);
}
export type LayerHotkeyEventName = "toggle-grid-layer" | "toggle-yields-layer" | "toggle-resources-layer" | "toggle-radial-measure-layer";
export interface LayerHotkeyEventDetail {
    name: LayerHotkeyEventName;
}
export declare class LayerHotkeyEvent extends CustomEvent<LayerHotkeyEventDetail> {
    constructor(eventName: LayerHotkeyEventName);
}
declare global {
    interface HTMLElementEventMap {
        "unit-hotkey": UnitHotkeyEvent;
    }
}
declare class HotkeyManagerSingleton implements IEngineInputHandler {
    private static Instance;
    /**
     * Singleton accessor
     */
    static getInstance(): HotkeyManagerSingleton;
    /**
     * Handles touch inputs
     * @param {InputEngineEvent} inputEvent An input event
     * @returns true if the input is still "live" and not yet cancelled.
     * @implements InputEngineEvent
     */
    handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * Hotkey manager doesn't handle navigation input events
     */
    handleNavigation(): InputHandlerState;
    /**
     * Sends out an event to window in the style of 'hotkey-{input action name}'
     * @param {String} inputActionName Name of the input action to be appended to 'hotkey-'
     */
    private sendHotkeyEvent;
    /**
     * Sends out an event to window for unit interaction hotkeys
     * @param {UnitHotkeyEventName} inputActionName Name of the unit interaction hotkey send through the detail parameter
     */
    private sendUnitHotkeyEvent;
    /**
     * Sends a cycle hotkey event out based on input context
     * @param inputActionName
     */
    private sendCycleHotkeyEvent;
    /**
     * Saves a locally store quick save using basic params
     */
    private quickSave;
    /**
     * Loads the locally store quick save using basic params
     */
    private quickLoad;
    private nextAction;
    private sendLayerHotkeyEvent;
}
declare const HotkeyManager: HotkeyManagerSingleton;
export { HotkeyManager as default };
