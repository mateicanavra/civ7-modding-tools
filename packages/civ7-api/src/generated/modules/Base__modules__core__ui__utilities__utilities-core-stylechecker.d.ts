/**
 * Utility functions to help with computed style checks on elements
 * @copyright 2020-2022, Firaxis Games
 *
 */
/**
 * Checks an element's style property and waits until it equals a target value to return true, or returns false after 3 frames
 * @param element The target element that will have its style checked.
 * @param property The name of the property to check.
 * @param target The target value the element's property should equal before continuing
 */
export declare function waitForElementStyle(element: Element, property: string, target: number): Promise<boolean>;
