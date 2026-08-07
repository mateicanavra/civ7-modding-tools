/**
 * @file worker-yields-layer
 * @copyright 2022-2024, Firaxis Games
 * @description Lens layer to show yields from each plot during city tile acquisition and worker placement
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class WorkerYieldsLensLayer implements ILensLayer {
    private yieldSpritePadding;
    private yieldVisualizer;
    private yieldIcons;
    private plotWorkerUpdatedListener;
    private districtAddedToMapListener;
    private cacheIcons;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    private onPlotWorkerUpdate;
    private onDistrictAddedToMap;
    private realizeGrowthPlots;
    private realizeWorkablePlots;
    private addPositiveYield;
    private addNegativeYield;
    private updateSpecialistPlot;
    private getSpecialistPipOffsetsAndScale;
    private realizeBlockedPlots;
    private updatePlot;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-worker-yields-layer": WorkerYieldsLensLayer;
    }
}
export {};
