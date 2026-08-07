/**
 * @file trade-layer
 * @copyright 2024-2025, Firaxis Games
 * @description Lens layer that displays trade information
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class TradeLensLayer implements ILensLayer {
    private tradeRangeOverlayGroup;
    private tradeRangeOverlay;
    initLayer(): void;
    private initCities;
    private processRoutesForOverlayAsync;
    private finishInitCities;
    applyLayer(): any;
    removeLayer(): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-trade-layer": TradeLensLayer;
    }
}
export {};
