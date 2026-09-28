import { type Component } from "solid-js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export interface CityBannerPopulationProps {
    /** The city this population ring represents, or `null` while the banner is still initializing. */
    cityID: ComponentID | null;
    population: number;
    currentFood: number;
    foodPerTurn: number;
    canGrow: boolean;
}
export declare const CityBannerPopulation: Component<CityBannerPopulationProps>;
