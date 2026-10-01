/**
 * @file stateful-icon.ts
 * @copyright 2024, Firaxis Games
 * @description Utilities for creating a stateful icon from a set of icons, where each icon represents a different state of interaction.
 */
export type URLMap = {
    [IconState.Default]: string;
} & Partial<Record<Exclude<IconState, IconState.Default>, string>>;
export declare enum IconState {
    Default = "default",
    Hover = "hover",
    Focus = "focus",
    Active = "active",
    Disabled = "disabled",
    Pressed = "pressed"
}
export declare const AttributeNames: any;
export interface InitParams<S extends IconState> {
    root?: HTMLElement;
    iconStateUrlMap: Record<S, string>;
    /**
     * noGroupClass will create the icon group without applying the '.group' class to the root element.
     * This is useful when you want to apply the group class to an ancestor higher up the tree.
     */
    noGroupClass?: boolean;
}
/**
 * Controller is a class that manages the state of an icon group.
 *
 * It allows you to force the icon group into a specific state.
 */
export declare class Controller<S extends IconState = IconState> {
    readonly elements: Record<S, HTMLImageElement>;
    /** disabled is a convenience method of setting  */
    set disabled(value: boolean);
    set state(value: IconState);
    constructor(elements: Record<S, HTMLImageElement>);
    /** isValidState validates that the icon group has an icon for this group */
    isValidState(state: unknown): state is S;
}
/**
 * Init initializes an icon group using an optional root element where each icon is a different state of the same icon.
 *
 * @returns a tuple containing the root element and the controller for the icon group
 */
export declare const Init: <S extends IconState>({ root, iconStateUrlMap, noGroupClass, }: InitParams<S>) => [
    HTMLElement,
    Controller<S>
];
/**
 * FromElement initializes an icon group based on the attributes of an existing element.
 *
 * @param element the element to use as the root of the icon group
 * @param noGroupClass will create the icon group without applying the '.group' class to the root element.
 *
 * @returns a tuple containing the root element and the controller for the icon group
 */
export declare const FromElement: (element: HTMLElement, noGroupClass?: boolean) => [
    HTMLElement,
    Controller<IconState>
];
/**
 * UrlMapFromElementAttributes extracts the icon URLs from the attributes of an element.
 *
 * The URLs are expected to be stored in the following attributes:
 * - data-icon: the base icon
 * - data-icon-hover: the icon when hovered
 * - data-icon-focus: the icon when focused
 * - data-icon-active: the icon when active
 * - data-icon-disabled: the icon when disabled
 *
 * @param element the element to extract the icon URLs from
 *
 * @returns a URLMap containing the URLs for each state of the icon
 */
export declare const UrlMapFromElementAttributes: (element: HTMLElement) => any;
/**
 * SetAttributes sets the icon URLs on an element based on the given URLMap.
 *
 * @param element the element to set the icon URLs on
 * @param stateUrlMap the string for the base icon state or URLMap containing the URLs for each state of the icon
 */
export declare const SetAttributes: (element: HTMLElement, stateUrlMap: string | URLMap) => void;
