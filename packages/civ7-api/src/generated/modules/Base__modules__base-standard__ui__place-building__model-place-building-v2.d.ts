/**
 * @file model-place-building-v2.ts
 * @copyright 2025, Firaxis Games
 * @description Data model for placing a building on a plot
 */
import { YieldBonusInfo } from "/base-standard/ui/building-placement/building-placement-manager.js";
import { YieldBarEntry } from "/base-standard/ui/yield-bar-base/yield-bar-base.js";
interface constructibleInfo {
    name: string;
    type: string;
    shouldShow: boolean;
    details: string[];
    showPlacementIcon: boolean;
    showRepairIcon: boolean;
    collectionIndex: number;
}
declare class PlaceBuildingModelV2 {
    hasSelectedPlot: boolean;
    isExpanded: boolean;
    cityName: string;
    headerText: string;
    isRepairing: boolean;
    showExpandedView: boolean;
    selectedConstructibleInfo: constructibleInfo;
    selectPlotMessage: string;
    firstConstructibleSlot: constructibleInfo;
    secondConstructibleSlot: constructibleInfo;
    afterFirstConstructibleSlot: constructibleInfo;
    afterSecondConstructibleSlot: constructibleInfo;
    shouldShowOverbuild: boolean;
    overbuildText: string;
    overbuildConstructibleSlot: constructibleInfo;
    shouldShowUniqueQuarterText: boolean;
    uniqueQuarterText: string;
    uniqueQuarterWarning: string;
    shouldShowAdjacencyBonuses: boolean;
    adjacencyBonuses: string[];
    placementHeaderText: string;
    tileConversionText: string;
    private selectedPlotIndex;
    currentYieldTotals: YieldBarEntry[];
    currentYieldTotalsJSONd: string;
    afterYieldTotals: YieldBarEntry[];
    afterYieldTotalsJSONd: string;
    afterYieldDeltas: YieldBarEntry[];
    afterYieldDeltasJSONd: string;
    adjacencyYieldTotals: YieldBarEntry[];
    adjacencyYieldTotalsJSONd: string;
    beforeBonuses: YieldBonusInfo[];
    beforeBonusesEmpty: boolean;
    beforeBreakdownEmpty: boolean;
    afterBonuses: YieldBonusInfo[];
    afterBonusesEmpty: boolean;
    afterBreakdownEmpty: boolean;
    beforeTileType: string;
    beforeTileIcon: string;
    afterTileType: string;
    afterTileIcon: string;
    showBeforeMaintenance: boolean;
    beforeMaintenance: string[];
    showAfterMaintenance: boolean;
    afterMaintenance: string[];
    constructor();
    private _OnUpdate?;
    set updateCallback(callback: (model: PlaceBuildingModelV2) => void);
    updateGate: any;
    private willBecomeQuarter;
    private getBeforeYieldBonuses;
    private getAfterYieldBonuses;
    private getConstructibleInfoByComponentID;
    private onSelectedPlotChanged;
    private onConstructibleChanged;
}
export declare const PlaceBuildingV2: PlaceBuildingModelV2;
export {};
