/**
 * plot-tooltip/helpers.ts
 * @copyright 2025, Firaxis Games
 * @description Helper functions for the plot tooltip component.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
/** Base props shared by all plot tooltip content components. */
export interface PlotTooltipBaseProps {
    /** The X,Y coordinates of the plot */
    plotCoord: float2;
    /** Whether to show debug information */
    showDebug?: boolean;
    /** The city that owns this plot, or null if unowned. */
    owningCity: City | null;
}
/** Information about a constructible on a plot */
export interface PlotTooltipConstructibleInfo {
    location: float2;
    type: string;
    age: number;
    isAgeless: boolean;
    isBuilding: boolean;
    isWonder: boolean;
    isImprovement: boolean;
    uniqueQuarterType: UniqueQuarterType;
    damaged: boolean;
    complete: boolean;
    overbuildable: boolean;
    title: string;
    description?: string;
    icon: string;
    sortOrder: number;
}
/** Visible plot effect information for tooltip rendering. */
export interface PlotTooltipEffectInfo {
    name: string;
    plotEffectType: string;
    effectType: PlotEffectType;
    eventClass?: string;
    /** Localization key for the source `RandomEvent.Name`, when this effect was created by one. */
    eventName?: string;
    duration: number;
    onlyVisibleToOwner: boolean;
    owner: PlayerId;
}
/** Get current age's chronology index */
export declare function getCurrentAge(): number;
/** Get set of ageless type identifiers */
export declare function getAgelessTypes(): Set<string>;
/**
 * Get the terrain label for a plot location.
 * @param location The X,Y plot location
 * @param showDebug Whether to include debug type info
 */
export declare function getTerrainLabel(location: float2, showDebug: boolean): string;
/**
 * Get the biome label for a plot location.
 * @param location The X,Y plot location
 * @param showDebug Whether to include debug type info
 */
export declare function getBiomeLabel(location: float2, showDebug: boolean): string;
export interface VolcanoFeatureInfo {
    /** The proper name of the volcano (e.g. "Hunga Tonga - Hunga Ha'apai"), or empty if unnamed. */
    name: string;
    /** Whether the volcano is currently active. */
    active: boolean;
    eruptionInfo?: VolcanoEruptionInfo;
}
export interface FeatureInfo {
    type: FeatureType;
    label: string;
    tooltip: string;
    isNaturalWonder: boolean;
    volcano?: VolcanoFeatureInfo;
}
/**
 * Get the feature label and tooltip for a plot location.
 * @param location The X,Y plot location
 * @param plotIndex The plot index for the location
 */
export declare function getFeatureInfo(location: float2, plotIndex: number): FeatureInfo;
/**
 * Get the continent name for a plot location.
 * @param location The X,Y plot location
 */
export declare function getContinentName(location: float2): string;
/**
 * Get the river label for a plot location.
 * @param location The X,Y plot location
 */
export declare function getRiverLabel(location: float2): string;
export interface RouteData {
    name: string;
    type: string;
}
/**
 * Get the route data for a plot location.
 * @param location The X,Y plot location
 */
export declare function getRouteData(location: float2): RouteData | null;
/**
 * Get the resource at a plot location.
 * @param location The X,Y plot location
 */
export declare function getResource(location: float2): ResourceDefinition | null;
/**
 * Get the owning settlement/city name for a plot location.
 * @param location The X,Y plot location
 */
export declare function getSettlementName(owningCity: City | null): any;
/**
 * Get specialist description for a plot.
 * @param location The X,Y plot location
 */
export declare function getSpecialistDescription(location: float2, owningCity: City | null): {
    key: string;
    args: LocalizedTextArgument[];
} | null;
/**
 * Get constructible info for a plot.
 * @param constructible The constructible component ID
 * @param plotCoordinate The plot coordinate
 * @param currentAge Current age chronology index
 * @param agelessTypes Set of ageless type identifiers
 */
export declare function getConstructibleInfo(constructible: ComponentID, plotCoordinate: float2, currentAge: number, agelessTypes: Set<string>, overbuildableConstructibleTypes: ConstructibleType[]): PlotTooltipConstructibleInfo | null;
interface PlotYield {
    yieldType: string;
    amount: number;
    name: string;
}
/**
 * Get yield data for a plot.
 * @param location The X,Y plot location
 * @param playerID The player ID
 */
export declare function getPlotYields(location: float2, playerID: PlayerId): PlotYield[];
/**
 * Get district health information for a plot.
 * @param location The X,Y plot location
 */
export declare function getDistrictHealthInfo(location: float2): {
    currentHealth: number;
    maxHealth: number;
    isUnderSiege: boolean;
    canShow: boolean;
} | null;
export interface PlotOwnerInfo {
    isIndependent: boolean;
    civName: string;
    playerName: string;
    relationship?: string;
    cityStateBonus?: string;
    conquerorInfo?: {
        isIndependent: boolean;
        name: string;
    };
    /** The suzerain's player ID when the plot is owned by a city-state that has a suzerain. Used to show the suzerain's leader portrait. */
    suzerainId?: PlayerId;
}
/**
 * Get player ownership info for a plot.
 * @param location The X,Y plot location
 * @param playerID The owner player ID
 */
export declare function getOwnerInfo(location: float2, playerID: PlayerId | null): PlotOwnerInfo | null;
/**
 * The relationship between a unit's owner and the local player.
 * If the owner is a minor or independent, this will include the relationship with their suzerain or independent status.
 */
export interface UnitOwnerRelationship {
    name: string;
    hostile: boolean;
}
export interface UnitInfoSectionProps {
    unit: Unit;
    unitIcon?: string;
    ownerName: string;
    civName: string;
    civSymbol?: string;
    relationship?: UnitOwnerRelationship;
    isMinorOrIndependent: boolean;
    isCivilian: boolean;
    isAtWarWithOwner: boolean;
    treasureFleet?: {
        originCityName: string;
        points: number;
    };
}
/**
 * Get unit info for display in the tooltip.
 * @param location The X,Y plot location
 */
export declare function getUnitEntries(location: float2, localPlayer: PlayerLibrary): UnitInfoSectionProps[];
/**
 * Get plot effects for a plot.
 * @param plotIndex The plot index
 */
export declare function getVisiblePlotEffects(plotIndex: number): PlotTooltipEffectInfo[];
/**
 * Get treasure convoy generation info for the city owning a plot.
 * Returns turns remaining if the owning city is actively generating a convoy, otherwise null.
 * @param location The X,Y plot location
 */
export declare function getTreasureConvoyInfo(owningCity: City | null): {
    turnsRemaining: number;
} | null;
export {};
