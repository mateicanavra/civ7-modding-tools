/**
 * @file navigation-handlers.ts
 * @copyright 2022, Firaxis Games
 * @description Handler functions for various navigation rules
 */
import { Navigation } from "/core/ui/input/navigation-support.js";
export declare namespace NavigationHandlers {
    /**
     * Ignore the input and keep it live.
     * @returns Always returns true, that the input is still live.
     */
    function handlerIgnore(): boolean;
    /**
     * Ignore the input and prevent it from propagating.
     * @returns Always returns false, that the input is always consumed.
     */
    function handlerStop(): boolean;
    function handlerEscapeNext(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerStopNext(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerWrapNext(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerEscapePrevious(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerStopPrevious(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerWrapPrevious(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerEscapeSpatial(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
    function handlerWrapSpatial(_focusElement: HTMLElement, _props: Readonly<Navigation.Properties>): boolean;
    function handlerStopSpatial(focusElement: HTMLElement, props: Readonly<Navigation.Properties>): boolean;
}
