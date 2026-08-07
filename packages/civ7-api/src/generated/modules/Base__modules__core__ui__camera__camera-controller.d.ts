/**
 * @file Camera Controller
 * @copyright 2021-2025, Firaxis Games
 * @description Handles camera movement triggered by input actions
 */
import { IEngineInputHandler, InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
declare class CameraControllerSingleton implements IEngineInputHandler {
    private static instance;
    private keyboardPanDirection;
    private edgePanDirection;
    private zoomInProgress;
    private currentDragType;
    private lastMouseDragPos;
    private keyboardCameraModifierActive;
    private gamepadCameraPan;
    private panSpeed;
    private startingCameraZoom;
    private swipeVelocity;
    private engineInputListener;
    private updateFrameListener;
    private userOptionChangedListener;
    private inputContextChangedListener;
    private mouseMoveEventListener;
    private updateFrameEventHandle;
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): CameraControllerSingleton;
    private onReady;
    /**
     * When the user options change check again if we should be processing edge panning
     */
    private onUserOptionChanged;
    /**
     * Reset zoom type when navigating to other contexts to prevent getting stuck
     */
    private onInputContextChanged;
    /**
     * Check the user configuration and see if edge panning should be enabled
     */
    private updateEdgePanningState;
    /**
     * Track mouse position and keep the edge pan direction up to date.
     */
    private onMouseMove;
    /**
     * Get the configuration pan speed and modify it to an appropriate value
     */
    private getModifiedPanSpeed;
    /**
     * Starts listening for UpdateFrame so we can start panning
     */
    private startPanning;
    /**
     * Per frame update as long as pan button is pressed.
     */
    private onUpdateFrame;
    private onEngineInput;
    private handleSwipe;
    private onKeyboardCameraModifier;
    private onGamepadCameraPan;
    private setKeyboardPan;
    private cameraRotate;
    private cameraZoomIn;
    private cameraZoomOut;
    private panToMouse;
    private dragMouse;
    private isOnUI;
    private dragMouseStart;
    private dragMouseEnd;
    private dragMouseSwipe;
    private handleTouchPan;
    /**
     *  @returns true if still live, false if input should stop.
     */
    handleInput(inputEvent: InputEngineEvent): boolean;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleNavigation(_navigationEvent: NavigateInputEvent): boolean;
}
declare const CameraController: CameraControllerSingleton;
export { CameraController as default };
