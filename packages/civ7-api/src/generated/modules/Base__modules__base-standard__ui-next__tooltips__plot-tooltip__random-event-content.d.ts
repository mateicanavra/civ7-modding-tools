/**
 * random-event-plot-tooltip-content.tsx
 * @copyright 2025, Firaxis Games
 * @description Solid.js content component for the random event plot tooltip.
 * Shows random event information when the settler lens is active.
 */
import { type Component } from "solid-js";
import { type PlotRandomEventData } from "/base-standard/ui/lenses/layer/random-events-layer.js";
import { type PlotTooltipBaseProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
/** Props for the RandomEventPlotTooltipContent component */
export type RandomEventPlotTooltipContentProps = PlotTooltipBaseProps;
/**
 * Gets the random event data and resolved UI definition for the given plot coordinates.
 * Returns undefined if no valid random event data is available.
 */
export declare function getRandomEventInfo(plotCoord: float2): {
    randomEvent: PlotRandomEventData;
    eventData: RandomEventUIDefinition;
} | undefined;
/**
 * Determines whether the random event tooltip has content to show at the given plot coordinates.
 */
export declare function hasRandomEventData(plotCoord: float2): boolean;
/**
 * Content component for the random event plot tooltip.
 * TODO: Implement the full content rendering.
 */
export declare const RandomEventPlotTooltipContent: Component<RandomEventPlotTooltipContentProps>;
