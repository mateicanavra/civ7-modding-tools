/**
 * pills.tsx
 * General-purpose pill-shaped label components for tags, badges, and status indicators.
 */
import { type Component, type JSX, type ParentComponent } from "solid-js";
import { type AdvisorRecommendationItemProps } from "/base-standard/ui-next/components/advisor-recommendation.js";
export interface PillProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Additional CSS classes to apply to the container. */
    class?: string;
    /** Inline style for custom backgrounds (e.g., gradients). */
    backgroundStyle?: JSX.CSSProperties;
    /** Reduces overall pill size for denser layouts. */
    small?: boolean;
}
/**
 * A base pill-shaped label component that can be customized with different backgrounds.
 * Used as a foundation for specific pill variants.
 */
export declare const Pill: ParentComponent<PillProps>;
export interface PillTextProps extends PillProps {
    /** Localization key for the pill text. */
    text: string;
    /** Optional arguments for the localization string. */
    args?: LocalizedTextArgument[];
}
/**
 * A base pill that displays localized and stylized text.
 */
export declare const PillText: ParentComponent<PillTextProps>;
export interface AdvisorRecommendationPillProps extends AdvisorRecommendationItemProps {
    /** Additional CSS classes to apply to the container. */
    class?: string;
}
/**
 * A pill component that displays an advisor recommendation with an icon and label.
 * Features a gradient background styled according to the advisor type.
 */
export declare const AdvisorRecommendationPill: Component<AdvisorRecommendationPillProps>;
