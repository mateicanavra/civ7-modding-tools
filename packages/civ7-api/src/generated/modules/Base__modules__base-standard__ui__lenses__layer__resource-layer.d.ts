/**
 * @file resource-layer
 * @copyright 2022-2025, Firaxis Games
 * @description Lens layer to show resource icons on the map
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare class ResourceLensLayer implements ILensLayer {
    static instance: ResourceLensLayer;
    private resourceSpriteGrid;
    private resourceTypeSpriteGrid;
    private suppressedPlots;
    private resourceAddedToMapListener;
    private resourceRemovedFromMapListener;
    private onLayerHotkeyListener;
    private onResizeListener;
    /**
     * @implements ILensLayer
     */
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    getOptionName(): string;
    private addResourceSprites;
    suppressPlots(plots: PlotIndex[]): void;
    clearSuppressedPlots(): void;
    private updateIconScaling;
    private setResourceSpritesVisible;
    private clearResourceSpritesFromPlot;
    private onResourceAddedToMap;
    private onResourceRemovedFromMap;
    private onLayerHotkey;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-resource-layer": ResourceLensLayer;
    }
}
