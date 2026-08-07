/**
 * @copyright 2024-2025 Firaxis Games
 * @description Helper functions for the production chooser
 * @file production-chooser-helpers.ts
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { ConstructibleOperationResult } from "/base-standard/ui/production-chooser/production-chooser-operations.js";
import { AdvisorUtilities } from "/base-standard/ui/tutorial/advisor-utilities.js";
import { YieldLike } from "/base-standard/ui/utilities/utilities-city-yields.js";
export declare enum ProductionPanelCategory {
    BUILDINGS = "buildings",
    UNITS = "units",
    PROJECTS = "projects",
    WONDERS = "wonders"
}
export interface ProductionChooserUnitStat {
    name: string;
    icon: string;
    value: string;
}
export type ProductionChooserYield = YieldLike & {
    iconId: string;
    name: string;
    icon: string;
    value: string;
};
export type YieldValue = YieldLike & {
    value: number;
};
export interface ProductionChooserItemData {
    infoDisplayType?: ProductionPanelBuildingInfoDisplayType;
    type: string;
    category: ProductionPanelCategory;
    name: string;
    description?: string;
    cost: number;
    productionCost?: number;
    turns: number;
    showTurns: boolean;
    showCost: boolean;
    insufficientFunds: boolean;
    error?: string;
    ageless?: boolean;
    locations?: string;
    interfaceMode?: string;
    disabled?: boolean;
    secondaryDetails?: string;
    repairDamaged?: boolean;
    tags?: string[];
    baseYields?: YieldValue[];
    canGetWarehouseBonuses?: boolean;
    warehouseCount?: number;
    canGetAdjacencyBonuses?: boolean;
    highestAdjacency?: number;
    recommendations?: AdvisorUtilities.AdvisorClassObject[];
}
export interface LastProductionItemData {
    typeHash: HashId;
    name: string;
    type: string;
    isUnit: boolean;
    isProject?: boolean;
    details: {
        icon: string;
        value: string;
    }[];
}
/**
 * Select the next city for the current player.
 */
export declare const SelectNextCity: () => void;
/**
 * Select the previous city for the current player.
 */
export declare const SelectPrevCity: () => void;
/**
 * Get the next city ID for the player of a given city.
 * @param cityID The ComponentID of a city.
 * @returns The next city's ComponentID, or null if the player has no cities.
 */
export declare const GetNextCityID: (cityID: ComponentID) => ComponentID | null;
/**
 * Get the previous city ID for the player of a given city.
 * @param cityID The ComponentID of a city.
 * @returns The previous city's ComponentID, or null if the player has no cities.
 */
export declare const GetPrevCityID: (cityID: ComponentID) => ComponentID | null;
export declare const GetUnitStatsFromDefinition: (definition: UnitDefinition) => ProductionChooserUnitStat[];
export declare const GetCurrentBestTotalYieldForConstructible: (city: City, constructibleType: ConstructibleType) => ProductionChooserYield[];
export declare const GetSecondaryDetailsHTML: (items: {
    icon: string;
    value: string;
    name: string;
}[]) => string;
interface GetConstructibleItemDataParams {
    /** The constructible definition to get data for */
    constructible: ConstructibleDefinition;
    /** The city to get the data for */
    city: City;
    /** The operation result of the constructible */
    operationResult: ConstructibleOperationResult;
    /** Whether to hide the item if it is unavailable */
    hideIfUnavailable?: boolean;
    /** Whether to show the best possible yields or to show base yields */
    infoDisplayType: ProductionPanelBuildingInfoDisplayType;
}
/**
 * returns the data needed to display a constructible item in the production chooser
 */
export declare const GetConstructibleItemData: ({ constructible, city, operationResult, hideIfUnavailable, infoDisplayType, }: GetConstructibleItemDataParams) => ProductionChooserItemData | null;
/**
 * returns the node required to unlocked the given nodeType
 */
export declare const CanPlayerUnlockNode: (nodeType: ProgressionTreeNodeType | undefined, playerId: PlayerId) => boolean;
export declare const CreateProductionChooserItem: () => any;
export interface UniqueQuarterInfo {
    uniqueQuarterDef: UniqueQuarterDefinition;
    buildingOneDef: ConstructibleDefinition;
    buildingTwoDef: ConstructibleDefinition;
}
export declare const GetUniqueQuartersForPlayer: (playerId: PlayerId) => UniqueQuarterInfo[];
export declare const GetNumUniqueQuarterBuildingsCompleted: (city: City, uq: UniqueQuarterDefinition) => 2 | 1 | 0;
export declare const ShouldShowUniqueQuarter: (...results: OperationResult[]) => any;
export declare const GetProductionItems: (city: City | null, recommendations: BuildRecommendation[], playerGoldBalance: number, isPurchase: boolean, viewHidden: boolean, uniqueQuarterInfos: UniqueQuarterInfo[]) => Record<ProductionPanelCategory, ProductionChooserItemData[]>;
/**
 * performs the engine calls to actually produce/purchase a unit, building, etc
 */
export declare const Construct: (city: City, item: ProductionChooserItemData, isPurchase: boolean) => boolean;
export declare const RepairConstruct: (city: City, item: ProductionChooserItemData, isPurchase: boolean) => void;
export declare const GetCityBuildReccomendations: (city: City | null) => BuildRecommendation[];
export interface TownFocusItem {
    name: string;
    description: string;
    growthType: GrowthTypes;
    projectType: ProjectType;
    tooltipDescription: string;
}
export declare const GetTownFocusItems: (cityID: ComponentID) => TownFocusItem[];
export declare const GetCurrentTownFocus: (cityID: ComponentID, currentGrowthType: GrowthTypes | undefined, currentProjectType: ProjectType | undefined) => any;
/**
 * Send request to change the city's growth type.
 * @param growthType
 * @returns if request is completed and menu can close
 */
export declare const SetTownFocus: (cityID: ComponentID, sType: string, projectType: string) => any;
export declare const GetTownFocusBlp: (growthType: string | number | null, projectType: string | number | null) => any;
export declare const GetLastProductionData: (cityID: ComponentID) => LastProductionItemData | undefined;
export {};
