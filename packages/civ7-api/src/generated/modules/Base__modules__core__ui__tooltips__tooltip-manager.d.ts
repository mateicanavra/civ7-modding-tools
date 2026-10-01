/**
 * @file Tooltip Manager
 * @copyright 2020-2024, Firaxis Games
 * @description Handles the tooltips for the world (plots), and 2D UI pieces.
 */
import { IEngineInputHandler, InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
export interface TooltipType<T extends HTMLElement | PlotCoord = HTMLElement> {
    /** Obtain the (top) HTML element associated with this tooltip's type. */
    getHTML(): ComponentRoot<Tooltip>;
    /** Called when tooltip is about to be (re-)used with a new tooltip. */
    reset(): void;
    /** Does an update need to occur; side-effects may happen in here. */
    isUpdateNeeded(target: T): boolean;
    /** Perform update of toolip. */
    update(): void;
    /** Is contents of the tooltip blank? */
    isBlank(): boolean;
}
export declare class HidePlotTooltipEvent extends CustomEvent<void> {
    constructor();
}
export declare class ShowPlotTooltipEvent extends CustomEvent<void> {
    constructor();
}
declare class TooltipManagerSingleton implements IEngineInputHandler {
    private static Instance;
    private timeShowStart;
    private isShownByTimeout;
    private isToggledOn;
    private currentIsToggleOn;
    private isAnimating;
    private ttTypeName;
    private x;
    private y;
    private readonly root;
    private _tooltip;
    private get tooltip();
    private set tooltip(value);
    private types;
    private closeOnNextMove;
    private plotTooltipGlobalHidden;
    private plotTooltipTutorialHidden;
    private touchPosition;
    private touchTarget;
    private tooltipResizeObserver;
    private tooltipsDisabled;
    private disabledPlaceholder;
    private cameraWasDragging;
    private globalPlotTooltipHideListener;
    private globalPlotTooltipShowListener;
    private tooltipAnimationListener;
    private constructor();
    get currentTooltip(): HTMLElement | null;
    /**
     * Singleton accessor
     */
    static getInstance(): TooltipManagerSingleton;
    onReady(): void;
    private reset;
    handleInput(inputEvent: InputEngineEvent): boolean;
    handleNavigation(_navigationEvent: NavigateInputEvent): boolean;
    private onEngineInput;
    private hideTooltips;
    private fadeIn;
    private onMouseDragStart;
    private onMouseDragEnd;
    /** Input has switch to gamepad or kbm */
    private onActiveDeviceTypeChanged;
    /**
     * Per-frame check if tooltip needs update.
     */
    private onUpdate;
    private getAnchorPos;
    /**
     * Performs the checks necessary to set a new tooltip.
     */
    private cursorTooltipCheck;
    private onGlobalPlotTooltipHide;
    private onGlobalPlotTooltipShow;
    /**
     * Register a tooltip style type that can accept an html element.
     * @param type Name of the tooltip style type.
     * @param tooltipInstance Instance of type to use when that style if found. (Instance is recycled for each tooltip of that type.)
     */
    registerType(type: string, tooltipInstance: TooltipType<HTMLElement>): void;
    private setLocation;
    private updateTooltipPosition;
    private onTooltipAnimationFinished;
}
export declare class Tooltip extends Component {
    private shortDelayThreshold;
    onInitialize(): void;
    protected getSoundTags(): void;
}
declare const TooltipManager: TooltipManagerSingleton;
export { TooltipManager as default };
declare global {
    interface HTMLElementTagNameMap {
        "fxs-tooltip": ComponentRoot<Tooltip>;
    }
    interface WindowEventMap {
        "ui-hide-plot-tooltips": HidePlotTooltipEvent;
        "ui-show-plot-tooltips": ShowPlotTooltipEvent;
    }
}
