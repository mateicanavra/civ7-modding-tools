/**
 * tech-civic-tooltip.tsx
 * @copyright 2025, Firaxis Games
 * @description Solid version of the Tech/Civic tooltip content.
 */
import { type ParentComponent } from "solid-js";
import { TooltipBaseProps } from "/core/ui-next/components/tooltip.js";
import { AdvisorRecommendations } from "/base-standard/ui/tutorial/advisor-utilities.js";
import type { ChooserDepthInfo } from "/base-standard/ui-next/screens/choosers/helpers.js";
interface TechCivicNode {
    /** Display name for the node (already includes mastery numeral if applicable). */
    name: string;
    /** Unlocks organized by depth/mastery tier. */
    unlocksByDepth?: ChooserDepthInfo[];
    /** Cost to research this node. */
    cost?: number;
    /** Advisor recommendations for this node. */
    recommendations?: AdvisorRecommendations[];
    /** The current depth index being researched (0-based). Used to show only the current tier's unlocks. */
    currentDepthIndex?: number;
}
export interface TechCivicTooltipProps extends TooltipBaseProps {
    /** Node data for the tooltip contents */
    node: TechCivicNode;
    /** Whether the node is a civic (culture) node; toggles the cost icon */
    isCulture?: boolean;
}
export declare const TechCivicTooltip: ParentComponent<TechCivicTooltipProps>;
export {};
