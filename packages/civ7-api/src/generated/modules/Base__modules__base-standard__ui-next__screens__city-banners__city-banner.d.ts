import { type CityBannerData } from "/base-standard/ui-next/screens/city-banners/city-banner-data.js";
export interface CityBannerProps {
    /** The component ID of the city this banner represents. */
    cityID: ComponentID;
    /** Overrides the city's plot location when rendering debug banner copies. */
    location?: PlotCoord;
    /**
     * Reactive per-city view-model store owned by `CityBanners`. Each slice is replaced by the
     * specific engine event(s) that affect it
     */
    data: CityBannerData;
}
export declare const CityBanner: any;
