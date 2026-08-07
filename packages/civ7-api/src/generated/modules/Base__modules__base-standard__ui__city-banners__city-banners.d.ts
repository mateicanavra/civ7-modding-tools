/**
 * @file city-banners.ts
 * @copyright 2021-2026, Firaxis Games
 * @description City Banners' logic for the indiviudal banners
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { BitfieldComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { CityBanner } from "/base-standard/ui/city-banners/banner-support.js";
import "/base-standard/ui-next/screens/city-banners/city-banner-population.js";
import "/base-standard/ui-next/screens/city-banners/city-banner-production.js";
export declare class CityBannerComponent extends FxsActivatable implements CityBanner {
    private _worldAnchorHandle;
    private inputSelector;
    private componentID;
    private isHidden;
    private location;
    private city;
    private updateNameQueued;
    private onActivateEventListener;
    private readonly elements;
    private civSymbols;
    private civPatternElements;
    get bannerLocation(): float2;
    private fullUpdateGate;
    fullUpdate(requestor: string): void;
    private doFullUpdate;
    queueNameUpdate(): void;
    private doNameUpdate;
    getDebugString(): string;
    getKey(): BitfieldComponentID;
    getLocation(): float2;
    /**
     * getDebugLocation parses the data-debug-plot-index attribute on the DOM element and returns a float2 if it is valid.
     * This is used for generating many city banners attached to one city, but in differing plots, for stress testing.
     */
    getDebugLocation(): float2 | null;
    onAttach(): void;
    /** Debug only: (this part of the) DOM is reloading. */
    private onUnload;
    onDetach(): void;
    private cleanup;
    private onActivate;
    setVisibility(state: RevealedStates): void;
    getVisibility(): RevealedStates;
    private makeWorldAnchor;
    private destroyWorldAnchor;
    /**
     * Realizes the entire banner.
     */
    private buildBanner;
    /**
     * Set the static information inside of the city banner.
     * @param {BannerData} data All string data is locale translated.
     */
    private setCityInfo;
    private realizePopulation;
    private realizeCityStateType;
    private realizePlayerColors;
    private realizeCivHeraldry;
    realizeReligion(): void;
    private realizeBuilds;
    private processBuilds;
    realizeTradeNetwork(): void;
    realizeHappiness(): void;
    affinityUpdate(): void;
    capitalUpdate(): void;
    /**
     * Local player changed (hotseat).
     */
    localPlayerUpdate(): void;
    updateConqueredIcon(): void;
    hide(): void;
    show(): void;
    disable(): void;
    enable(): void;
    remove(): void;
}
