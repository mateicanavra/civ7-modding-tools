/**
 * @file diplomacy-lens.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Lens used when in diplomacy modes
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class DiplomacyLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
}
declare global {
    interface LensTypeMap {
        "fxs-diplomacy-lens": DiplomacyLens;
    }
}
export {};
