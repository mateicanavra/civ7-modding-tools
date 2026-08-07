/**
 * Databinding utility functions
 * @copyright 2020-2022, Firaxis Games
 *
 * Helpers for formatting, injecting, and extracting infomation from the databinding attribute.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
/**
 * Packaged a component ID up as a string in a target's attributes.
 * Useful for smuggling an ID across to an async HTML object.
 * @param target
 * @param baseComponentID
 * @param verbose
 */
export declare function databindComponentID(target: HTMLElement, baseComponentID: string, verbose?: boolean): void;
/**
 * @param {HTMLElement} target DOM element that has componentid attribute on it.
 * @returns {ComponentID} The ComponentID set on the element, or InvalidID if missing or poorly formatted.
 */
export declare function databindRetrieveComponentID(target: HTMLElement): ComponentID;
/**
 * @param {HTMLElement} target DOM element that has componentid attribute on it.
 * @returns A serialized version of a componentid or the empty string if none (or poorly formatted.)
 */
export declare function databindRetrieveComponentIDSerial(target: HTMLElement): string;
