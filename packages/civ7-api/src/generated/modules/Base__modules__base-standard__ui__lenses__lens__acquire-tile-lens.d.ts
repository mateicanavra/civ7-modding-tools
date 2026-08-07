/**
 * @file acquire-tile-lens
 * @copyright 2022, Firaxis Games
 * @description Lens used when selecting a tile to acquire or worker placement
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class AcquireTileLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-acquire-tile-lens": AcquireTileLens;
    }
}
export {};
