/**
 * @file yields-layer
 * @copyright 2022-2025, Firaxis Games
 * @description Lens layer to show yields from each plot
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class YieldsLensLayer implements ILensLayer {
    private yieldSpritePadding;
    private yieldSpriteGrid;
    private yieldIcons;
    private plotStates;
    private revealedStates;
    private plotsNeedingUpdate;
    private constructibleStates;
    private fontData;
    private onLayerHotkeyListener;
    cacheIcons(): void;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    getOptionName(): string;
    private calculateConstructibleState;
    private onPlotVisibilityChanged;
    private onPlotYieldChanged;
    private onConstructibleChange;
    private applyYieldChanges;
    private updatePlotState;
    private onLayerHotkey;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-yields-layer": YieldsLensLayer;
    }
}
export {};
