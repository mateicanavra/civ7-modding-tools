/**
 * @file city-selection.ts
 * @copyright 2020-2022, Firaxis Games
 * @description Handles interface mode activation when a city is
 * selected. UI for a selected city is handled in other files
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare namespace City {
    /**
     * Helper, determine if a queue is empty
     * @param {ComponentID} cityID target city.
     * @returns true if queue is empty
     */
    function isQueueEmpty(cityID: ComponentID | null): boolean;
    /**
     * Helper, is this city a "town"
     * @param {ComponentID} cityID to check out.
     * @returns true if city is currently a "town"
     */
    function isTown(cityID: ComponentID | null): boolean;
}
export declare class CitySelection {
    private location;
    constructor();
    onReady(): void;
    /**
     * EVENT: selection has changed for a city in the game
     * @param data
     * @returns
     */
    onCitySelectionChanged(data: CitySelectionChangedData): void;
    /**
     * Select a city.
     * @param {ComponentID} cityID City to be selected
     */
    private doSelect;
    /**
     * Determine if we should switch to INTERFACEMODE_CITY_PROUDCTION based on our
     * current interface mode or stay in the current one
     * @returns {boolean} If yes, we should switch to INTERFACEMODE_CITY_PROUDCTION
     */
    private shouldSwitchToCityView;
    /** Deselect a city */
    private doUnselect;
}
declare const citySelection: CitySelection;
export { citySelection as default };
