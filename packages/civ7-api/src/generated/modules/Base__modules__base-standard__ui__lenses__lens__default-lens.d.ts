/**
 * @file default-lens
 * @copyright 2022-2025, Firaxis Games
 * @description Default lens most often active during gameplay
 */
import { ILens } from "/core/ui/lenses/lens-manager.js";
declare class DefaultLens implements ILens {
    activeLayers: any;
    allowedLayers: any;
    /**
     * Do not blend on transition.
     * Users are able to manage which layers to use in the default lens, so stick with those.
     */
    blendEnabledLayersOnTransition: boolean;
    useUserConfig: boolean;
}
declare global {
    interface LensTypeMap {
        "fxs-default-lens": DefaultLens;
    }
}
export {};
