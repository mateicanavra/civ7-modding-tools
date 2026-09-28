/**
 * @file input-filter.ts
 * @copyright 2025, Firaxis Games
 * @description Input handler for input exceptions.
 */
import { IEngineInputHandler, InputEngineEvent, InputHandlerState } from "/core/ui/input/input-support.js";
export interface InputFilter {
    inputName: string;
    filterSource?: string;
}
declare class InputFilterSingleton implements IEngineInputHandler {
    private static Instance;
    private _allowFilters;
    private activeFilters;
    get allowFilters(): boolean;
    set allowFilters(newValue: boolean);
    /**
     * Singleton accessor
     */
    static getInstance(): InputFilterSingleton;
    /**
     * Handles touch inputs
     * @param {InputEngineEvent} inputEvent An input event
     * @returns true if the input is still "live" and not yet cancelled.
     * @implements InputEngineEvent
     */
    handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * Input filter doesn't handle navigation input events
     */
    handleNavigation(): InputHandlerState;
    /**
     * Adds a filter
     * @param inputFilter Contains the input action to be filtered.
     * @returns true if the filter was added
     */
    addInputFilter(inputFilter: InputFilter): boolean;
    /**
     * Removes a given filter by name
     * @param inputFilter the filter to remove
     * @returns true if the filter was removed
     */
    removeInputFilter(inputFilter: InputFilter): boolean;
    /**
     * Cleanup the manager from all current filters
     */
    removeAllInputFilters(): void;
}
declare const InputFilterManager: InputFilterSingleton;
export { InputFilterManager as default };
