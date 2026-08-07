/**
 * @file discovery-lens.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Lens shown when a recon unit is selected
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class DiscoveryLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
    skipCachingEnabledLayers: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-discovery-lens": DiscoveryLens;
    }
}
export {};
