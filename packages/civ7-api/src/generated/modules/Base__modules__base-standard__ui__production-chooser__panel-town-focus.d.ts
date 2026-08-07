/**
 * @file town-focus-panel.ts
 * @copyright 2024, Firaxis Games
 * @description slide out panel for selecting town focus
 */
export declare const TownFocusRefreshEventName: "panel-town-focus-refresh";
export declare class TownFocusRefreshEvent extends CustomEvent<never> {
    constructor();
}
declare global {
    interface WindowEventMap {
        "panel-town-focus-refresh": TownFocusRefreshEvent;
    }
}
