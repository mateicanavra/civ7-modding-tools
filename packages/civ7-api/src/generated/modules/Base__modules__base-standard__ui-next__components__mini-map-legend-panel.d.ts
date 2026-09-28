/**
 * @file mini-map-legend-panel
 * @copyright 2026, Firaxis Games
 * @description A base panel to use for showing mini-map legends
 */
import { JSX } from "solid-js";
import { LensName } from "/core/ui/lenses/lens-manager.js";
export interface MiniMapLegendPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
    title: string;
    lensName: LensName;
}
export declare const MiniMapLegendPanel: any;
