/**
 * @file random-events-layer.ts
 * @copyright 2024, Firaxis Games
 * @description Lens layer to show tiles which are susceptible to random events like eruptions or floods
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export interface PlotRandomEventData {
    location: PlotCoord;
    eventClass: string;
    tooltipKey: string;
}
export declare class RandomEventsLayer implements ILensLayer {
    static readonly instance: RandomEventsLayer;
    private plotRandomEvents;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    getRandomEventResult(x: number, y: number): PlotRandomEventData | undefined;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-random-events-layer": RandomEventsLayer;
    }
}
