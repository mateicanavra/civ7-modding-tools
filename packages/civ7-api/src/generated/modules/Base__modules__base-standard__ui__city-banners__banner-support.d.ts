/**
 * @file banner-support.ts
 * @copyright 2022-2026, Firaxis Games
 * @description Define and common support functions for city and village banners.
 */
import { BitfieldComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare enum BannerType {
    custom = 0,// unknown type
    town = 1,
    city = 2,
    village = 3,
    cityState = 4
}
export declare enum CityStatusType {
    none = 0,
    happy = "YIELD_HAPPINESS",
    unhappy = "YIELD_UNHAPPINESS",
    angry = "YIELD_ANGRY",
    plague = "YIELD_PLAGUE"
}
export interface BannerData {
    bannerType: BannerType;
    name?: string;
    tooltip: string;
    icon?: string;
}
export declare function makeEmptyBannerData(): BannerData;
export interface Banner {
    getKey(): BitfieldComponentID;
    getLocation(): float2;
    getDebugString(): string;
    setVisibility(state: RevealedStates): void;
    getVisibility(): RevealedStates;
    hide(): void;
    show(): void;
    disable(): void;
    enable(): void;
    remove(): void;
}
export interface CityBanner extends Banner {
    fullUpdate(requestor: string): void;
    queueNameUpdate(): void;
    realizeReligion(): void;
    realizeHappiness(): void;
    updateConqueredIcon(): void;
    affinityUpdate(): void;
    capitalUpdate(): void;
    localPlayerUpdate(): void;
}
export declare const BANNER_INVALID_LOCATION = -9999;
