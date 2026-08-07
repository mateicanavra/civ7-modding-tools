import { Component } from "solid-js";
import { PlotTooltipConstructibleInfo } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
interface UniqueQuarterSectionProps {
    definition: UniqueQuarterDefinition;
    buildings: PlotTooltipConstructibleInfo[];
}
/**
 * Renders a unique quarter as a header (hex icon, name, description) followed by
 * its constituent buildings connected by a vertical timeline rail with circle markers.
 */
export declare const UniqueQuarterSection: Component<UniqueQuarterSectionProps>;
export {};
