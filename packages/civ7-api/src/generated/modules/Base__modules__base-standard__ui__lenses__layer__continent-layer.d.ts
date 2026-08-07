/**
 * @file continent-layer
 * @copyright 2024, Firaxis Games
 * @description Lens layer to show settling appeal of a plots
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export interface ContinentPlotList {
    continent: ContinentType;
    plotList: PlotCoord[];
    availableResources: number;
    totalResources: number;
    isDistant: boolean;
    color: number;
}
export declare const CONTINENT_COLORS: readonly [
    1291966711,
    2005874688,
    2011256480,
    1711564050,
    1724695389,
    1711341953
];
export declare const ToggleContinentPanelEventName: "raise-continent-panel";
export declare class ToggleContinentPanelEvent extends CustomEvent<{
    enabled: boolean;
}> {
    constructor(enabled: boolean);
}
export declare class ContinentLensLayer implements ILensLayer {
    static readonly instance: ContinentLensLayer;
    private continentOverlayGroup;
    private continentOverlay;
    private resourceOverlay;
    private unavailableResourceOverlay;
    private ownedResourceOverlay;
    private textOverlay;
    private continentCoords;
    private treasureCoords;
    private naturalWonderCoords;
    private get isExplorationAge();
    private get isModernAge();
    private clearOverlay;
    private getContinentName;
    get continentsList(): ContinentPlotList[];
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-continent-layer": ContinentLensLayer;
    }
}
