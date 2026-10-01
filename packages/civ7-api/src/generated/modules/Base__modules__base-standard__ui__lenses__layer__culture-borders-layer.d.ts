/**
 * @file culture-borders-layer
 * @copyright 2024-2025, Firaxis Games
 * @description Lens layer that shows a civs/cultures city borders get merged with adjacent owned tiles
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class CultureBordersLayer implements ILensLayer {
    private cultureOverlayGroup;
    private cultureBorderOverlay;
    private lastZoomLevel;
    /**
     * @implements ILensLayer
     */
    initLayer(): void;
    /**
     * @implements ILensLayer
     */
    applyLayer(): void;
    /**
     * @implements ILensLayer
     */
    removeLayer(): void;
    private findPlotsForPlayerOrCityState;
    private findPlotsForIndependent;
    private onPlotOwnershipChanged;
    private onCameraChanged;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-culture-borders-layer": CultureBordersLayer;
    }
}
export {};
