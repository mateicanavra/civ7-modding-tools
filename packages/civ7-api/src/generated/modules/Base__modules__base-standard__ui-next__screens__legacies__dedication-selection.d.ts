/**
 * @file dedication-selection.tsx
 * @copyright 2026, Firaxis Games
 * @description Screen shownn in age transition to select Dedications.
 */
import { Component, JSX } from "solid-js";
import { DedicationCardProps } from "/base-standard/ui-next/screens/legacies/dedication-card-contents.js";
export declare const DedicationCard: Component<DedicationCardProps>;
interface EmptySlotProps extends JSX.HTMLAttributes<HTMLDivElement> {
    onHover?: () => void;
}
export declare const EmptySlot: (props: EmptySlotProps) => any;
export declare const DedicationSelection: any;
export {};
