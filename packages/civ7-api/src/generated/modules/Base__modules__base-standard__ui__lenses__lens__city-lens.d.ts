/**
 * @file city-lens
 * @copyright 2022, Firaxis Games
 * @description Lens used when focused on a city
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class CityLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-city-lens": CityLens;
    }
}
export {};
