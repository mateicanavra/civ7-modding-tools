import { type Component } from "solid-js";
import { type ProductionQueueItem } from "/base-standard/ui-next/screens/city-banners/city-banner-data.js";
export interface CityBannerProductionProps {
    currentProduction: ProductionQueueItem | undefined;
    buildQueue: ProductionQueueItem[];
    turnsLeft: number;
    percent: number;
}
export declare const CityBannerProduction: Component<CityBannerProductionProps>;
