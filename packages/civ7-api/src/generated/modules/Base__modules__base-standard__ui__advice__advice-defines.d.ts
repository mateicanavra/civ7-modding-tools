/**
 * @file advice-defines.ts
 * @copyright 2026, Firaxis Games
 * @description Common defines and data structures used by advice manager and pieces of advice.
 */
export interface AdvicePage {
    id: string;
    quote: string;
    title: string;
    message: string;
    noteTitle: string;
    noteDescription: string;
}
export type AdviceDelivery = "sequential" | "random";
/**
 * Used to define 1 to N items that can be delivered as pages to an advisor.
 * Definitions are what the authors write.
 */
export interface BundleDefinition {
    id: string;
    type: AdvisorType;
    pages: string[];
    priority?: number;
    delivery: undefined | AdviceDelivery;
    onSelect: () => boolean;
    onObsolete?: () => boolean;
}
/**
 * Simplified version of adding a single item that may become a page.
 */
export interface ItemDefinition {
    id: string;
    type: AdvisorType;
    priority?: number;
    onSelect: () => boolean;
    onObsolete?: () => boolean;
}
/**
 * active - Bundle is active so pages are pulled from it.
 * complete - Bundle is finished giving pages.
 * obsolete - Bundle never gave pages (and never will).
 */
export type BundleState = "active" | "complete" | "obsolete";
/**
 * The unique identifier for a "page" of advice and advisor gives the player.
 */
export interface PageId {
    id: string;
    page: string;
}
export declare enum Priority {
    low = 100,
    medium = 200,
    high = 300
}
