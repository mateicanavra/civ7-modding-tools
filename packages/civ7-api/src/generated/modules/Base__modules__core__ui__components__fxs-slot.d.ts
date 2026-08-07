/**
 * @file fxs-slot.ts
 * @copyright 2020-2021, Firaxis Games
 * @description Components that specialize in containment and grouping of other components.
 *
 * TODO: Use mutation observer to set new initialFocus if the initialFocus item is removed.
 */
import { Navigation, NavigationRule } from "/core/ui/input/navigation-support.js";
/**
 * A base slot element.
 */
export declare class FxsSlot extends Component {
    protected static ruleDirectionCallbackMapping: Navigation.RuleDirectionCallbackMap;
    protected rules: any;
    private navigateInputListener;
    private focusListener;
    private focusOutListener;
    private continuousCheckForInitialFocusHelpCallback;
    private observer;
    protected isDisableFocusAllowed: boolean;
    protected initialFocus: Element | null;
    protected priorFocus: Element | null;
    private numberOfFramesWithoutChildFocus;
    private lastEventTimeStamp;
    private repeatThreshold;
    private static readonly INITIAL_THRESHOLD;
    private static readonly REPEAT_THRESHOLD;
    private static readonly NO_FOCUS_FRAMES_WARNING_THRESHOLD;
    protected focusManager: any;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    /**
     * Component Callback
     * @param name
     * @param _oldValue
     * @param newValue
     */
    onAttributeChanged(name: string, _oldValue: string, value: any): void;
    /**
     * Set a navigation rule in the slot from code.
     * @param {InputNavigationAction} direction to associate with a new rule (overrides the default rule)
     * @param {NavigationRule} rule to associate with the navigation action
     */
    setRule(direction: InputNavigationAction, rule: NavigationRule): void;
    /**
     * Sets the initial focus of the slot
     * @param focusTarget The target to set as initial focus
     */
    setInitialFocus(focusTarget: Element | null): void;
    /**
     * Set the default rules for the slot.
     * If an attribute in the HTML or DOM is set, override to use that rule.
     */
    protected readRules(): void;
    /**
     * Helper, convert a rule name to it's enumeration.
     * @param {string} name The rule name, can be case-insensative.
     * @returns {NavigationRule} the associated navigation rule enum for the name.  Unknown names will return the invalid rule.
     */
    protected ruleNameToRule(name: string): NavigationRule;
    /**
     * Set the initial focus on the first or last focusable element
     */
    private realizeInitialFocus;
    private continuousCheckForInitialFocus;
    private continuousCheckForInitialFocusHelper;
    /**
     * Respond to being directly set to focus.
     */
    protected onFocus(): void;
    /**
     * Respond to losing focus.
     * Use this over 'blur' as this will occur before the old focus is lost.
     * @param event The focusout bubbles and needs to be stopped.
     */
    protected onFocusOut(event: FocusEvent): void;
    private onChildrenChanged;
    private onNavigateInput;
    private navigate;
    private resetRepeatThreshold;
    /**
     * Handle an input navigation event but obtain the appropriate focus chain item
     * and apply the rules set to the navigation direction in how the next item
     * receives focus.
     * @param navigationEvent
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    /**
     * Returns the static list of rule mapping for this type.
     * @returns
     */
    protected getRulesMap(): Navigation.RuleDirectionCallbackMap;
    /**
     * Look up the associated callback for a give rule and direction.
     * This traverse the map of maps of the callbacks.
     * @param rule
     * @param direction
     * @returns Assigned callback based on the Navigation rule and direction or if unfound, a callback that ignores the input.
     */
    private getNavigationHandler;
}
export declare function isSlot(slot: Element | null): slot is ComponentRoot<FxsSlot>;
/**
 * A vertical slot element.
 */
export declare class FxsVSlot extends FxsSlot {
    protected static ruleDirectionCallbackMapping: Navigation.RuleDirectionCallbackMap;
    /**
     * Returns the static list of rule mapping for this type.
     * @returns
     */
    protected getRulesMap(): Navigation.RuleDirectionCallbackMap;
}
/**
 * A horizontal slot element.
 */
export declare class FxsHSlot extends FxsSlot {
    protected static ruleDirectionCallbackMapping: Navigation.RuleDirectionCallbackMap;
    /**
     * Returns the static list of rule mapping for this type.
     * @returns
     */
    protected getRulesMap(): Navigation.RuleDirectionCallbackMap;
}
/**
 * A left side panel slot element.
 */
export declare class FxsSidePanel extends FxsSlot {
    private visibleChildren;
    private onChildHiddenListener;
    private onChildShownListener;
    onAttach(): void;
    onDetach(): void;
    onChildHidden(event: CustomEvent): void;
    onChildShown(event: CustomEvent): void;
    clearModifiers(): void;
}
/**
 * A slot element designed to use spatial navigation
 */
export declare class FxsSpatialSlot extends FxsSlot {
    protected static ruleDirectionCallbackMapping: Navigation.RuleDirectionCallbackMap;
    private static sectionCount;
    private static sectionIdPrefix;
    private static sectionIdPool;
    private snUnfocusedListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private static getSectionIdFromPool;
    private static removeSectionIdFromPool;
    private onElementUnfocused;
    /**
     * Returns the static list of rule mapping for this type.
     * @returns
     */
    protected getRulesMap(): Navigation.RuleDirectionCallbackMap;
}
/**
 * A component that groups multiple `fxs-slot` elements and allows switching between them by setting the `selected-slot` attribute.
 *
 * @remarks
 *
 * The `FxsSlotGroup` component must have at least one child `fxs-slot` element. If no `selected-slot` attribute is set on the `FxsSlotGroup`, the first child `fxs-slot` element will be selected by default.
 *
 * To switch between `fxs-slot` elements, set the `selected-slot` attribute on the `FxsSlotGroup` to the ID of the desired `fxs-slot` element.
 *
 * Example usage:
 *
 * ```html
 * <fxs-slot-group selected-slot="slot1">
 *   <fxs-slot id="slot1">...</fxs-slot>
 *   <fxs-slot id="slot2">...</fxs-slot>
 * </fxs-slot-group>
 * ```
 */
export declare class FxsSlotGroup extends FxsSlot {
    private mutationObserver;
    private receivedFocus;
    onAttach(): void;
    onDetach(): void;
    onMutationObserved(_records: MutationRecord[]): void;
    onReceiveFocus(): void;
    setSelectedSlot(id: string | null): void;
    onAttributeChanged(name: string, oldValue: string, newValue: string | null): void;
    protected onFocus(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-slot": ComponentRoot<FxsSlot>;
        "fxs-vslot": ComponentRoot<FxsVSlot>;
        "fxs-hslot": ComponentRoot<FxsHSlot>;
        "fxs-side-panel": ComponentRoot<FxsSidePanel>;
        "fxs-spatial-slot": ComponentRoot<FxsSpatialSlot>;
        "fxs-slot-group": ComponentRoot<FxsSlotGroup>;
    }
}
