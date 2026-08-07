import { Component } from "solid-js";
import { getFeatureInfo, PlotTooltipConstructibleInfo, PlotTooltipEffectInfo, UnitInfoSectionProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
interface PlotAlertSectionProps {
    plotCoord: float2;
    plotIndex: number;
    feature: ReturnType<typeof getFeatureInfo>;
    plotEffects: PlotTooltipEffectInfo[];
    constructibles: PlotTooltipConstructibleInfo[];
    unitEntries: UnitInfoSectionProps[];
}
/** Alert/notification banner displayed near the top of the tooltip. */
export declare const PlotAlertSection: Component<PlotAlertSectionProps>;
export {};
