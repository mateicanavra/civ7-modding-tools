/**
 * @file continent-lens.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Lens shown when a settler is selected (different from a "founder," which is the first settler)
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class ContinentLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
    hasLegend: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-continent-lens": ContinentLens;
    }
}
export {};
