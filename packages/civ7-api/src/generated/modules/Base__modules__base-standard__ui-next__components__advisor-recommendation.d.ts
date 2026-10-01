/**
 * advisor-recommendation.tsx
 * Centralized AdvisorRecommendations rendering and text mapping.
 */
import { type Component, type JSX } from "solid-js";
import { AdvisorRecommendations as AdvisorRecommendationsType } from "/base-standard/ui/tutorial/advisor-utilities.js";
/**
 * Returns the localization key for a given advisor recommendation type.
 */
export declare const getTextForAdvisorRecommendation: (type: AdvisorRecommendationsType) => string;
/**
 * Returns the icon URL for a given advisor recommendation type.
 */
export declare const getIconForAdvisorRecommendation: (rec: AdvisorRecommendationsType) => string;
export interface AdvisorRecommendationItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The advisor recommendation type to display. */
    recommendation: AdvisorRecommendationsType;
    /** If true, only shows the icon without text. */
    iconOnly?: boolean;
    /** Optional size class for the icon container (e.g., 'size-6'). */
    sizeClass?: `size-${number}`;
    /** text to override the advisor recommendation label */
    textOverride?: string;
}
/**
 * Renders a single advisor recommendation with icon and optional localized label.
 */
export declare const AdvisorRecommendationItem: Component<AdvisorRecommendationItemProps>;
export interface AdvisorRecommendationsListProps extends JSX.HTMLAttributes<HTMLDivElement> {
    recommendations: AdvisorRecommendationsType[];
    direction?: "horizontal" | "vertical";
    iconOnly?: boolean;
    noWrap?: boolean;
}
/**
 * Renders a list of advisor recommendations with icons and localized labels.
 */
export declare const AdvisorRecommendationsList: any;
