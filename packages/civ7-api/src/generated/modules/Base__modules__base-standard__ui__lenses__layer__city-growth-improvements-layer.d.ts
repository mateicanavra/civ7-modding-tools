/**
 * @file city-growth-improvements-layer
 * @copyright 2024, Firaxis Games
 * @description Lens layer which shows which improvements will be built when expanding to new Rural plots
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class CityGrowthImprovementsLensLayer implements ILensLayer {
    private readonly spriteOffset;
    private readonly spriteScale;
    private readonly resourceXOffset;
    private improvementSpriteGrid;
    private resourceTypeSpriteGrid;
    private suppressedResources;
    private expandPlotDataUpdatedEventListener;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    private addResourceIcon;
    private updateImprovementIcons;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-city-growth-improvements-layer": CityGrowthImprovementsLensLayer;
    }
}
export {};
