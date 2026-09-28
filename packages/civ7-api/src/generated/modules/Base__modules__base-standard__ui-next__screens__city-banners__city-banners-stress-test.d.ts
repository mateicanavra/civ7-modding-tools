import { Component } from "solid-js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { type CityBannerData } from "/base-standard/ui-next/screens/city-banners/city-banner-data.js";
export interface CityBannersStressTestProps {
    cityIds: readonly ComponentID[];
    getBannerData: (cityID: ComponentID) => CityBannerData | undefined;
}
/** Renders duplicate city banners used by the city-banner profiling debug widget. */
export declare const CityBannersStressTest: Component<CityBannersStressTestProps>;
