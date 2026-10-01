/**
 * model-resource-allocation.ts
 * @copyright 2022-2023, Firaxis Games
 * @description Resource Allocation data model
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export interface ResourceEntry {
    selected: boolean;
    disabled: boolean;
    queued: boolean;
    bonusResourceSlots: number;
    type: string;
    classType: string;
    classTypeIcon: string | null;
    name: string;
    origin: string;
    bonus: string;
    value: number;
    count: number;
    isInTradeNetwork: boolean;
    isBeingRazed: boolean;
    canSpawnTreasureFleet: boolean;
}
export interface EmptySlot {
    tooltip: string;
    id: ComponentID;
}
export interface BasicCityYieldData {
    label: string;
    value: string;
    type?: string;
}
export interface CityEntry {
    name: string;
    settlementType: string;
    settlementIcon: string;
    settlementTypeName: string;
    settlementAdditionalInfo: string;
    hasFactory: boolean;
    hasFactorySlot: boolean;
    hasTreasureResources: boolean;
    treasureVictoryPoints: number;
    globalTurnsUntilTreasureGenerated: number;
    turnsUntilTreasureGenerated: string;
    id: ComponentID;
    yields: BasicCityYieldData[];
    currentResources: ResourceEntry[];
    visibleResources: ResourceEntry[];
    treasureResources: ResourceEntry[];
    factoryResources: ResourceEntry[];
    queuedResources: ResourceEntry[];
    emptySlots: EmptySlot[];
    allocatedResources: number;
    resourceCap: number;
    isInTradeNetwork: boolean;
    isBeingRazed: boolean;
}
declare class ResourceAllocationModel {
    private onUpdate?;
    private _selectedResource;
    private _hasSelectedAssignedResource;
    private _selectedResourceClass;
    private selectedCityID;
    private allResources;
    private isAllResourcesInit;
    private queuedResources;
    private _latestResource;
    private _empireResources;
    private _uniqueEmpireResources;
    private _allAvailableResources;
    private _availableBonusResources;
    private _availableResources;
    private _availableFactoryResources;
    private _treasureResources;
    private _uniqueTreasureResources;
    private _availableCities;
    private _selectedCityResources;
    shouldShowSelectedCityResources: boolean;
    shouldShowEmpireResourcesDetailed: boolean;
    shouldShowAvailableResources: boolean;
    _isResourceAssignmentLocked: boolean;
    private updateGate;
    constructor();
    set updateCallback(callback: (model: ResourceAllocationModel) => void);
    get playerId(): PlayerId;
    get empireResources(): ResourceEntry[];
    get uniqueEmpireResources(): ResourceEntry[];
    get allAvailableResources(): ResourceEntry[];
    get availableResources(): ResourceEntry[];
    get availableBonusResources(): ResourceEntry[];
    get availableFactoryResources(): ResourceEntry[];
    get treasureResources(): ResourceEntry[];
    get uniqueTreasureResources(): ResourceEntry[];
    get availableCities(): CityEntry[];
    get selectedCityResources(): CityEntry | null;
    get latestResource(): ResourceEntry | null;
    get selectedResource(): number;
    get hasSelectedAssignedResource(): boolean;
    get showUnassignResourceSlot(): boolean;
    get selectedResourceClass(): string | null;
    get isResourceAssignmentLocked(): boolean;
    hasSelectedResource(): boolean;
    hasQueuedResources(): boolean;
    private update;
    private setResourceCount;
    private createUniqueResourceArray;
    private determineShowAvailableResources;
    clearSelectedResource(): void;
    selectAvailableResource(selectedResourceValue: number, selectedResourceClass: string): void;
    selectAssignedResource(selectedResourceValue: number, selectedResourceClass: string): void;
    private selectResource;
    focusCity(selectedCityID: number): void;
    selectCity(selectedCityID: number): void;
    updateResources(): void;
    toggleMoreInfo(): void;
    toggleEmpireResourceDetails(): void;
    canMakeResourceAssignmentRequest(cityIdData: number): any;
    unassignResource(selectedResourceValue: number): void;
    private isEntrySupportSelectingResource;
    isCityEntryDisabled(entryEntryId: number): boolean;
    private onResourceAssigned;
    private onResourceUnassigned;
    private onResourceCapChanged;
    private onTradeRouteAddedToMap;
    private inNetwork;
    private getCityYieldData;
    private static getUnassignedTooltip;
    private resourceTooltipCache;
    private originCityTooltipCache;
    private getResourceTooltip;
}
declare const ResourceAllocation: ResourceAllocationModel;
export { ResourceAllocation as default };
