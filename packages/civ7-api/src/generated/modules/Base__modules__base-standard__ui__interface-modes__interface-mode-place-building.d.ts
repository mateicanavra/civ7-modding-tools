/**
 * @file interface-mode-place-buildings.ts
 * @copyright 2021-2023, Firaxis Games
 * @description Interface mode when the player wants to place a building in a city
 */
export declare const TogglePlacementMinMaxEventName: "toggle-placement-min-max";
export declare class TogglePlacementMinMaxEvent extends CustomEvent<never> {
    constructor();
}
