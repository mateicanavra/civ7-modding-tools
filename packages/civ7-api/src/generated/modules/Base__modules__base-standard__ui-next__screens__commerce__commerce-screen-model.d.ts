/**
 * @file commerce-screen-model.ts
 * @copyright 2025, Firaxis Games
 * @description SolidJS model for the commerce screen.
 */
import { Accessor, JSXElement, Setter } from "solid-js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { CollapsibleContainerProps } from "/core/ui-next/components/collapsible-container.js";
import { OrnateFrameProps } from "/core/ui-next/components/ornate-panel.js";
import { TabItemProps } from "/core/ui-next/components/tab.js";
import { ResourceProps } from "/base-standard/ui-next/components/framed-resource.js";
import { GamepadTrayItem } from "/base-standard/ui-next/components/gamepad-tray-item-provider.js";
import { YieldDeltaProps } from "/base-standard/ui-next/components/yield-delta.js";
export interface EmpireResourceData {
    resourceValue: number;
    iconSrc: string;
    title: string;
    description: string[];
    originLeaderIds: PlayerId[];
    resourceOriginData: ResourceOriginData[];
    tooltips: Record<PlayerId, string>;
    isTreasure: boolean;
    isCombatResource: boolean;
    amount: number;
    type: string;
}
interface resourceOriginCity {
    localisedName: string;
    contributionCount: number;
}
interface ResourceOriginData {
    leaderId: number;
    resourceOriginCities: Record<number, resourceOriginCity>;
}
export interface TreasureResourceData {
    resourceProps?: ResourceProps;
    tooltip: string;
    isImproved: boolean;
    location: float2;
    isDamaged: boolean;
}
export interface TreasureFleetData {
    cityIcon: string;
    cityName: string;
    resources: TreasureResourceData[];
    progress: number;
    progressGoal: number;
    resourceValue: number;
    numImproved: number;
    treasureFleetText: JSXElement;
    cityID: ComponentID;
    statuses: CommerceCriteriaStatusEntry[];
    isDistantLand: boolean;
}
export interface CommerceCriteriaStatusEntry {
    statusText: string;
    isNegative: boolean;
    tooltipKey: string;
    appliesToCurrentCiv: boolean;
}
export declare enum TradeRouteAvailabiltyType {
    Unset = 0,
    Established = 1,
    Available = 2,
    Unavailable = 3
}
export interface TradeRouteData {
    availability: TradeRouteAvailabiltyType;
    cityName: string;
    cityIcon: string;
    isCityState: boolean;
    domainString: string;
    incomingResources: ResourceProps[];
    yieldElement: JSXElement;
    relationshipChange: number;
    leaderId: PlayerId;
    cityID: ComponentID;
    statuses: CommerceCriteriaStatusEntry[];
    fullText: string;
}
export interface TradeRouteSectionData {
    tradeRoutes: TradeRouteData[];
    collapsibleContainerData: CollapsibleContainerProps;
    emptyDescription: string;
}
export interface TreasureTabData {
    sections: TreasureSection[];
}
interface TreasureSection {
    collapsibleContainerData: CollapsibleContainerProps;
    fleets: TreasureFleetData[];
    emptyTitle?: string;
    emptyDescription?: string;
    generatingConvoys: boolean;
}
export interface TradeRouteTabData {
    tradeRouteSections: TradeRouteSectionData[];
}
export interface EmpireTabData {
    empireResourceData: EmpireResourceData[];
}
export interface YieldBonus {
    iconSrc: string;
    bonusAmount: number;
}
export interface AvailableResourceSubSection {
    title: string;
    resourceSlotData: ResourceSlotData[];
    type: string;
}
export interface AvailableResourceSectionData {
    collapsibleContainerData: CollapsibleContainerProps;
    subSections: AvailableResourceSubSection[];
    isConnectedToTradeNetwork: boolean;
    emptySubsectionsDescription: string;
}
export interface FactoryResourceData {
    description: string;
    icon: string;
    resourceValue: number;
    name: string;
}
export interface FactoryResourceDropdownData {
    cityID: ComponentID;
    hasFactory: boolean;
    isProducingFactoryResource: boolean;
    resource: ResourceProps | null;
    unassignResourceTooltip?: string;
}
export interface ResourceSlotData {
    resourceProps: ResourceProps;
    resourceValue: number;
    resourceType: string;
    cityID?: ComponentID;
    yieldTypes: string[];
    canSwapWithSelectedResource: Accessor<boolean>;
}
export declare enum ResourceContainerSelectionState {
    NotSelecting = 0,
    CanSelect = 1,
    CanNotSelect = 2
}
export interface CommerceCityNameData {
    settlementIcon: string;
    settlementName: string;
    settlementTypeName: string;
    settlementDistanceTypeName: string;
    isTown: boolean;
    townFocusIcon: string;
    townFocusName: string;
    hasRail: boolean;
    warehouseCount: number;
    tradeConnectionCount: number;
    waterCount: number;
}
export interface CommerceCityResourceData {
    settlementNameData: CommerceCityNameData;
    cityID: ComponentID;
    isDistantLands: boolean;
    baseYields: YieldDeltaProps[];
    yieldDeltas: YieldDeltaProps[];
    factoryResourceData: FactoryResourceDropdownData;
    slottedResources: ResourceSlotData[];
    availableSlots: number[];
    canAssignSelectedResourceToSettlement: Accessor<boolean>;
}
export interface SlottedResourceSectionData {
    collapsibleContainerData: CollapsibleContainerProps;
    cityResources: CommerceCityResourceData[];
    emptyResourcesDescription: string;
}
export interface ResourceTabData {
    unslottedBonuses: YieldBonus[];
    availableResourceSectionData: AvailableResourceSectionData[];
    slottedResourceSectionData: SlottedResourceSectionData[];
}
export interface CommerceScreenData {
    treasureTabData: TreasureTabData;
    tradeRouteTabData: TradeRouteTabData;
    empireTabData: EmpireTabData;
    resourceTabData: ResourceTabData;
    ornatePanelData: OrnateFrameProps;
}
export interface SelectedResourceData {
    resourceValue: number;
    cityID?: ComponentID;
}
export declare enum TradeRouteSortType {
    Unset = 0,
    Resource = 1,
    LeaderName = 2,
    LeaderRelationship = 3,
    SettlementName = 4,
    SettlementType = 5
}
export interface TradeRouteSortData {
    type: TradeRouteSortType;
    locKey: string;
}
declare enum ResourceSettlementSortType {
    SettlementType = 0,
    Name = 1,
    OpenSlots = 2,
    TotalSlots = 3,
    WarehouseCount = 4,
    DistanceType = 5,
    RailConnected = 6,
    HasFactory = 7,
    Food = 8,
    Production = 9,
    Gold = 10,
    Science = 11,
    Culture = 12,
    Happiness = 13,
    Influence = 14
}
export declare function gamepadLog(...args: unknown[]): void;
export interface CommerceScreenContextModel {
    data: CommerceScreenData;
    clickAvailableResource: (resourceData: SelectedResourceData) => void;
    slotSelectedResource: (cityID: ComponentID, targetResourceValue?: number) => void;
    clickSlottedResource: (resourceData: SelectedResourceData) => void;
    clickCloseButton: () => void;
    clickUnimprovedTreasure: (location: float2) => void;
    clickTreasureFleet: (cityID: ComponentID) => void;
    unslotSelectedResource: () => void;
    deselectSelectedResource: () => void;
    clickCityName: (cityID: ComponentID) => void;
    isResourceSelected: boolean;
    isSlottingAvailable: boolean;
    selectedResource: Accessor<SelectedResourceData>;
    prevSelectedResource: Accessor<SelectedResourceData>;
    getSelectedResourceProps(): ResourceProps | undefined;
    focusedResource: Accessor<SelectedResourceData>;
    setFocusedResource: Setter<SelectedResourceData>;
    selectedSettlementId: Accessor<ComponentID | undefined>;
    prevSelectedSettlementId: Accessor<ComponentID | undefined>;
    setSelectedSettlementId: (cityID: ComponentID | undefined) => void;
    focusedSettlementId: Accessor<ComponentID | undefined>;
    setFocusedSettlementId: Setter<ComponentID | undefined>;
    ghostResourceFocused: Accessor<boolean>;
    setGhostResourceFocused: Setter<boolean>;
    selectedTradeRouteId: Accessor<ComponentID | undefined>;
    setSelectedTradeRouteId: Setter<ComponentID | undefined>;
    selectedEmpireResource: Accessor<number | undefined>;
    setSelectedEmpireResource: Setter<number | undefined>;
    selectedTreasureConvoyId: Accessor<ComponentID | undefined>;
    setSelectedTreasureConvoyId: Setter<ComponentID | undefined>;
    isFirstAssignableCity: (key: ComponentID | undefined) => boolean;
    selectedResourceFilter: Accessor<string | undefined>;
    setSelectedResourceFilter: Setter<string | undefined>;
    resourceSettlementSortItems: Record<string, ResourceSettlementSortType>;
    selectedSettlementSortType: Accessor<ResourceSettlementSortType>;
    setSelectedSettlementSortType: Setter<ResourceSettlementSortType>;
    selectedTradeRouteSorting: Accessor<TradeRouteSortData | undefined>;
    setSelectedTradeRouteSorting: Setter<TradeRouteSortData | undefined>;
    clearFactoryResources: (CityID: ComponentID) => void;
    canSelectResource: (resourceSlot: ResourceSlotData) => boolean;
    canDropResourceOnTarget: (resourceSlot: ResourceSlotData, targetCityID?: ComponentID, targetResourceValue?: number) => boolean;
    canAssignSelectedResourceToSettlement: (CityID: ComponentID) => boolean;
    getResourceContainerSelectionState: (isConnectedToTradeNettwork: boolean, cityData?: {
        cityID: ComponentID;
        canAssignResourceToSettlement: Accessor<boolean>;
    }) => ResourceContainerSelectionState;
    resourceIsConnectedToTradeNetwork(resourceValue: number): boolean;
    cityIsConnectedToTradeNetwork(cityID: ComponentID): boolean;
    clearAllResources: (cityID?: ComponentID) => void;
    getGamepadTrayItems: () => GamepadTrayItem[];
    wasResourceJustSlotted: (resourceValue: number) => boolean;
    lastSlottedResourceValues: Accessor<number[]>;
    setLastSlottedResourceValues: Setter<number[]>;
    resourceSwapTarget: Accessor<number>;
    setResourceSwapTarget: Setter<number>;
    isInSortAndFilterMode: Accessor<boolean>;
    setIsInSortAndFilterMode: Setter<boolean>;
    settlementHasSlottedResources: (cityID: ComponentID) => undefined | boolean;
    onTabChanged: (tab: TabItemProps) => void;
    hasUnassignedResources: () => boolean;
    tradeRouteSearch: (text: string) => Set<string>;
}
export declare function createCommerceScreenModel(): any;
export declare function getCityName(cityID: ComponentID | undefined, context?: "settlement" | "resource"): string;
export declare function getResourceName(resource: SelectedResourceData | undefined): string;
export declare const CommerceScreenModel: any;
export declare const CommerceScreenContext: any;
export declare function useCommerceScreenContext(): any;
export {};
