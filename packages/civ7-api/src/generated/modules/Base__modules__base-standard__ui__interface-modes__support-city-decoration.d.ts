/**
 * @file City Decoration support
 * @copyright 2022, Firaxis Games
 * @description City Decoration support for interface modes (city-selected, city-production, city-growth, city-info)
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare namespace CityDecorationSupport {
    export enum HighlightColors {
        citySelection = 4290747514,
        urbanSelection = 4290747514,
        ruralSelection = 4283282700
    }
    class Instance {
        private cityOverlayGroup;
        private cityOverlay;
        private beforeUnloadListener;
        initializeOverlay(): void;
        decoratePlots(cityID: ComponentID): void;
        onUnload(): void;
        clearDecorations(): void;
    }
    export const manager: Instance;
    export {};
}
