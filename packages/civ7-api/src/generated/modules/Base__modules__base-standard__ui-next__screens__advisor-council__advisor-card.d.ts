/**
 * @file advisor-card.txs
 * @copyright 2026, Firaxis Games
 * @description Resusable card to display a preview of an advisor
 */
import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
export interface AdvisorPortraitProps {
    title: string;
    type: AdvisorType;
    shrink?: boolean;
}
export interface AdvisorQuoteContainerProps extends JSX.HTMLAttributes<HTMLElement> {
    iconSrc?: string;
    iconElement?: JSX.Element;
    isFollowed: boolean;
    useScrollProxy?: boolean;
}
export declare const AdvisorQuoteContainer: Component<AdvisorQuoteContainerProps>;
export interface AdvisorCardProps {
    type: AdvisorType;
    title: string;
    isInitialPopup: boolean;
    activatable?: boolean;
}
export declare const AdvisorPortrait: any;
export declare const AdvisorCard: any;
