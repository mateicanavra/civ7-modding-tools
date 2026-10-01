/**
 * @file fxs-scrollable-horizontal.ts
 * @copyright 2020-2025, Firaxis Games
 * @description UI control for a scrollable area
 */
export declare class FxsScrollableHorizontal extends Component {
    private static readonly MIN_SIZE_PIXELS;
    private static readonly MIN_SIZE_OVERFLOW;
    private static readonly DECORATION_SIZE;
    private scrollArea;
    private scrollAreaContainer;
    private scrollbarTrack;
    private scrollbarThumb;
    private scrollBarContainer;
    private thumbActive;
    private navHelp;
    private isDraggingScroll;
    private isMouseOver;
    private isPanning;
    private gamepadPanX;
    private gamepadPanAnimationId;
    private allowScroll;
    private scrollbarPrevVisibility;
    private isHandleGamepadPan;
    private allowMousePan;
    private lastPanTimestamp;
    private panRate;
    private mouseMoveListener;
    private mouseUpListener;
    private mouseEnterListener;
    private mouseLeaveListener;
    private engineInputListener;
    private gamepadPanAnimationCallback;
    private scrollBarEngineInputListener;
    private resizeObserver;
    private windowEngineInputListener;
    private engineInputProxy?;
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
    private touchDragX;
    private isScrollAtEnd;
    private get maxScrollLeft();
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onDetach(): void;
    /**
     * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
     * @param proxy The element to listen to engine input events on
     */
    setEngineInputProxy(proxy: HTMLElement): void;
    private get currentScrollOnScrollAreaInPixels();
    private set currentScrollOnScrollAreaInPixels(value);
    private get maxScrollOnScrollAreaInPixels();
    private getActiveDimension;
    private onResize;
    /**
     * Converts the mouse coordinates to a scroll percentage.
     * @param event
     */
    private mouseCoordinatesToScroll;
    private onWindowEngineInput;
    private onEngineInput;
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
     */
    resizeScrollThumb(): void;
    private onTouchOrMousePan;
    private onGamepadPan;
    /**
     * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
     *
     * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
     */
    private onGamepadPanUpdate;
    private onScrollBarEngineInput;
    getIsScrollAtEnd(): boolean;
    stopPanning(): void;
    private resolveIsScrollAtEnd;
    private showScrollNavHelpElement;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-scrollable-horizontal": ComponentRoot<FxsScrollableHorizontal>;
    }
}
