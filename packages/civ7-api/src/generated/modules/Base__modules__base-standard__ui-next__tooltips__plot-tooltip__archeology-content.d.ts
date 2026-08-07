/**
 * archeology-plot-tooltip-content.tsx
 * @copyright 2025, Firaxis Games
 * @description Solid.js content component for the archeology plot tooltip.
 * Shows the status of archeology at a location when the continent lens is active.
 */
import { type Component } from "solid-js";
import { type PlotTooltipBaseProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
interface ArcheologyTooltipData {
    titleText: string;
    descriptionText: string;
}
/**
 * Gets the archeology tooltip display data for the given plot coordinates.
 */
export declare function getArcheologyData(plotCoord: float2): ArcheologyTooltipData | undefined;
/** Props for the ArcheologyPlotTooltipContent component */
export type ArcheologyPlotTooltipContentProps = PlotTooltipBaseProps;
/**
 * Determines whether the archeology tooltip has content to show at the given plot coordinates.
 * Returns true if the plot has ruins, a museum, a university, or is a natural wonder.
 */
export declare function hasArcheologyData(plotCoord: float2): boolean;
/**
 * Content component for the archeology plot tooltip.
 * TODO: Implement the full content rendering.
 */
export declare const ArcheologyPlotTooltipContent: Component<ArcheologyPlotTooltipContentProps>;
export {};
