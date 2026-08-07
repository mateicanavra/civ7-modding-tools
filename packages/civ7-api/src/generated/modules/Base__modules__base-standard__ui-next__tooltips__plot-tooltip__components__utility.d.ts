/**
 * utility.tsx
 * @copyright 2026, Firaxis Games
 * @description Reusable components specific to the plot tooltip
 */
import { Component, ParentComponent, type JSX } from "solid-js";
export interface DividerProps {
    class?: string;
}
/** The visual variant of a ticket section. */
export type TicketSectionVariant = "default" | "negative" | "gold";
/** Horizontal divider line component - spans full width with gradient fade. */
export declare const Divider: Component<DividerProps>;
/** Entry divider used between rows within a ticket section. Simple semi-transparent line. */
export declare const EntryDivider: Component<DividerProps>;
export interface TicketSectionProps {
    name?: string;
    class?: string;
    /** The visual variant of the ticket background. @default "default" */
    variant?: TicketSectionVariant;
}
/** Generic ticket wrapper used by plot tooltip sections. */
export declare const TicketSection: ParentComponent<TicketSectionProps>;
interface TicketRowProps {
    icon?: JSX.Element;
    class?: string;
}
/** Reusable ticket row with left icon, center divider, and right content. */
export declare const TicketRow: ParentComponent<TicketRowProps>;
export {};
