/**
 * @file helpers.ts
 * @copyright 2025, Firaxis Games
 * @description Helper functions for chooser screens with reactive-friendly APIs.
 */
import type { TreeGridDepthInfo } from "/base-standard/ui/tree-grid/tree-support.js";
/** Yield change data for display. */
export interface UnlockYieldChange {
    /** The yield type (e.g., "YIELD_FOOD", "YIELD_PRODUCTION"). */
    yieldType: YieldType;
    /** The amount of yield change. */
    amount: number;
}
/** Adjacency group data for display. */
export interface UnlockAdjacencyGroup {
    /** Unique identifier for keying. */
    id: string;
    /** Localization key for the text. */
    textKey: string;
    /** Arguments for the localization string. */
    args: LocalizedTextArgument[];
    /** Optional list markup for grouped adjacencies. */
    listMarkup?: string;
}
/** A single description line that should be stylized. */
export interface UnlockDescriptionLine {
    /** Localization key or pre-stylized text. */
    text: string;
}
/**
 * Structured description data for an unlock target.
 * This provides all the information needed to render a rich tooltip
 * without pre-composing strings, allowing for reactive L10n component usage.
 */
export interface UnlockTargetDescription {
    /** Target kind (e.g., "KIND_UNIT", "KIND_CONSTRUCTIBLE"). */
    kind: string;
    /** Target type identifier. */
    type: string;
    /** Tags for categorization (e.g., "Modern Military Building"). */
    tags: string[];
    /** Base yield changes (e.g., Food +2, Production +8). */
    yields: UnlockYieldChange[];
    /** Adjacency bonuses grouped by yield type. */
    adjacencies: UnlockAdjacencyGroup[];
    /** Description lines (from modifiers, tooltips, or base description). */
    descriptionLines: UnlockDescriptionLine[];
}
/**
 * Get the localized name for an unlock target.
 * @param targetType - The type identifier of the unlock target.
 * @param targetKind - The kind of the unlock target.
 * @returns The localization key for the name (not pre-composed).
 */
export declare function getUnlockTargetNameKey(targetType: string, targetKind: string): string;
/**
 * Get the icon URL for an unlock target.
 * @param targetType - The type identifier of the unlock target.
 * @param targetKind - The kind of the unlock target.
 * @returns The icon URL.
 */
export declare function getUnlockTargetIconUrl(targetType: string, targetKind: string): string;
/**
 * Get structured description data for an unlock target.
 * This returns raw localization keys and structured data suitable for
 * reactive rendering with L10n components.
 *
 * @param targetType - The type identifier of the unlock target.
 * @param targetKind - The kind of the unlock target.
 * @returns Structured description data for the unlock target.
 */
export declare function getUnlockTargetDescriptionData(targetType: string, targetKind: string): UnlockTargetDescription;
/**
 * Check if an unlock target has meaningful description content.
 * @param data - The unlock target description data.
 * @returns True if there is content to display.
 */
export declare function hasUnlockContent(data: UnlockTargetDescription): boolean;
/**
 * Extended unlock display data with structured description information.
 * This extends the base NodeUnlockDisplayData with additional fields for
 * reactive rendering.
 */
export interface UnlockDisplayData {
    /** Icon URL for the unlock. */
    icon: string;
    /** Localization key for the name. */
    nameKey: string;
    /** Target kind (e.g., "KIND_UNIT", "KIND_CONSTRUCTIBLE"). */
    kind: string;
    /** Target type identifier. */
    type: string;
    /** Depth level at which this unlock occurs. */
    depth: number;
    /** Structured description data for rich rendering. */
    descriptionData: UnlockTargetDescription;
}
/**
 * Depth info structure compatible with existing TreeGridDepthInfo but
 * using the new UnlockDisplayData for richer unlock information.
 */
export interface ChooserDepthInfo {
    /** Header text (usually empty in choosers). */
    header: string;
    /** Array of unlock items with structured data. */
    unlocks: UnlockDisplayData[];
    /** Whether this depth level has been completed. */
    isCompleted: boolean;
    /** Whether this depth level is currently being researched. */
    isCurrent: boolean;
    /** Whether this depth level is locked. */
    isLocked: boolean;
}
/**
 * Build unlock display data for a single progression tree node unlock.
 * @param unlockInfo - The raw unlock info from GameInfo.
 * @returns Structured unlock display data.
 */
export declare function buildUnlockDisplayData(unlockInfo: ProgressionTreeNodeUnlockDefinition): UnlockDisplayData;
/**
 * Convert a legacy NodeUnlockDisplayData to the new UnlockDisplayData format.
 * This allows existing code that uses the old API to work with the new tooltip components.
 * @param legacyUnlock - The legacy unlock data.
 * @returns The new format unlock display data.
 */
export declare function convertLegacyUnlock(legacyUnlock: NodeUnlockDisplayData): UnlockDisplayData;
/**
 * Convert legacy TreeGridDepthInfo array to the new ChooserDepthInfo format.
 * This is useful when consuming data from legacy APIs that produce TreeGridDepthInfo.
 * @param legacyDepths - Array of legacy TreeGridDepthInfo objects.
 * @returns Array of ChooserDepthInfo objects with structured unlock data.
 */
export declare function convertLegacyDepthInfo(legacyDepths: TreeGridDepthInfo[]): ChooserDepthInfo[];
