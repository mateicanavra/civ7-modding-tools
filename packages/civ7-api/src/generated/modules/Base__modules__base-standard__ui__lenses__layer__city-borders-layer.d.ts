/**
 * @file city-borders-layer
 * @copyright 2024, Firaxis Games
 * @description Lens layer for city borders where individual city bounds are represented if two cities are adjacent
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class CityBordersLayer implements ILensLayer {
    private cityOverlayGroup;
    /** Map of border overlays keyed by the PlotIndex of the city */
    private borderOverlayMap;
    /** Map of city center plot indexes keyed by plot indexes owned by that city */
    private ownedPlotMap;
    private lastZoomLevel;
    initLayer(): void;
    private getBorderOverlay;
    private createBorderOverlay;
    private initBordersForPlayer;
    private initBordersForIndependent;
    private onPlotOwnershipChanged;
    private findCityCenterIndexForPlotIndex;
    private onCameraChanged;
    applyLayer(): void;
    removeLayer(): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-city-borders-layer": CityBordersLayer;
    }
}
export {};
