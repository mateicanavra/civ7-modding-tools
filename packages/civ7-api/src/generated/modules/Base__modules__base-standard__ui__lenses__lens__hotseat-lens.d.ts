/**
 * @file hotseat-lens
 * @copyright 2026, Firaxis Games
 * @description Lens used for hotseat transitions
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class HotseatLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-hotseat-lens": HotseatLens;
    }
}
export {};
