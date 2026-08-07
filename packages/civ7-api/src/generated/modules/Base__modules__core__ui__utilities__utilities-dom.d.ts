/**
 * @file utilities-dom.ts
 * @copyright 2023, Firaxis Games
 * @description Utilties for working with DOM elements
 */
export declare const MAX_UI_SCALE = 200;
export declare const MIN_UI_SCALE = 50;
export declare enum FontScale {
    XSmall = 0,
    Small = 1,
    Medium = 2,
    Large = 3,
    XLarge = 4
}
export type ElementTableInit = Record<string, string>;
export type ElementTable<U extends string> = Readonly<Record<U, HTMLElement>>;
/**
 * CreateElementTable returns a table of elements that lazily evaluates selectors and caches the retrieved elements via get/set.
 *
 * @description for each kvp in init, create two properties on the returned object:
 * 1. An underscore-prefixed field that holds the element. Undefined until the getter is called. Null if the element is not found.
 * 2. A non-prefixed field with a getter and setter. The getter will return the element if it exists, or invoke the setter to query for the element.
 *
 *
 * @param root root element to use for looking up selectors
 * @param init object of kvp's where the key is the name of the element and the value is the selector
 */
export declare const CreateElementTable: <T extends ElementTableInit>(root: HTMLElement, init: T) => ElementTable<Extract<keyof T, string>>;
/**
 * Creates a string representation of an element that can be used for debugging.
 */
export declare const ElementToDebugString: (element: Element) => string;
interface MustGetElementFunction {
    <K extends keyof HTMLElementTagNameMap>(selectors: K, element: HTMLElement | Document): HTMLElementTagNameMap[K];
    <K extends keyof SVGElementTagNameMap>(selectors: K, element: HTMLElement | Document): SVGElementTagNameMap[K];
    <K extends keyof MathMLElementTagNameMap>(selectors: K, element: HTMLElement | Document): MathMLElementTagNameMap[K];
    <E extends HTMLElement = HTMLElement>(selectors: string, element: HTMLElement | Document): E;
}
/**
 * MustGetElement queries for the element and throws an error if it is not found.
 *
 * @param selector selector to query for
 * @param element optional root element to use for the query. Defaults to document.
 */
export declare const MustGetElement: MustGetElementFunction;
/**
 * MustGetElements queries for all elements and throws an error if it is not found.
 *
 * @param selector selector to query for
 * @param element optional root element to use for the query. Defaults to document.
 */
export declare const MustGetElements: <T extends HTMLElement>(selector: string, element: HTMLElement | Document) => NodeListOf<T>;
/**
 * RecursiveGetAttribute retrieves an attribute from an element or its parent recursively.
 *
 * @param target element to start the search from
 * @param attr attribute to retrieve
 */
export declare const RecursiveGetAttribute: (target: HTMLElement | null, attr: string) => string | null;
/**
 * IsElement is a type guard for checking if an element is of a specific tag name
 *
 * @example
 * if (IsElement(element, 'fxs-button')) {
 *   element; // element is inferred as ComponentRoot<FxsButton>
 * }
 * @param element element to check
 * @param tagName tag name to compare against
 */
export declare const IsElement: <TagName extends keyof HTMLElementTagNameMap>(element: unknown, tagName: TagName) => element is HTMLElementTagNameMap[TagName];
/**
 * PassThroughAttributes sets the attributes of element a on element b.
 */
export declare const PassThroughAttributes: (a: HTMLElement, b: HTMLElement, ...attributes: string[]) => void;
export {};
