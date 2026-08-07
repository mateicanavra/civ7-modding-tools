/**
 * @file trade-lens.ts
 * @copyright 2024 Firaxis Games
 * @description Lens which shows trade information
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class TradeLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
    hasLegend: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-trade-lens": TradeLens;
    }
}
export {};
