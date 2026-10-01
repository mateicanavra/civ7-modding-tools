/**
 * @file city-banner-manager.ts
 * @copyright 2021-2023, Firaxis Games
 * @description World anchored information about cities.
 */
import { BitfieldComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { CityBanner } from "/base-standard/ui/city-banners/banner-support.js";
import type { CityBannerComponent } from "/base-standard/ui/city-banners/city-banners.js";
declare global {
    interface Window {
        banners: Map<BitfieldComponentID, CityBannerComponent>;
    }
}
export interface ICityBannerMod {
    addModContent(city: City | null, player: PlayerLibrary | null): DocumentFragment;
}
declare class CityBannerManager extends Component {
    private citiesNotFullyCreated;
    private banners;
    private modCallback;
    private cityIntegratedListener;
    private cityAddedToMapListener;
    private cityInitializedListener;
    private cityNameChangedListener;
    private cityPopulationChangedListener;
    private cityProductionChangedListener;
    private cityProductionQueueChangedListener;
    private cityYieldChangedListener;
    private cityProductionUpdatedListener;
    private foodQueueOrCityGrowthModeListener;
    private cityReligionChangedListener;
    private urbanReligionChangedListener;
    private ruralReligionChangedListener;
    private uiDisableCityBannersListener;
    private uiEnableCityBannersListener;
    private globalHideListener;
    private globalShowListener;
    private plotVisibilityChangedListener;
    private cityRemovedFromMapListener;
    private citySelectionChangedListener;
    private cityGovernmentLevelChangedListener;
    private cityStateBonusChosenListener;
    private cityYieldGrantedListener;
    private capitalCityChangedListener;
    private static _instance;
    static get instance(): CityBannerManager;
    /**
     * Onetime callback on creation.
     */
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    setModCallback(callback: ICityBannerMod): void;
    callModCallback(city: City | null, player: PlayerLibrary | null): DocumentFragment;
    /**
     * Determine if a city/town already has a banner associated with it.
     * @param {ComponentID} cityComponentID - An component ID related to a city
     * @returns true if a banner was already created (and still exists), false otherwise.
     */
    private isBannerAlreadyCreated;
    private createAllBanners;
    private indexResourceTypes;
    private onResourceChanged;
    /**
     * Creates the city banner HTML DOM object.
     * @param {ComponentID} cityComponentID - The city's componentID linked to this banner.
     */
    private createBanner;
    private onCityIntegrated;
    /**
     * Engine Event
     */
    private onCityAddedToMap;
    /**
     * If a district is added to the map and its a village, then add the village banner (and 3d info)
     * @param {DistrictAddedToMap_EventData} data
     */
    private onDistrictAddedToMap;
    /**
     * If a district is removed from the map and its a village, then remove the village banner
     * @param data
     */
    private onDistrictRemovedFromMap;
    /**
     * @description An independent power's affinity level with a player changed.  Update banners if it's the local player.
     * @param {AffinityLevelChanged_EventData} data
     */
    private onAffinityLevelChanged;
    /**
     * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
     * @param {DiplomacyEvent} data
     */
    private onDiplomacyEventStarted;
    /**
     * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
     * @param {DiplomacyEvent} data
     */
    private onDiplomacyEventEnded;
    /**
     * @description A diplo relationship changed.  If it involves the local player, refresh the village banners
     * @param {DiplomacyRelationshipChanged_EventData} data
     */
    private onDiplomacyRelationshipChanged;
    /**
     * @description Game callback; same as CityAddedToMap (same data payload)
     * but happens at the end of creation so all values are populated.
     * @param {CityAddedToMap_EventData} data - Details about created city.
     */
    private onCityInitialized;
    /**
     * City has a new name.
     * @param {City_EventData} data
     */
    private onCityNameChanged;
    private onCityGovernmentLevelChanged;
    private onCityRemovedFromMap;
    private onCapitalCityChanged;
    private onCitySelectionChanged;
    private onCityStateBonusChosen;
    /**
     * @description Called by a city banner to let manager directly access it's instance.
     * When banner is being initalized.
     * @param {CityBanner} child - banner which manager created.
     */
    addChildForTracking(child: CityBannerComponent): void;
    /**
     * @description Called by a city banner to remove itself from being tracked by the manager
     * @param {CityBanner} child - banner which is being tracked by the manager
     */
    removeChildFromTracking(child: CityBanner): void;
    private onDisableBanners;
    private onEnableBanners;
    private checkCityVis;
    private onCityPopulationChanged;
    private onCityReligionChanged;
    private onUrbanReligionChanged;
    private onRuralReligionChanged;
    private onCityProductionChanged;
    private onCityProductionQueueChanged;
    private onCityYieldChanged;
    private onCityProductionUpdated;
    private onCityYieldGranted;
    private onCityFoodQueueUpdated;
    /**
     * Hotseat
     * @param _data unused
     */
    private onLocalPlayerChanged;
    private onNotificationAdded;
    private onGlobalHide;
    private onGlobalShow;
    private onPlotVisibilityChanged;
}
export { CityBannerManager as default };
