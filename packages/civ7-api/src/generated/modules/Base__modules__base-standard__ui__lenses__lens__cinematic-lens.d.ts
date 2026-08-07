/**
 * @file cinematic-lens
 * @copyright 2022, Firaxis Games
 * @description Lens used cinematics are playing
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class CinematicLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-cinematic-lens": CinematicLens;
    }
}
export {};
