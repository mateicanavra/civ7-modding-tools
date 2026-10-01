/**
 * @file unit-action-handlers.ts
 * @copyright 2021, Firaxis Games
 * @description Provides unique functionality and handling for unit actions
 */
interface UnitActionHandler {
    /**
     * Does a particular unit operation require a targetPlot if selected?
     * @returns true if this operation requires a plot to be targeted before exectuing.
     */
    isTargetPlotOperation(): boolean;
    /**
     * Switches to the intended interface mode for this handler and passes along the context data
     */
    switchTo(context?: any): void;
    /**
     * Should the interface mode be switch to, even on gamepad mode
     */
    useHandlerWithGamepad?(): boolean;
}
export declare namespace UnitActionHandlers {
    function setUnitActionHandler(actionType: string, handler: UnitActionHandler): void;
    function doesActionHaveHandler(actionType: string): boolean;
    function useHandlerWithGamepad(actionType: string): boolean;
    function doesActionRequireTargetPlot(actionType: string): boolean;
    function switchToActionInterfaceMode(actionType: string, context?: any): void;
}
export {};
