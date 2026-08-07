/**
 * @file navigation-support.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Support to navigate between items (with a gamepad/keyboards)
 */
export interface NavLink {
    Up?: HTMLElement | null;
    Down?: HTMLElement | null;
    Left?: HTMLElement | null;
    Right?: HTMLElement | null;
}
export declare enum NavigationRule {
    Escape = 0,
    Wrap = 1,
    Stop = 2,
    Invalid = 3
}
export declare namespace Navigation {
    class Properties {
        isDisableFocusAllowed: boolean;
        direction: InputNavigationAction;
    }
    type RuleDirectionCallback = (focus: HTMLElement, props: Readonly<Properties>) => boolean;
    type RuleDirectionCallbackMap = Map<InputNavigationAction, Map<NavigationRule, RuleDirectionCallback>>;
    /**
     * Helper: Determine if the element passed in is focusable
     * @param element Element to check for focusability
     * @param {Properties} props Properties that may determine if the element is focusable
     * @returns True if the element can be focused
     */
    function isFocusable(element: Element, props?: Readonly<Properties>): boolean;
    /**
     * Check if the children of this element should be checked for focusability
     * @param element Parent element
     */
    function shouldCheckChildrenFocusable(element: Element): boolean;
    /**
     * Helper: get next element that is focusable.
     * @param element Current element to key off of.
     * @param {Properties} props Properties that may change how navigation should occur.
     * @returns The next element in the DOM if one exists that can be focused, otherwise null.
     */
    function getNextFocusableElement(element: Element, props: Readonly<Properties>): Element | null;
    /**
     * Helper: get previous element that is focusable.
     * @param element Current element to key off of.
     * @param {Properties} props Properties that may change how navigation should occur.
     * @returns The previous element in the DOM if one exists that can be focused, otherwise null.
     */
    function getPreviousFocusableElement(element: Element, props: Readonly<Properties>): Element | null;
    /**
     * Get the first focusable element starting from the first element and down the hierarchy
     * @param parent: Parent Element from where to start the research.
     * @param {Properties} props: Properties that may change how navigation should occur.
     * @return The first focusable Element starting from the first element and down the hierarchy. If one exists, otherwise null.
     */
    function getFirstFocusableElement(parent: Element, props: Readonly<Properties>): Element | null;
    /**
     * Get the first focusable element starting from the last element and up the hierarchy
     * @param parent: Parent Element from where to start the research.
     * @param {Properties} props: Properties that may change how navigation should occur.
     * @return The first focusable element starting from the last element and up the hierarchy. If one exists, otherwise null.
     */
    function getLastFocusableElement(parent: Element, props: Readonly<Properties>): Element | null;
    /**
     * Get the parent slot of a given node.
     * @param child Child Node from where to start the research.
     * @returns the closer parent that has a tabindex aka the parent slot.
     */
    function getParentSlot(child: Node): HTMLElement | null;
    /**
     * Get the first level of children that are focusable.
     * It will not return deeper levels since they could have their own way to navigate.
     * @param parent Parent Element from where to start the search.
     * @param {Properties} props: Properties that may change how navigation should occur.
     * @returns the closest children that are focusable.
     */
    function getFocusableChildren(parent: Element, props: Readonly<Properties>): Element[];
}
