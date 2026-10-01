/**
 * @file fxs-scrollable.ts
 * @copyright 2020-2025, Firaxis Games
 * @description UI control for a scrollable area
 */
export declare enum resizeThumb {
    NONE = "0",
    RESIZE = "1"
}
/**
 * ScrollIntoViewEvent is fired when a child element is scrolled into view due to a focus change
 */
export declare class ScrollIntoViewEvent extends CustomEvent<never> {
    constructor();
}
/**
 * ScrollAtBottomEvent is fired when the scrollable area is scrolled to the bottom.
 */
export declare class ScrollAtBottomEvent extends CustomEvent<never> {
    constructor();
}
/**
 * ScrollExitBottomEvent is fired when the scrollable area is no longer at the bottom.
 */
export declare class ScrollExitBottomEvent extends CustomEvent<never> {
    constructor();
}
export declare class FxsScrollable extends Component {
    private static readonly MIN_SIZE_PIXELS;
    private static readonly MIN_SIZE_OVERFLOW;
    private static readonly DECORATION_SIZE;
    /** scrollArea is the container that grows unbounded (important for ResizeObserver) */
    private scrollArea;
    /** scrollAreaContainer is the container that scrolls and is the max height of its parent. */
    private scrollAreaContainer;
    private scrollbarTrack;
    private scrollbarThumb;
    private thumbHighlight;
    private thumbActive;
    private navHelp;
    private isDraggingScroll;
    private isMouseOver;
    private allowScroll;
    private scrollbarPrevVisibility;
    private isHandleGamepadPan;
    private isHandleNavPan;
    private allowMousePan;
    private allowScrollOnResizeWhenBottom;
    private isPanning;
    private gamepadPanAnimationId;
    private gamepadPanY;
    private isStillPanningCheck;
    private lastPanTimestamp;
    private panRate;
    private mouseMoveListener;
    private mouseUpListener;
    private mouseEnterListener;
    private mouseLeaveListener;
    private engineInputListener;
    private engineInputProxyListener;
    private navigationInputListener;
    private scrollBarEngineInputListener;
    private gamepadPanAnimationCallback;
    private resizeObserver;
    private windowEngineInputListener;
    private engineInputProxy;
    private navigationInputProxy?;
    private scrollableAreaSize;
    private scrollableContentSize;
    private thumbRect?;
    private thumbSize;
    private thumbDelta;
    private maxScroll;
    private scrollPosition;
    private maxThumbPosition;
    private thumbScrollPosition;
    private dragInProgress;
    private touchDragY;
    private isScrollAtBottom;
    private get proxyMouse();
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onDetach(): void;
    /**
     * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
     * @param proxy The element to listen to engine input events on
     */
    setEngineInputProxy(proxy: HTMLElement | null): void;
    /**
     * Sets a proxy for navigation input events so they can be listened to without this element being in the focus tree.
     * @param proxy The element to listen to engine input events on
     */
    setNavigationInputProxy(proxy: HTMLElement | null): void;
    private get currentScrollOnScrollAreaInPixels();
    private set currentScrollOnScrollAreaInPixels(value);
    private get maxScrollOnScrollAreaInPixels();
    private get maxScrollTop();
    private getActiveDimension;
    private onResize;
    /**
     * Converts the mouse coordinates to a scroll percentage.
     * @param event
     */
    private mouseCoordinatesToScroll;
    private onWindowEngineInput;
    private onEngineInputProxy;
    private onEngineInput;
    private onNavigationInput;
    private onScrollBarEngineInput;
    /**
     * Attaches all event listeners for the component.
     */
    private attachChildEventListeners;
    /**
     * Shows the scrollbar
     */
    private show;
    /**
     * Hides the scrollbar
     */
    private hide;
    /**
     * On key down we scroll by the needed amount.
     * @param {KeyboardEvent} event
     */
    /** //TODO: When we update action-handler input cascade, we need to actually flow in to the
          scrollables, to be able to scroll when not dependent on focus.  */
    private onMouseMove;
    private onMouseUp;
    private onMouseEnter;
    private onMouseLeave;
    private setIsAttachedLayout;
    /**
     * Scrolls to a given percentage.
     * @param {number} position - Position in percentage - from 0 to 1.
     */
    scrollToPercentage(position: number): void;
    private setScrollThumbPosition;
    scrollIntoView(target: HTMLElement): void;
    /**
     * Resets the styles and thumb delta.
     */
    private reset;
    private setScrollBoundaries;
    private setScrollData;
    /**
     * Resizes the scrollbar thumb
     * @param shouldSetScrollPositionFromLayout
     *
     */
    resizeScrollThumb(): void;
    private onTouchOrMousePan;
    private onGamepadPan;
    stopPanning(): void;
    /**
     * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
     *
     * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
     */
    private onGamepadPanUpdate;
    getIsScrollAtBottom(): boolean;
    private resolveIsScrollAtBottom;
    private showScrollNavHelpElement;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-scrollable": ComponentRoot<FxsScrollable>;
    }
    interface HTMLElementEventMap {
        "scroll-at-bottom": ScrollAtBottomEvent;
        "scroll-exit-bottom": ScrollExitBottomEvent;
    }
}
