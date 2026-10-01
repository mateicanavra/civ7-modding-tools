/**
 * @file building-placement-layer
 * @copyright 2023-2025, Firaxis Games
 * @description Lens layer to show yield deltas and adjacencies from placing a building
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
declare class WorkerYieldsLensLayer implements ILensLayer {
    private readonly buildSlotSpritePadding;
    private readonly yieldSpritePadding;
    private yieldVisualizer;
    private adjacenciesSpriteGrid;
    private buildingPlacementPlotChangedListener;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    private getPlacementOptions;
    /** Add the yield deltas and building slots to each valid plot for the current building */
    private realizeBuidlingPlacementSprites;
    /**
     * Returns an array of offsets for yield pills for totalPills count passed in
     * Will wrap to 2 lines once hitting a limit but won't wrap more than once
     * @param totalPills total number of yield pills that will be displayed on the tile
     * @returns array of offsets indexed to the sourced array of pills. ie: 3rd pill (index of 2) offset at offsetArray[2]
     */
    private getXYOffsetForPill;
    private realizeBuildSlots;
    private onBuildingPlacementPlotChanged;
    private generateAdjacencyBuckets;
    private rotateIconOffset;
    private calculateAdjacencyDirectionOffsetLocation;
    private calculateAdjacencyRotation;
    private calculateAdjacencyCorrectiveAngle;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-building-placement-layer": WorkerYieldsLensLayer;
    }
}
export {};
