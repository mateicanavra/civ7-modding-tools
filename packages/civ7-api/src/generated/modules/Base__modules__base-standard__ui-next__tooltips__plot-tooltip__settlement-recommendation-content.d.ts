/**
 * settlement-recommendation-plot-tooltip-content.tsx
 * @copyright 2025, Firaxis Games
 * @description Solid.js content component for the settlement recommendation plot tooltip.
 * Shows why a plot is recommended for settlement when the settler lens is active.
 */
import { type Component } from "solid-js";
import { type PlotTooltipBaseProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
/** Props for the SettlementRecommendationPlotTooltipContent component */
export type SettlementRecommendationPlotTooltipContentProps = PlotTooltipBaseProps;
/**
 * Determines whether the settlement recommendation tooltip has content to show at the given plot coordinates.
 */
export declare function hasSettlementRecommendationData(plotCoord: float2): boolean;
/**
 * Gets the settlement recommendation result for the given plot coordinates.
 */
export declare function getSettlementRecommendationData(plotCoord: float2): GetBestSettleLocationsResult | undefined;
/**
 * Content component for the settlement recommendation plot tooltip.
 * TODO: Implement the full content rendering.
 */
export declare const SettlementRecommendationPlotTooltipContent: Component<SettlementRecommendationPlotTooltipContentProps>;
