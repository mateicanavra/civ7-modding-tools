/**
 * @file placement-city-banner.ts
 * @copyright 2025, Firaxis Games
 * @description Basic city banner used for the placement screens like building placement and city growth
 */
import Panel from "/core/ui/panel-support.js";
export declare const UpdatePlacementCityBannerEventName: "update-placement-city-banner";
export declare class UpdatePlacementCityBannerEvent extends CustomEvent<{
    cityName: string;
}> {
    constructor(cityName: string);
}
declare class PlacementCityBanner extends Panel {
    private cityNameDiv;
    private onUpdatePlacementCityBannerListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private render;
    private updateCityName;
    private onUpdatePlacementCityBanner;
}
declare global {
    interface HTMLElementTagNameMap {
        "placement-city-banner": ComponentRoot<PlacementCityBanner>;
    }
    interface WindowEventMap {
        [UpdatePlacementCityBannerEventName]: UpdatePlacementCityBannerEvent;
    }
}
export {};
