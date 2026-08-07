/**
 * @file model-place-population.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Data model for placing a selecting a plot to grow
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { YieldBonusInfo } from "/base-standard/ui/building-placement/building-placement-manager.js";
import { CityYieldData } from "/base-standard/ui/utilities/utilities-city-yields.js";
import { YieldBarEntry } from "/base-standard/ui/yield-bar-base/yield-bar-base.js";
export interface ExpandPlotData {
    plotIndex: PlotIndex;
    constructibleType: ConstructibleType | undefined;
}
export declare enum PlacePopulationSelectionState {
    NONE = 0,
    ADD_IMPROVEMENT = 1,
    ADD_SPECIALIST = 2
}
export declare const PlacePopulationSelectionChangedEventName: "place-population-selection-changed";
export declare class PlacePopulationSelectionChangedEvent extends CustomEvent<{
    state: PlacePopulationSelectionState;
}> {
    constructor(state: PlacePopulationSelectionState);
}
declare class PlacePopulationModel {
    cityName: string;
    cityYields: CityYieldData[];
    isTown: boolean;
    isResettling: boolean;
    hasUnlockedSpecialist: boolean;
    hoveredPlotIndex: number | undefined;
    hasHoveredWorkerPlot: boolean;
    numSpecialistsMessage: string;
    canAddSpecialistMessage: string;
    slotsAvailableMessage: string;
    bonusGrantedMessage: string;
    growthTitle: string;
    growthDescription: string;
    beforeSpecialistSlotStatus: boolean[];
    afterSpecialistSlotStatus: boolean[];
    alreadyHasSpecialists: boolean;
    showBeforeSpecialistBonus: boolean;
    beforeSpecialistBonus: string[];
    showAfterSpecialistBonus: boolean;
    afterSpecialistBonus: string[];
    showBeforeSpecialistMaintenance: boolean;
    beforeSpecialistMaintenance: string[];
    showAfterSpecialistMaintenance: boolean;
    afterSpecialistMaintenance: string[];
    showChangeSpecialistMaintenance: boolean;
    changeSpecialistMaintenance: string[];
    showNonHoverSpecialistMaintenanceBase: boolean;
    nonHoverSpecialistMaintenanceBase: string[];
    showNonHoverSpecialistMaintenanceAdditional: boolean;
    nonHoverSpecialistMaintenanceAdditional: string[];
    constructibleToBeBuiltOnExpand: ConstructibleType | undefined;
    addImprovementType: string;
    addImprovementText: string;
    currentYieldTotals: YieldBarEntry[];
    currentYieldTotalsJSONd: string;
    afterYieldTotalsJSONd: string;
    afterYieldDeltasJSONd: string;
    afterBonuses: YieldBonusInfo[];
    showExpandedView: boolean;
    private _selectionState;
    get selectionState(): PlacePopulationSelectionState;
    set selectionState(state: PlacePopulationSelectionState);
    private expandPlots;
    ExpandPlotDataUpdatedEvent: LiteEvent<ExpandPlotData[]>;
    private hoveredPlotWorkerIndex;
    private hoveredPlotWorkerPlacementInfo;
    private plotCursorCoordsUpdatedListener;
    constructor();
    private _OnUpdate?;
    set updateCallback(callback: (model: PlacePopulationModel) => void);
    updateExpandPlots(id: ComponentID): void;
    updateExpandPlotsForResettle(id: ComponentID): void;
    getExpandPlots(): ExpandPlotData[];
    getExpandPlotsIndexes(): PlotIndex[];
    getExpandConstructibleForPlot(plotIndex: PlotIndex): ConstructibleType | undefined;
    private updateGate;
    private updateNonHoverSpecialistMaintenance;
    update(): void;
    private onWorkersHoveredPlotChanged;
    private onWorkerAdded;
    private onPlotCursorCoordsUpdated;
}
export declare const PlacePopulation: PlacePopulationModel;
export {};
