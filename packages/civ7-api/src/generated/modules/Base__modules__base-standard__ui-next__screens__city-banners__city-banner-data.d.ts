/**
 * @file city-banner-data.ts
 * @copyright 2026, Firaxis Games
 */
import { Accessor } from "solid-js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { ProductionPanelCategory } from "/base-standard/ui/production-chooser/production-chooser-helpers.js";
export declare enum BannerType {
    Town = "town",
    City = "city",
    Village = "village",
    CityState = "citystate"
}
export type RelationshipClass = "friendly" | "hostile" | "neutral" | undefined;
export interface CityBannerIdentity {
    location: PlotCoord;
    bannerType: BannerType;
    isLocalPlayerCity: boolean;
    name: string;
    /** Raw (unstylized) leader/suzerain name key or display name shown in `CityBannerNameTooltip`. */
    leaderName: string;
    /** Raw (unstylized) civilization name key shown in `CityBannerNameTooltip`. */
    civName: string;
    /** Raw (unstylized) city-state bonus name key, or "" if not applicable. */
    cityStateBonusName: string;
    portraitIcon: string;
    cityStateColor: string;
    cityStateIcon: string;
    /** Raw city-state type name key shown on the city-state icon tooltip. */
    cityStateTypeName: string;
    playerColorPrimary: string;
    playerColorSecondary: string;
}
export interface CityBannerCapitalInfo {
    isCapital: boolean;
    isOriginalCapital: boolean;
    isOriginalCapitalCurrent: boolean;
}
export interface CityBannerReligionInfo {
    hasReligion: boolean;
    urbanReligionIcon: string;
    urbanReligionTooltip: string;
    urbanReligionTooltipArgs: LocalizedTextArgument[];
    showRuralReligion: boolean;
    ruralReligionIcon: string;
    ruralReligionTooltip: string;
    ruralReligionTooltipArgs: LocalizedTextArgument[];
}
export interface CityBannerStatusInfo {
    visible: boolean;
    disabled: Accessor<boolean>;
    statusIcon: string;
    statusTooltip: string;
    tradeNetworkHidden: boolean;
    tradeNetworkTooltip: string;
    hasUnrest: boolean;
    unrestTurns: number;
    isBeingRazed: boolean;
    razedTurns: number;
    population: number;
    currentFood: number;
    foodPerTurn: number;
    canGrow: boolean;
    showProductionQueue: boolean;
    prodPerTurn: number;
    turnsLeft: number;
    percent: number;
    currentProduction: ProductionQueueItem | undefined;
    buildQueue: ProductionQueueItem[];
}
export interface CityBannerData {
    identity: CityBannerIdentity;
    capital: CityBannerCapitalInfo;
    religion: CityBannerReligionInfo;
    conquered: boolean;
    relationship: RelationshipClass;
    status: CityBannerStatusInfo;
}
export interface ProductionQueueItem {
    type: string;
    name: string;
    icon: string;
    kind: ProductionPanelCategory;
    cost: number;
    progress: number;
    turns: number;
}
export declare const areCityBannersDisabled: any, setCityBannersDisabled: any;
export declare function computeIdentity(cityID: ComponentID, location?: PlotCoord): CityBannerIdentity | null;
/** Computed on banner creation and whenever `CapitalCityChanged` fires - matches `capitalUpdate()`. */
export declare function computeCapitalInfo(cityID: ComponentID, location?: PlotCoord): CityBannerCapitalInfo | null;
export declare function computeReligionInfo(cityID: ComponentID, location?: PlotCoord): CityBannerReligionInfo | null;
/** Computed on banner creation and whenever `ConqueredSettlementIntegrated` fires - matches `updateConqueredIcon()`. */
export declare function computeConquered(cityID: ComponentID, location?: PlotCoord): boolean | null;
export declare function computeRelationship(playerID: PlayerId): RelationshipClass;
export declare function computeStatusInfo(cityID: ComponentID, location?: PlotCoord): CityBannerStatusInfo | null;
export declare function computeFullBannerData(cityID: ComponentID, location?: PlotCoord): CityBannerData | null;
