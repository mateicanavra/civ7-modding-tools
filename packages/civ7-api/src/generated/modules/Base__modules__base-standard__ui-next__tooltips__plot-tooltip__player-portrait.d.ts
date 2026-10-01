import { Component } from "solid-js";
export interface LeaderTileData {
    leaderId: number;
    size: number;
    cityId?: ComponentID;
    representsCityState?: boolean;
    showBanner?: boolean;
}
export declare const PlotTooltipPlayerPortrait: Component<LeaderTileData>;
