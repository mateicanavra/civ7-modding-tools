/**
 * @file model-city-details.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Data model for Detailed break down of a cities status
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare const UpdateCityDetailsEventName: "update-city-details";
export interface DistrictData {
    name?: string;
    description?: string;
    location: PlotCoord;
    constructibleData: ConstructibleData[];
}
export interface SourceContext {
    id: ComponentID;
    location: float2;
}
export interface ConstructibleContext {
    id: ConstructibleID;
    location: float2;
}
export interface ConstructibleData extends ConstructibleContext {
    type: string;
    name: string;
    icon: string;
    iconContext: string;
    damaged: boolean;
    yieldMap?: Map<string, ConstructibleYieldData>;
    maintenanceMap?: Map<string, ConstructibleYieldData>;
}
export interface WarehouseData {
    name: string;
    icon: string;
    total: number;
    breakdown?: Map<string, WarehouseData>;
}
interface ConstructibleYieldData {
    name: string;
    value: number;
    icon?: string;
    iconContext?: string;
}
export interface YieldData {
    name: string;
    value: number;
    valueType?: GameValueDisplayTypes;
    icon?: string;
    iconContext?: string;
    tooltip?: string;
    sourceContext?: SourceContext;
    children: YieldData[];
}
export interface ConnectedSettlementData {
    id: ComponentID;
    name: string;
    isTown: boolean;
    projectName?: string;
    projectType?: ProjectType;
    projectSendsFood?: boolean;
    foodExport: number;
    foodExportPotential: number;
}
declare class CityDetailsModel {
    name: string;
    isTown: boolean;
    specialistPerTile: number;
    currentCitizens: number;
    urbanPopulation: number;
    ruralPopulation: number;
    specialistCount: number;
    turnsToNextCitizen: number;
    currentTownFocus: string;
    hasTownFocus: boolean;
    happinessPerTurn: number;
    hasUnrest: boolean;
    foodPerTurn: number;
    foodToGrow: number;
    foodCurrent: number;
    foodExported: number;
    foodExportPotential: number;
    buildings: DistrictData[];
    improvements: ConstructibleData[];
    wonders: ConstructibleData[];
    constructibleCounts: any;
    warehouseCounts: any;
    yields: YieldData[];
    isBeingRazed: boolean;
    getTurnsUntilRazed: number;
    treasureFleetText: string;
    connectedSettlements: ConnectedSettlementData[];
    connectedSettlementFood: {
        name: string;
        amount: number;
    }[];
    nonExportingProjects: ProjectType[];
    private onUpdate?;
    set updateCallback(callback: (model: CityDetailsModel) => void);
    constructor();
    private onCityPopulationchanged;
    private onCitySelectionChanged;
    private onCityGrowthModeChanged;
    private reset;
    private addYieldsToHierarchy;
    private addIncomeHierarchy;
    private addDeductionsHierarchy;
    private updateGate;
    private buildConnectionData;
    private buildSendingFoodData;
    private getValidGreatPeople;
    private updateUniqueQuarterData;
    private addYieldSteps;
    private setYieldAndGetIcon;
    private addYieldAndGetIconForConstructible;
}
declare const CityDetails: CityDetailsModel;
export { CityDetails as default };
