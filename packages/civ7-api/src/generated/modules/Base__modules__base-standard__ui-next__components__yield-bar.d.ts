/**
 * yield-bar.tsx
 * Solid.js yield bar
 */
import { type JSX } from "solid-js";
/** Visual style for a yield bar entry. */
export declare enum YieldBarEntryStyle {
    NONE = 0,
    GAIN = 1,
    LOSS = 2
}
/** Data for a single yield bar entry. */
export interface YieldBarEntry {
    /** Icon identifier for the entry. */
    type: string;
    /** Numeric value shown for the entry. */
    value: number;
    /** Visual container style for the entry. */
    style: YieldBarEntryStyle;
    /** Optional icon context passed to Icon. */
    iconContext?: string;
}
/** Display variant for the yield bar. */
export type YieldBarVariant = "default" | "compact";
/** Props for the YieldBar component. */
export interface YieldBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Ordered entries rendered in the yield bar. */
    yieldBarData: YieldBarEntry[];
    /** Optional per-entry delta values rendered above entries by index. */
    yieldBarDeltas?: YieldBarEntry[];
    /** Display variant. "compact" uses pill-shaped containers. @default "default" */
    variant?: YieldBarVariant;
}
export declare const YieldBar: any;
