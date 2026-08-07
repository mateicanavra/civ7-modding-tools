/**
 * @file general-appeal-layer.ts
 * @copyright 2025, Firaxis Games
 * @description Lens layer to highlight general appeal
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare const ToggleGeneralAppealPanelEventName = "raise-general-appeal-panel";
export declare class ToggleGeneralAppealPanelEvent extends CustomEvent<{
    enabled: boolean;
}> {
    constructor(enabled: boolean);
}
export declare class GeneralAppealLensLayer implements ILensLayer {
    private generalAppealOverlayGroup;
    private generalAppealOverlay;
    private naturalWonderPlots;
    private breathtakingPlots;
    private charmingPlots;
    private averagePlots;
    clearOverlay(): void;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-general-appeal-layer": GeneralAppealLensLayer;
    }
}
