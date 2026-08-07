/**
 * @file view-manager.ts
 * @copyright 2021-2023, Firaxis Games
 * @description Tracks the "view" while in game.
 */
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
export type ViewCallback = () => void;
export declare enum UISystem {
    HUD = 0,
    World = 1,
    Lens = 2,
    Events = 3,
    Unset = 4
}
export declare enum SwitchViewResult {
    Error = 0,
    NothingChanged = 1,
    ChangesApplied = 2
}
/**
 * @property {string} name of the UI components/sub-system to be affected
 * @property {UISystem} type the related user-interface system
 * @property {string} visible if the UI components/sub-system are visible during this time
 * @property {boolean} selectable can items be selected.
 */
export type ViewRules = {
    name: string;
    type: UISystem;
    visible?: string;
    selectable?: boolean;
} & ({
    visible: string;
} | {
    selectable: boolean;
});
/**
 * A "view" of the game
 */
export interface IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(func: ViewCallback): void;
    addExitCallback(func: ViewCallback): void;
    getRules(): ViewRules[];
    readInputEvent?(inputEvent: InputEngineEvent): boolean;
    /**
     * (optional) Handle a navigation request
     * @returns true if still live, false if input should stop.
     */
    handleNavigation?(navigationEvent: NavigateInputEvent): boolean;
    handleReceiveFocus?(): void;
    handleLoseFocus?(): void;
}
/**
 * Single class to manage the current view and signal view changes.
 * Views can either be passed as new objects or used from a pool of views added earlier and references by name.
 */
declare class ViewManagerSingleton {
    private _current;
    private _last;
    private views;
    private isHarnessHidden;
    private ruleStates;
    private currentViewID;
    private _isWorldInputAllowed;
    private _isViewInputAllowed;
    private harness;
    private get viewHasFocus();
    /**
     * Set the current view either by object interface.
     */
    set current(view: IGameView);
    get current(): IGameView;
    get last(): IGameView;
    private observerCallback;
    private observer;
    constructor();
    /**
     * Track if children are added (and removed) so a signal can be sent out
     * when a new DOM is loaded.
     */
    private onChildrenChanged;
    private applyRules;
    /**
     * Help API to set the current view by view name in the pool.
     * @param {string} viewName The name of view that has been added to the pool.
     * @returns true if successful.
     */
    setCurrentByName(viewName: string): boolean;
    /**
     * Add a view to the pool.
     * @param {IGameView} view The view to add to the pool.
     */
    addHandler(view: IGameView): void;
    isValid(view: IGameView): boolean;
    /**
     * Obtain a rule (within the view) for a given name.
     * @param name of the rule
     * @param last optional flag to search in the last set view
     */
    private getRule;
    /**
     * Should unit selection be listened to in this view?
     * @returns true if should, false otherwise
     */
    get isUnitSelectingAllowed(): boolean;
    /**
     * Should city selection be listened to in this view?
     * @returns true if should, false otherwise
     */
    get isCitySelectingAllowed(): boolean;
    /**
     * Should world selection be listened to in this view?
     * @returns true if should, false otherwise
     */
    get isWorldSelectingAllowed(): boolean;
    /**
     * Should other world input (zooming, panning, rotating) be listened to in this view or context?
     * @returns true if should, false otherwise
     */
    get isWorldInputAllowed(): boolean;
    /**
     * Turns on/off selection, camera panning and camera zoom.
     */
    set isWorldInputAllowed(state: boolean);
    /**
     * Should view input (focus, navigation) be listened to in this view?
     * @returns true if should, false otherwise
     */
    get isViewInputAllowed(): boolean;
    /**
     * Turns on/off focus in view.
     */
    set isViewInputAllowed(state: boolean);
    /**
     * Turns on/off just zoom.
     */
    set isWorldZoomAllowed(state: boolean);
    /**
     * Should radial selection be allowed in this view?
     * @returns true if should, false otherwise
     */
    get isRadialSelectionAllowed(): boolean;
    /**
     * Should small narratives be allowed in this view?
     * @returns true if should, false otherwise
     */
    get areSmallNarrativesAllowed(): boolean;
    /**
     * If the current view handles input, let it inspect an engine input event.
     * @param {InputEngineEvent} inputEvent An input event
     * @returns true if the input is still "live" and not yet cancelled.
     */
    handleInput(inputEvent: InputEngineEvent): boolean;
    /**
     * Obtain the active view's harness DOM element.
     * @returns the HTMLElement for the harness element or null if unable to be found.
     */
    getHarness(): HTMLElement | null;
    /**
     * Handle navigation input.
     * @param {NavigateInputEvent} navigationEvent
     * @returns true if still live, false if input should stop.
     * @implements NavigateInputEvent
     */
    handleNavigation(navigationEvent: NavigateInputEvent): boolean;
    handleReceiveFocus(): void;
    handleLoseFocus(): void;
    private getSlotByAnchors;
    /**
     * Obtains an anchor in the harness based on the current anchor an a navigation direction.
     * @param {InputNavigationAction} navigationAction The direction of navigation
     * @param {AnchorType} currentAnchor The current anchor
     * @returns {AnchorType} New anchor (or AnchorType.None if invalid)
     */
    private getNextAnchorFromDirection;
    /**
     * Find the anchorType based on classes.
     * @param classes list of classes used on a DOM Token
     * @returns The appropriate AnchorType based on the classes list or None if it cannot be determined.
     */
    private classesToAnchor;
    /**
     * Hides the 2D harness if it isn't hidden.
     */
    private hideHarness;
    /**
     * Shows the 2D harness if it isn't visible.
     */
    private showHarness;
    /**
     * Replaces the existing view with the one provided by the template.
     * @param viewID The new view ID being switched.
     * @param template A template element on the DOM
     * @returns true if the layout has been changed
     */
    loadViewTemplate(viewID: string, template: HTMLTemplateElement): boolean;
    /**
     * Switch to another view
     * @param viewID which view to switch to
     * Simple helper function to switch to the active layout in the requested view
     * ***Should only be called from view files***
     */
    switchView(viewID: string, selector?: string): SwitchViewResult;
    /**
     * Switch to the empty layout.
     */
    switchToEmptyView(): SwitchViewResult;
}
declare const ViewManager: ViewManagerSingleton;
export { ViewManager as default };
