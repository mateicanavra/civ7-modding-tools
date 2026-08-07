/**
 * @file building-placement-lens
 * @copyright 2023, Firaxis Games
 * @description Lens used when selecting a tile to construct a new building
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class BuildingPlacementLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-building-placement-lens": BuildingPlacementLens;
    }
}
export {};
