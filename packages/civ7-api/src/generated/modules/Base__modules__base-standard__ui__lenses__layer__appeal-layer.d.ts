/**
 * @file appeal-layer
 * @copyright 2022-2025, Firaxis Games
 * @description Lens layer to show settling appeal of a plots
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class AppealLensLayer implements ILensLayer {
    private cityAddedToMapListener;
    private appealOverlayGroup;
    private appealOverlay;
    private blockedPlots;
    private bestPlots;
    private okayPlots;
    private clearOverlay;
    initLayer(): void;
    applyLayer(): void;
    private onCityAddedToMap;
    removeLayer(): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-appeal-layer": AppealLensLayer;
    }
}
export {};
