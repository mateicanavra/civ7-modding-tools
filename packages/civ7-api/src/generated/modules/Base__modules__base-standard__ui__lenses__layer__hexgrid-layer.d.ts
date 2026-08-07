/**
 * @file hexgrid-layer.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Lens layer that displays the hex grid for the map
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class HexGridLensLayer implements ILensLayer {
    private group;
    private overlay;
    private onLayerHotkeyListener;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    getOptionName(): string;
    private onLayerHotkey;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-hexgrid-layer": HexGridLensLayer;
    }
}
export {};
