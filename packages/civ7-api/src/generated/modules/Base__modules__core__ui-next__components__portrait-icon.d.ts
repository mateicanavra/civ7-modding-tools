/**
 * @file portrait-icon.tsx
 * @copyright 2026, Firaxis Games
 * @description Component that provides styled leader portrait
 */
import { Component } from "solid-js";
export interface PortraitIconData {
    playerId: PlayerId;
    size: number;
    desaturate?: boolean;
    class?: string;
}
export interface PortraitVictoryIconData extends PortraitIconData {
    isVictory: boolean;
    isDomination: boolean;
}
export interface LeaderIconProps {
    icon: string;
    size: number;
    desaturate?: boolean;
}
export declare const LeaderIconComponent: Component<LeaderIconProps>;
export declare const PortraitIcon: any;
