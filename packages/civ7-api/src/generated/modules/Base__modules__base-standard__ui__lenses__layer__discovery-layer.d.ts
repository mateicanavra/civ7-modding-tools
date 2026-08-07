/**
 * @file discovery-layer.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Lens layer to highlight discoveries for units
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare class DiscoveryLayer implements ILensLayer {
    private overlayGroup;
    private plotOverlay;
    private borderOverlay;
    private onPlotOrConstructibleChanged;
    initLayer(): void;
    applyLayer(): void;
    resetOverlay(): void;
    removeLayer(): void;
    updatePlot(plotCoord: PlotCoord): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-discovery-layer": DiscoveryLayer;
    }
}
