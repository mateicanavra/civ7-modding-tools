/**
 * @file conquest-layer.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Lens layer to highlight plots for capturing settlements
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare class ConquestLayer implements ILensLayer {
    private overlayGroup;
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
        "fxs-conquest-layer": ConquestLayer;
    }
}
