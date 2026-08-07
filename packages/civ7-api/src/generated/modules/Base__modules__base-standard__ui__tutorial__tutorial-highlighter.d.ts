/**
 * @file tutorial-highlighter
 * @copyright 2022, Firaxis Games
 * @description Tutorial highlight classes & functions
 *
 */
export declare namespace Tutorial {
    type HighlightFunc = (element: HTMLElement) => void;
    function highlightElement(element: HTMLElement): void;
    function unhighlightElement(element: HTMLElement): void;
}
