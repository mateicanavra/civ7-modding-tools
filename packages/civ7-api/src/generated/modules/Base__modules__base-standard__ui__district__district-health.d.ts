/**
 * @file district-health.ts
 * @copyright 2023, Firaxis Games
 * @description A health bar that is attached to the 3D world and floats up.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { DistrictHealth } from "/base-standard/ui/district/district-health-manager.js";
export declare class DistrictHealthBar extends Component implements DistrictHealth {
    private _componentID;
    private _worldAnchorHandle;
    private progressBar;
    private progressInk;
    private civHexInner;
    private civHexOuter;
    private hslot;
    private isCityCenter;
    private readonly MEDIUM_HEALTH_THRESHHOLD;
    private readonly LOW_HEALTH_THRESHHOLD;
    onAttach(): void;
    private getHealthIcon;
    onDetach(): void;
    private cleanup;
    private makeWorldAnchor;
    private destroyWorldAnchor;
    setContested(_isContested: boolean, controllingPlayer: PlayerId): void;
    setVisibility(isVisible: boolean): void;
    updateDistrictHealth(value: string): void;
    get componentID(): Readonly<ComponentID>;
}
