/**
 * @file tooltip-controller.js
 * @copyright 2023-2024, Firaxis Games
 *
 * What's left?
 * Driver:
 *  - Gamepad event handling needs to be added.
 *  - Touch points need to be tested, along with the ability to expire tooltips.
 *  - Additional mouse events should be added for when the player moves the mouse *outside* the screen or the window loses focus to hide the tip.
 *
 * Controller:
 *  - Further testing for resized tooltips.
 *  - Add support for showing tooltips above/below or left/right of the context element
 *  - Continue to think about practical applications of multiple controller instances running at once
 *  - Clean up interface with driver and renderer.
 */
declare enum Anchor {
    None = 0,
    Right = 1,
    Left = 2,
    Top = 3,
    Bottom = 4
}
export interface TooltipControllerInitializationParams {
    /**
     * The root element of the tooltip.
     * This is the element that will be positioned and shown by the tool-tip controller.
     */
    tooltipRootElement: HTMLElement;
    /**
     * The content element of the tooltip.
     * This is the element that will contain the content of the tooltip.
     * It typically should be a child of tooltipRootElement.
     */
    tooltipContentElement: HTMLElement;
    /**
     * The containing element for the tooltip.
     * Usually this is an inner element that is positioned within the safe-margins of the display.
     * If undefined, this element will be the document.body.
     *
     * Setting this value implies `fixedPosition = false`;
     */
    containerElement?: HTMLElement;
    /**
     * The root element to listen to input events on.
     * If not provided, this will be `document.body`.
     */
    inputRootElement?: HTMLElement;
    /**
     * When true, the tooltip will not be repositioned based on the controller.
     * Only the contents of the root and the visibility will be managed.
     *
     * This value is considered false if undefined.
     */
    fixedPosition?: boolean;
    /**
     * The time(ms) to wait before showing the tooltip if it has been hidden.
     * This number must be within the range of 0-10000.  Any other value is considered an error.
     * By default, this value is 0.
     */
    showDelay?: number;
    /**
     * The time(ms) to wait before showing a transitioned tooltip.
     * During a transition, hiding the previous tooltip is immediate, but a delay may be set before showing the next tip.
     * This number must be within the range of 0-10000.  Any other value is considered an error.
     * This value must not be larger than `resetDelay`.
     * By default, this value is 0.
     */
    transitionDelay?: number;
    /**
     * The time(ms) to wait before resetting and no longer treating the following tooltip as a transition.
     * This number must be within the range of 0-10000.  Any other value is considered an error.
     * This value must be greater than or equal to transitionDelay.
     * By default this value is 0.
     */
    resetDelay?: number;
    /**
     * The time(ms) to wait before hiding a tooltip after it has expired.
     * This number must be within the range of 0-10000.  Any other value is considered an error.
     * By default this value is 0.
     */
    expirationDelay?: number;
    /**
     * The horizontal offset for the tooltip when attached to a pointer.
     * Default 0.
     */
    pointerOffsetX?: number;
    /**
     * The vertical offset for the tooltip when attached to a pointer.
     * Default 0.
     */
    pointerOffsetY?: number;
}
export declare class TooltipController {
    private observer;
    private readonly observerConfig;
    private pointerOffsetX;
    private pointerOffsetY;
    private readonly fixedPosition;
    private readonly resetDelay;
    private readonly transitionDelay;
    private readonly expirationDelay;
    private useTransitionDelay;
    /** Timeout handle for when waiting to 'reset' state. */
    private resetTimeout;
    /** Timeout handle for when waiting to 'show' tooltip. */
    private showTimeout;
    /** Timeout handle for when waiting to 'expire' tooltip. */
    private expirationTimeout;
    /** Timeout handle for when waiting to actually hide tooltip. */
    private hideTimeout;
    /** Animation frame handle for when the controller detects mutations in the tool-tip content. Queue a reposition in 2 frames. */
    private mutateRepositionHandle;
    /** Animation frame handle for when the controller is showing a fresh tool-tip.  Delay 2 frames to position properly. */
    private showingHandle;
    private readonly root;
    private readonly content;
    private readonly container;
    private readonly driver;
    private readonly renderer;
    private state;
    private isToggledOn;
    private tooltipX;
    private tooltipY;
    private tooltipContext;
    private tooltipContent;
    private tooltipAlignment;
    private tooltipAnchor;
    get anchor(): Anchor;
    private transitionToShownHandler;
    private resetStateHandler;
    private expirationHandler;
    private repositionFunction;
    private activeDeviceChangeListener;
    private transitionToShown;
    private resetState;
    private expiration;
    constructor(params: TooltipControllerInitializationParams);
    private checkParams;
    connect(): void;
    private onActiveDeviceTypeChanged;
    private onMutate;
    disconnect(): void;
    private setElementToolTipCoords;
    private repositionTooltipElement;
    showTooltipElement(element: HTMLElement, content: string): void;
    showTooltipCoord(x: number, y: number, context: HTMLElement, content: string): void;
    private getAnchorPos;
    private showTooltip;
    hideTooltip(): void;
    expireTooltip(): void;
    toggleTooltip(force?: boolean): void;
    private parseAlignment;
    private parseAnchor;
    private verifyAlignment;
    private reposition;
    private repositionAnchored;
    private constrainTipToRect;
    private checkOverflow;
    private adjustOverflow;
    private setTooltipStyle;
    private immediatelyHideTooltip;
    private immediatelyShowTooltip;
}
export {};
