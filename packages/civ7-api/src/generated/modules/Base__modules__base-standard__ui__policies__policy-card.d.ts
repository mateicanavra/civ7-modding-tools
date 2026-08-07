/**
 * @file Policy Card component
 * @copyright 2026 Firaxis Games
 * @description Card used for government screen to display Policies and Traditions
 */
import { Component, type JSX } from "solid-js";
export interface PolicyCardProps extends JSX.HTMLAttributes<HTMLElement> {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    name?: string;
    description?: string;
    card: TraditionDefinition;
    isActive: boolean;
    tradSlot: boolean;
    isTradition: boolean;
    isNewCard: boolean;
    autoFocus?: boolean;
}
interface CardSlotProps extends JSX.HTMLAttributes<HTMLElement> {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    card?: TraditionDefinition;
    isSlot?: boolean;
    slotType: string;
}
export declare const PolicyCard: Component<PolicyCardProps>;
export declare const DisplayPolicyCard: Component<PolicyCardProps>;
export declare const CardSlot: Component<CardSlotProps>;
export declare const BlankCardSlot: Component<CardSlotProps>;
export {};
