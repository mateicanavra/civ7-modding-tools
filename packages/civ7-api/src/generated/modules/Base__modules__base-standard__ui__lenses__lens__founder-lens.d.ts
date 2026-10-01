/**
 * @file founder-lens.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Lens shown when a founder is selected
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
export declare class FounderLens implements ILens {
    constructor();
    activeLayers: any;
    allowedLayers: any;
    skipCachingEnabledLayers: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-founder-lens": FounderLens;
    }
}
