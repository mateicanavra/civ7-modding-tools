import { Accessor } from "solid-js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export type Focusable = HTMLElement | FocusContextProvider;
export type FocusNavigationHandler = (context: FocusContextProvider, action: InputNavigationAction) => boolean;
export type FocusEngineInputHandler = (context: FocusContextProvider, event: InputEngineEvent) => boolean;
export type FocusSortOrder = (children: Focusable[]) => void;
export type FocusNavigationRulesMap = Map<InputNavigationAction, (context: FocusContextProvider) => boolean>;
export declare const currentSolidFocus: any;
export declare function buildFocusChain(element: HTMLElement | null, target?: any): any[];
/**
 * A type guard which checks if a Focusable is a FocusContextProvider
 * @param focusable
 * @returns
 */
export declare function isFocusableAFocusContext(focusable: Focusable | undefined): focusable is FocusContextProvider;
/**
 * Gets the DOM element which corresponds to a Focusable
 * @param focusable
 * @returns
 */
export declare function getFocusableElement(focusable: Focusable | undefined): any;
/**
 * Common focus sort orders
 */
export declare const FocusSortOrders: {
    /**
     * The default way to sort focusbles, which sorts by tabIndex.
     * If tabIndex is set to -1, it will be reassigned based on the insertion order into the navigation tree.
     * This should be used for any place where order is relatively static or can be easily calculated
     * @param children The children to sort
     */
    byIndex: (children: HTMLElement[]) => void;
    /**
     * Sorts children by DOM order - this is useful for controls which dynamically add/remove/move child components
     * This is a more expensive operation than index sorting, so it should only be used in dynamic contexts.
     * @param children The children to sort
     */
    byDomOrder: (children: HTMLElement[]) => void;
};
/**
 * A set of simple focus navigation rules
 */
export declare const DefaultNavigationRules: {
    /**
     * Navigates based on up/down input
     */
    vertical: FocusNavigationRulesMap;
    verticalReversed: FocusNavigationRulesMap;
    /**
     * Navigates based on left/right input
     */
    horizontal: FocusNavigationRulesMap;
    horizontalReversed: FocusNavigationRulesMap;
};
export declare const focusableToString: (focusable: Focusable) => string;
/**
 * The FocusContextProvider maintains a live virtual navigation tree used for contoller focus and dispatching navigation and engine events.
 * It is utilized the following components:
 * Panels contain a focus context provider are the top level screen component and handle the interfacing between the legacy UI and UI next.
 * Panels also contain an input proxy which descendants can use to tap into input events that were not already handled.
 * Slots are focus context providers and consumers which are used to organize sub-sections with navigation flows that may differ than the their parent context.
 * Other layouts components (like TabOutput) are specialized versions of slots with their own specific rules.
 * Activatables register themselves with ther containing focus context provider, and are where navigation and engine input events ultimately end up.
 */
export declare class FocusContextProvider {
    private _element;
    private navigationHandler;
    private _contextName;
    private sortChildren;
    private _currentFocusIndex;
    private _setCurrentFocusIndex;
    private _children;
    private _mutateChildren;
    private _hasChildren;
    private _currentFocus;
    /**
     * True if this context has children and false otherwise
     */
    get hasChildren(): Accessor<boolean>;
    /**
     * The sorted, registered children of this component.
     */
    get children(): Accessor<any[]>;
    /**
     * Gets the current index in children that this context is targeting
     * Use tryApplyFocus or trySetFocus to set the current focus index
     */
    get currentFocusIndex(): Accessor<number>;
    /**
     * The current focused element that this context is targeting
     */
    get currentFocus(): Accessor<any>;
    /**
     * Gets the host element
     */
    get element(): any;
    get contextName(): string;
    /**
     *
     * @param _element Constructs a focus context provider
     * @param navigationHandler
     * @param sortChildren
     */
    constructor(_element: Accessor<HTMLElement | undefined>, navigationHandler: FocusNavigationHandler, _contextName: string, sortChildren?: FocusSortOrder);
    /**
     * Registers a focusable as a child of this context
     * Elements which are later disabled, hidden or othewise become not available should be unregistered.
     * @param focusable
     * @returns
     */
    register(focusable: Focusable | undefined): void;
    /**
     * Unregisteres a focusable as a child of this context
     * @param focusable
     * @returns
     */
    unregister(focusable: Focusable | undefined): void;
    /**
     * Propagates navigation events to the registered handler
     * How this is handled is dependent on the component's rules
     * @param action
     * @returns
     */
    navigate(action: InputNavigationAction): boolean;
    trySetFocus(index: number): boolean;
    /**
     * Tries to set focus to a specific index, the applies DOM focus to the element
     * @param index
     * @returns true if the focus application was successful
     */
    private tryApplyFocus;
    /**
     * Reapplies focus to the currently focused child
     * @returns
     */
    focusCurrent(): boolean;
    /**
     * Reapplies focus to the currently focused child
     * @returns
     */
    focusCurrentOrDefault(): boolean;
    /**
     * Attempts to applies focus to the next element
     * @returns true if the focus update was sucessful and false otherwise
     */
    focusNext(): boolean;
    /**
     * Attempts to applies focus to the previous element
     * @returns true if the focus update was sucessful and false otherwise
     */
    focusPrevious(): boolean;
    /**
     * Manually focus a specific child focusable
     *
     * The element or context MUST be a registered child of this context or this will fail.
     *
     * @param focusable The focusable to set focus to, must be a registered child of this context
     * @returns true if the focus update was successful and false otherwise
     */
    focusChild(focusable: Focusable | undefined, applyDomFocus?: boolean): boolean;
    /**
     * Manually focus a specific child descendant
     *
     * The element or context MUST be a registered descendant of this context or this will fail.
     *
     * @param focusable The focusable to set focus to, must be a registered child of this context
     * @returns true if the focus update was successful and false otherwise
     */
    focusDescendant(focusable: Focusable | undefined, applyDomFocus?: boolean): boolean;
    getFocuableChildren(): HTMLElement[];
}
export declare const rootFocus: FocusContextProvider;
export declare const FocusContext: any;
export declare function useFocusContext(): any;
/**
 * A directive which registers a component as Focusable with a parent context
 */
export declare function isFocusable(element: HTMLElement, isFocusable: Accessor<[
    boolean,
    boolean | undefined
]>): void;
export declare function isContextFocusable(element: HTMLElement, args: Accessor<[
    FocusContextProvider,
    boolean,
    boolean | undefined
]>): void;
