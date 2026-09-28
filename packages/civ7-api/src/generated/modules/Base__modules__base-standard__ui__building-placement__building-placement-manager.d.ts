/**
 * @file building-placement-manager.ts
 * @copyright 2023, Firaxis Games
 * @description Helper class to keep track of building being placed and other shared building placement data
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { YieldLike } from "/base-standard/ui/utilities/utilities-city-yields.js";
export declare const BuildingPlacementHoveredPlotChangedEventName: "building-placement-hovered-plot-changed";
export declare class BuildingPlacementHoveredPlotChangedEvent extends CustomEvent<never> {
    constructor();
}
export declare const BuildingPlacementSelectedPlotChangedEventName: "building-placement-selected-plot-changed";
export declare class BuildingPlacementSelectedPlotChangedEvent extends CustomEvent<never> {
    constructor();
}
export declare const BuildingPlacementConstructibleChangedEventName: "building-placement-constructible-changed";
export declare class BuildingPlacementConstructibleChangedEvent extends CustomEvent<never> {
    constructor();
}
export type YieldChangeInfo = YieldLike & {
    text: string;
    iconURL: string;
    yieldChange: number;
};
export interface AdjacencyData {
    value: number;
    name: string;
    type: string;
    directionType: DirectionTypes;
    directionName: string;
}
export interface YieldBonusInfo {
    description: string;
    bonuses: string[];
}
declare class BuildingPlacementManagerClass {
    private static instance;
    private _cityID;
    get cityID(): Readonly<ComponentID | null>;
    get city(): City | null;
    private uniqueQuarters;
    private _currentQuarter;
    get currentQuarter(): Readonly<UniqueQuarterDefinition | null>;
    private _currentConstructible;
    get currentConstructible(): Readonly<ConstructibleDefinition | null>;
    /** Placement data for all possible constructibles */
    private _allPlacementData;
    get allPlacementData(): Readonly<PlacementData | undefined>;
    private set allPlacementData(value);
    private selectedPlacementData;
    private _potentialUniqueQuarterPlots;
    get potentialUniqueQuarterPlots(): {
        plotID: number;
        uniqueQuarterDef: UniqueQuarterDefinition;
    }[];
    private _uniqueQuarterPlots;
    get uniqueQuarterPlots(): PlotIndex[];
    private _urbanPlots;
    get urbanPlots(): PlotIndex[];
    private _quarterPlots;
    get quarterPlots(): PlotIndex[];
    private _developedPlots;
    get developedPlots(): PlotIndex[];
    private _expandablePlots;
    get expandablePlots(): PlotIndex[];
    private _hoveredPlotIndex;
    get hoveredPlotIndex(): Readonly<PlotIndex | null>;
    set hoveredPlotIndex(plotIndex: PlotIndex | null);
    private _selectedPlotIndex;
    get selectedPlotIndex(): Readonly<PlotIndex | null>;
    set selectedPlotIndex(plotIndex: PlotIndex | null);
    isRepairing: boolean;
    initializePlacementData(cityID: ComponentID): void;
    selectPlacementData(cityID: ComponentID, operationResult: OperationResult, constructible: ConstructibleDefinition): void;
    private isPlotIndexSelectable;
    constructor();
    getTotalYieldChangesFromPlacementData(placementPlotData: PlacementPlotData, excludeOtherCities?: boolean): YieldChangeInfo[];
    getTotalYieldChanges(plotIndex: number): YieldChangeInfo[];
    getCityYieldChanges(plotIndex: number): YieldChangeInfo[];
    getPrimaryBuildingYields(): YieldType[];
    getPlotYieldChanges(plotIndex: number): YieldChangeInfo[] | undefined;
    getAdjacencyYieldChanges(plotIndex: number): YieldChangeInfo[];
    private getDirectionString;
    getPlacementPlotData(plotIndex: number): PlacementPlotData | undefined;
    getPlacementChangeDetails(plotIndex: number, sourceType?: YieldSourceTypes): YieldChangeData[];
    getOverbuildConstructibleID(plotID: number): any;
    reset(): void;
    isValidPlacementPlot(plotIndex: number): boolean;
    willBecomeQuarter(otherConstructibleType: string): boolean;
    getWillBecomeQuarterPlots(): PlotIndex[];
    findExistingUniqueBuilding(uniqueQuarterDef: UniqueQuarterDefinition): PlotIndex;
    getBestYieldForConstructible(cityID: ComponentID, constructibleDef: ConstructibleDefinition): number[];
    getImprovementYieldChanges(type: ConstructibleType, plotIndex: PlotIndex): PlacementPlotData | undefined;
    canGetWarehouseBonuses(type: ConstructibleType): boolean;
    getNumberOfWarehouseBonuses(typeHash: number): number;
    canGetAdjacencyBonuses(type: ConstructibleType): boolean;
    getHighestAdjacencyBonus(typeHash: number): number;
    getYieldBonusBreakdownFromPlacementData(placementData: PlacementPlotData): YieldBonusInfo[];
    getDirectionDescrption(sourcePlotIndex: PlotIndex, targetPlotIndex: PlotIndex, isIncoming: boolean): "LOC_BUILDING_PLACEMENT_FROM_EAST" | "LOC_BUILDING_PLACEMENT_FROM_WEST" | "LOC_BUILDING_PLACEMENT_FROM_NORTHEAST" | "LOC_BUILDING_PLACEMENT_FROM_NORTHWEST" | "LOC_BUILDING_PLACEMENT_FROM_SOUTHEAST" | "LOC_BUILDING_PLACEMENT_FROM_SOUTHWEST" | "" | "LOC_BUILDING_PLACEMENT_TO_OTHER_SETTLEMENTS" | "LOC_BUILDING_PLACEMENT_TO_EAST" | "LOC_BUILDING_PLACEMENT_TO_WEST" | "LOC_BUILDING_PLACEMENT_TO_NORTHEAST" | "LOC_BUILDING_PLACEMENT_TO_NORTHWEST" | "LOC_BUILDING_PLACEMENT_TO_SOUTHEAST" | "LOC_BUILDING_PLACEMENT_TO_SOUTHWEST";
    private getToDirectionDescrption;
    private getFromDirectionDescrption;
}
export declare const BuildingPlacementManager: BuildingPlacementManagerClass;
export {};
