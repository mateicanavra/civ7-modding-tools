/**
 * @file radial-measurement-layer.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Lens layer to highlight discoveries for units
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare class RadialMeasureLayer implements ILensLayer {
    private radialMeasureModelGroup;
    private radialMeasureSpriteGrid;
    private radialMeasureOverlayGroup;
    private radialMeasure_3_Overlay;
    private radialMeasure_3_OverlayFill;
    private radialMeasure_6_Overlay;
    private radialMeasure_6_OverlayFill;
    private lastHoveredPlot;
    private cursorUpdateListener;
    private plotCursorUpdatedListener;
    private onLayerHotkeyListener;
    private inputContextChangedListener;
    private onInputContextChanged;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    private onPlotCursorUpdated;
    private onCursorUpdated;
    private onPlotUpdated;
    private addLabels;
    private onLayerHotkey;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-radial-measure-layer": RadialMeasureLayer;
    }
}
