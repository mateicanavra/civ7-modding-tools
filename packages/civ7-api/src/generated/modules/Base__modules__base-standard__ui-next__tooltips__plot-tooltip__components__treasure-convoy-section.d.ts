import { Component } from "solid-js";
/** Props for {@link TreasureConvoySection}. */
export interface TreasureConvoySectionProps {
    /** The city that owns the plot, if any. Used to read convoy generation timing. */
    owningCity: City | null;
    /** Whether the plot is in the local player's distant lands. Determines the icon shown. */
    isDistantLands: boolean;
}
/**
 * Treasure convoy generation status for a settled treasure-resource plot.
 *
 * Visually mirrors the gold timed-alert ticket but is a standalone section because
 * convoy generation is not actually an alert.
 */
export declare const TreasureConvoySection: Component<TreasureConvoySectionProps>;
