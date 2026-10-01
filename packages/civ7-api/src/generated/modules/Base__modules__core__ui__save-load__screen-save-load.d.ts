/**
 * @file screen-save-load.ts
 * @copyright 2021 - 2025, Firaxis Games
 * @description Shell Load Game Menu, manage save games and load into a saved game.
 */
export declare const SaveLoadClosedEventName: "save-load-closed";
declare class SaveLoadClosedEvent extends CustomEvent<never> {
    constructor();
}
declare global {
    interface HTMLElementEventMap {
        [SaveLoadClosedEventName]: SaveLoadClosedEvent;
    }
}
export {};
