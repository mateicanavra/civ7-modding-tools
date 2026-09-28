/**
 * @file cursor.ts
 * @copyright 2020-2025, Firaxis Games
 * @description Input marshaling of where the 'cursor' should exist in screen space.
 * Cursor may be moved by a mouse, by a soft-cursor setup from gamepad, by touch, or by focus jumping via gamepad.
 */
import { IEngineInputHandler, InputEngineEvent, InputHandlerState, NavigateInputEvent } from "/core/ui/input/input-support.js";
interface CursorUpdatedEventDetail {
    x: number;
    y: number;
    target: EventTarget | null;
    plot: float2 | null;
}
/**
 * CursorUpdatedEvent is fired when the cursor's position has changed.
 */
export declare const CursorUpdatedEventName: "cursor-updated";
export declare class CursorUpdatedEvent extends CustomEvent<CursorUpdatedEventDetail> {
    constructor(x: number, y: number, target: EventTarget | null, plot: float2 | null);
}
declare class CursorSingleton implements IEngineInputHandler {
    position: float2;
    private static Instance;
    private cursorTranslate;
    private cursorTransform;
    private mouse;
    gamepad: float2;
    private isMouse;
    private _target;
    private lastPosition;
    private softCursorRoot;
    private softCursor;
    private softCursorVelocity;
    private softCursorSpeed;
    private _softCursorEnabled;
    private _hybridCursorEnabled;
    private mouseMoveDeadzone;
    private onClickListener;
    private mouseMoveEventListener;
    private mouseCheckEventListener;
    private activeDeviceTypeChangedEventListener;
    private moveSoftCursorEventListener;
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): CursorSingleton;
    /**
     * @returns true if the current location of the cursor over top of a User Interface element.
     */
    get isOnUI(): boolean;
    /**
     * @returns the current target of the cursor
     */
    get target(): Element;
    /** Obtain information about an HTML element, typically for debug logging */
    toLogString(target: Element): string;
    /**
     * Set the cursor target
     */
    set target(newTarget: Element);
    /**
     * Allow mouse based camera controls if the document body is the target or if it explicitly allows camera movement
     */
    private shouldAllowCameraControls;
    /**
     * Toggles the software cursor
     * Resets to center of screen on enabled
     */
    set softCursorEnabled(enabled: boolean);
    /**
     * @returns true if the software cursor is enabled
     */
    get softCursorEnabled(): boolean;
    set hybridCursorEnabled(enabled: boolean);
    get hybridCursorEnabled(): boolean;
    /**
     * Wire up event listeners.
     */
    onInitialize(): void;
    onUpdate(timeDelta: DOMHighResTimeStamp): void;
    /**
     * Determine if the mouse has moved enough to warrent calling setTarget()
     * @param x New X position of mouse
     * @param y New Y position of mouse
     */
    private shouldSetTarget;
    /**
     * Track mouse position and inform focus manager of update.
     * @param event DOM mouse event.
     */
    private onMouseMove;
    /**
     * FXS Custom
     * Force a check of the target at the existing mouse position.
     * @param event Partial mouse event.  "target" will not be filled out,
     * as that is typically set by Gameface, but this event likely game from the script itself.
     */
    private onMouseCheck;
    /**
     * Set the current cursor target position
     * Should ONLY be triggered by mouse movement and mouse button clicks
     * @param target Element currently being targeted by the cursor
     * @param x X position of the cursor
     * @param y Y position of the cursor
     */
    private setTarget;
    private onMoveSoftCursor;
    private onToggleMouseEmulate;
    private onActiveDeviceTypeChanged;
    /** Set the game pad's virtual position. */
    setGamePadScreenPosition(pixel: float2): void;
    /**
     *  @returns true if still live, false if input should stop.
     */
    handleInput(_inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleNavigation(_navigationEvent: NavigateInputEvent): InputHandlerState;
    /** Update the target on standard mouse events to ensure we have the best target */
    private onClick;
}
declare global {
    interface WindowEventMap {
        "cursor-updated": CursorUpdatedEvent;
    }
}
declare const Cursor: CursorSingleton;
export { Cursor as default };
