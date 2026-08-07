/**
 * @file victories-alt-base.tsx
 * @copyright 2025-2026, Firaxis Games
 * @description Alternative victories tab layout component (used for economic and score tabs)
 */
import { ParentComponent } from "solid-js";
interface VictoriesAltBaseProps {
    /** Whether to use score tab behavior (wraps rows in scrollable area on small screens) */
    isScoreTab?: boolean;
    /** Background image URL (with url() wrapper) */
    backgroundImage: string;
    /** CSS classes for background div */
    backgroundClass: string;
    /** Header text to display above small screens */
    headerText: string;
    /** Victory type name (e.g., "LOC_VICTORY_ECONOMIC_MODERN_NAME") */
    victoryName: string;
    /** CSS color class for victory name */
    titleColorClass: string;
    /** Point goal value to display (only used for economic tab) */
    pointGoal?: number;
    /** Label for point goal column (only used for economic tab) */
    pointGoalLabel?: string;
    /** Rules text for tooltip (only used for economic tab) */
    rulesText?: string;
    /** Optional name for VSlot container */
    slotName?: string;
    /** CSS class for outer slot wrapper */
    slotClass?: string;
    /** Component children for VictoryHeader */
    headerContent: ParentComponent;
    /** CSS class for ScrollArea */
    scrollAreaClass: string | (() => string);
    /** Content to render on the right side (graph for economic, text for score) */
    rightContent: ParentComponent;
    /** Small-screen right content for score tab */
    rightContentSmallScreen?: ParentComponent;
    /** Optional wrapper class for right content area */
    rightContentClass?: string;
}
export declare const VictoriesAltBase: ParentComponent<VictoriesAltBaseProps>;
export {};
