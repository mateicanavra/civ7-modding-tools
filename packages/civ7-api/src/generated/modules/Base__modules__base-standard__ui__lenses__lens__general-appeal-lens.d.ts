/**
 * @file general-appeal-lens.ts
 * @copyright 2025, Firaxis Games
 * @description Lens showing different appeals types
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class GeneralAppealLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
    hasLegend: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-general-appeal-lens": GeneralAppealLens;
    }
}
export {};
