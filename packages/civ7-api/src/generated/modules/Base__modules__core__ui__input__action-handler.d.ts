/**
 * @file action-handler.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Input point for inputs gestures raised as 'actions'; includes all gamepad input.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
declare class ActionHandlerSingleton {
    private static Instance;
    private _deviceType;
    private _deviceLayout;
    private lastMoveNavDirection;
    private onUpdate?;
    private updateGate;
    set updateCallback(callback: (model: ActionHandlerSingleton) => void);
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): ActionHandlerSingleton;
    /**
     * Try to handle the input in soft cursor mode
     * @param name The action name
     * @param status The status of the input
     * @param x x coordinate
     * @param y y coordinate
     * @returns true if the input was handled false otherwise
     */
    private handleSoftCursorInput;
    /**
     * Handle the input for tuner action
     * @param name The action name
     * @param status The status of the input
     * @returns true if the tuner did not use the input (same as the cancel status)
     */
    private handleTunerAction;
    /**
     * Handle an input event that has come from the game engine.
     * Separates event into general input "action" event or a navigation based event.
     * Order of handling starts at specific element and cascades to broader scopes until false returned.
     * 	1. Send to ContextManager (which first try the focused item)
     * 	2. Send to global (window)
     *
     * @param name The "action" name of the event as defined by the engine's Input library (typically in the XML.)
     * @param status Status of the input type.
     * @param x coordinate if relevant.
     * @param y coordinate if relevant
     */
    private onEngineInput;
    /**
     * Checks if an input event is for a navigation-based action.
     * @param inputEvent An input event.
     * @returns true if the input event is used for navigating input focus (e.g., switching between menu items)
     */
    isNavigationInput(inputEvent: InputEngineEvent): boolean;
    private onDeviceTypeChanged;
    get isMouseKeyboardActive(): boolean;
    get isGamepadActive(): boolean;
    get isTouchActive(): boolean;
    get isHybridActive(): boolean;
    get deviceLayout(): InputDeviceLayout;
    get deviceType(): InputDeviceType;
    private isCursorShowing;
    set deviceType(inputDeviceType: InputDeviceType);
    /**
     * For the special case where it's believed an element has moved to
     * or from what is below the cursor and a new check needs to be done
     * for tooltips (and other reasons)?
     */
    forceCursorCheck(): void;
    set deviceLayout(inputDeviceLayout: InputDeviceLayout);
}
export declare const ActionHandler: ActionHandlerSingleton;
export default ActionHandler;
