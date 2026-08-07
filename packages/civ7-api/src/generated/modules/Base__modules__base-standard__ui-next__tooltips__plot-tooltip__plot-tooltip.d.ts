/**
 * plot-tooltip.tsx
 * @copyright 2025-2026, Firaxis Games
 * @description Plot tooltip that shows information about tiles when hovering with the cursor.
 */
import { type Component, type JSX } from "solid-js";
import { TooltipBaseProps } from "/core/ui-next/components/tooltip.js";
import { type PlotTooltipBaseProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
/** Global toggle for plot tooltip visibility across UI systems. */
export declare const IsPlotTooltipVisible: any, SetIsPlotTooltipVisible: any;
/** Props for the PlotTooltipContent component */
export interface PlotTooltipContentProps extends PlotTooltipBaseProps, JSX.HTMLAttributes<HTMLDivElement> {
}
/**
 * Plot tooltip content component.
 * Displays detailed information about a world plot including terrain, yields, owner, units, etc.
 */
export declare const PlotTooltipContent: Component<PlotTooltipContentProps>;
/** Props for the PlotTooltip component */
export interface PlotTooltipProps extends Omit<TooltipBaseProps, "children"> {
    /** Whether to show debug information in the tooltip. @default false */
    showDebug?: boolean;
}
/**
 * A complete plot tooltip component that displays information about the hovered world plot.
 * Automatically tracks plot cursor position and shows/hides based on plot visibility.
 *
 * @example
 * ```tsx
 * <PlotTooltip />
 * ```
 */
export declare const PlotTooltip: any;
