/**
 * @file district-health-manager.ts
 * @copyright 2023-2026, Firaxis Games
 * @description Manages the tracking and updating of the floating district health.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export interface DistrictHealth {
    componentID: ComponentID;
    updateDistrictHealth(value: string): void;
    setVisibility(isVisible: boolean): void;
    setContested(isContested: boolean, contestingPlayer: PlayerId): void;
}
declare class DistrictHealthManager extends Component {
    private children;
    private globalHideListener;
    private globalShowListener;
    private static _instance;
    static get instance(): DistrictHealthManager;
    /**
     * Onetime callback on creation.
     */
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onPlotVisibilityChanged;
    private createAllDistrictHealth;
    private createDistrictHealth;
    private destroyAllDistrictHealth;
    /**
     * Called by an instance of DistrictHealth to register it with the manager
     * @param child Anchor text object
     */
    addChildForTracking(child: DistrictHealth): void;
    /**
     * Called by an instance of DistrictHealth to unregister it with the manager
     * @param child Anchor text object
     */
    removeChildFromTracking(child: DistrictHealth): void;
    private onDistrictDamageChanged;
    private onDistrictControlChanged;
    private onCityTransfered;
    private onLocalPlayerChanged;
    private updateCity;
    private onDistrictAddedToMap;
    private onDistrictRemovedFromMap;
    private removeDistrictHealth;
    private onGlobalHide;
    private onGlobalShow;
    static canShowDistrictHealth(currentHealth: number, maxHealth: number): boolean;
}
export { DistrictHealthManager as default };
