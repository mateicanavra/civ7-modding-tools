/**
 * @file plot-workers-manager.ts
 * @copyright 2022 - 2024, Firaxis Games
 * @description Helper class that holds all of the plot workers data
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare const PlotWorkersHoveredPlotChangedEventName: "population-placement-hovered-plot-changed";
export declare class PlotWorkersHoveredPlotChangedEvent extends CustomEvent<never> {
    constructor();
}
export declare const PlotWorkersUpdatedEventName: "plot-workers-updated";
export declare class PlotWorkersUpdatedEvent extends CustomEvent<{
    location: PlotCoord | undefined;
}> {
    constructor(location?: PlotCoord);
}
declare class PlotWorkersManagerClass {
    private static instance;
    private _cityID;
    get cityID(): ComponentID | null;
    private _allWorkerPlots;
    get allWorkerPlots(): WorkerPlacementInfo[];
    private _allWorkerPlotIndexes;
    get allWorkerPlotIndexes(): PlotIndex[];
    private _workablePlots;
    get workablePlots(): WorkerPlacementInfo[];
    private _workablePlotIndexes;
    get workablePlotIndexes(): PlotIndex[];
    private _blockedPlots;
    get blockedPlots(): WorkerPlacementInfo[];
    private _blockedPlotIndexes;
    get blockedPlotIndexes(): PlotIndex[];
    private _hoveredPlotIndex;
    get hoveredPlotIndex(): Readonly<PlotIndex | null>;
    set hoveredPlotIndex(plotIndex: PlotIndex | null);
    private _cityWorkerCap;
    get cityWorkerCap(): number;
    constructor();
    reset(): void;
    initializeWorkersData(cityID: ComponentID): void;
    private update;
    private isPlotIndexSelectable;
    private onWorkerAdded;
}
declare const PlotWorkersManager: PlotWorkersManagerClass;
export { PlotWorkersManager as default };
