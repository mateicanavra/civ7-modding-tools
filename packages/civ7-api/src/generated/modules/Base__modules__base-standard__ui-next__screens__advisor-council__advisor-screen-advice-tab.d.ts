/**
 * @file advisor-screen-advice-tab.tsx
 * @copyright 2026, Firaxis Games
 * @description Detailed overview of an individual advisors content
 */
import { Component } from "solid-js";
import { AdvicePage } from "/base-standard/ui/advice/advice-defines.js";
export interface PortraitTabProps {
    title: string;
    quote: string;
    type: AdvisorType;
}
export interface MessageTabProps {
    messageTitle: string;
    messageDescription: string;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}
export interface NoteTabProps {
    noteTitle: string;
    noteDescription: string;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}
export interface AdvisorTabProps {
    type: AdvisorType;
    title: string;
    pages: AdvicePage[];
    defaultTab?: string | undefined;
}
export declare const AdvisorTab: Component<AdvisorTabProps>;
