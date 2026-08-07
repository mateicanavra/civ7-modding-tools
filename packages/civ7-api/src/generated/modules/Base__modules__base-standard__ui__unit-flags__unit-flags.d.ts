/**
 * @file unit-flags.ts
 * @copyright 2021-2024, Firaxis Games
 * @description Generic unit flag implementation; the default unit flag if no specific one is found.
 * The flag manages the lifetime and update of any additional 3D pieces and/or overlays.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { UnitFlagType } from "/base-standard/ui/unit-flags/unit-flag-manager.js";
export declare class GenericUnitFlag extends Component implements UnitFlagType {
    private _componentID;
    private _worldAnchor;
    private _isManagerTracked;
    private engineInputListener;
    private beforeUnloadListener;
    private isHidden;
    private MEDIUM_HEALTH_THRESHHOLD;
    private LOW_HEALTH_THRESHHOLD;
    private unitContainer;
    private unitHealthBar;
    private unitHealthBarInner;
    private unitFlagIcon;
    private readonly SPACING;
    private readonly BASE_OFFSET;
    /**
     * A vertical offset when the unit is 'stacked' with other units.
     * TODO - The unit world anchor should be able to incorporate this offset in C++ to avoid constantly recalculating this in Script.
     */
    private flagOffset;
    onAttach(): void;
    onUnload(): void;
    onDetach(): void;
    private cleanup;
    private onEngineInput;
    hide(): void;
    show(): void;
    disable(): void;
    enable(): void;
    private realizeUnitHealth;
    private realizeIcon;
    protected realizeTooltip(): void;
    private realizePromotions;
    private realizeTreasureFleetPoints;
    private setMovementPoints;
    /**
     * Change the visibility of the unit's flag.
     * @param {RevealState} state - The visibility state to change to.
     */
    setVisibility(state: RevealedStates): void;
    private makeWorldAnchor;
    private destroyWorldAnchor;
    updateHealth(): void;
    updateMovement(): void;
    private checkUnitPosition;
    updateTop(position: number, total: number): void;
    /**
     * Hotseat
     */
    localPlayerUpdate(): void;
    updateAffinity(): void;
    updatePromotions(): void;
    get componentID(): Readonly<ComponentID>;
    get unit(): Readonly<Unit>;
}
