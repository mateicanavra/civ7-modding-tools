/**
 * @file unit-flags-independent-powers.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Unit flag for independent powers.  These eventually can become city-states.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import { UnitFlagType } from "/base-standard/ui/unit-flags/unit-flag-manager.js";
export declare class IndependentPowersUnitFlag extends Component implements UnitFlagType {
    private _componentID;
    private _worldAnchor;
    private engineInputListener;
    private unitContainer;
    private unitHealthBar;
    private unitHealthBarInner;
    private unitFlagIcon;
    private isHidden;
    private independentID;
    private privateerContainer;
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
    /**
     * Helper to get the Indy object related to this flag.
     * @returns {IndependentDefition|null}
     */
    private getIndyName;
    private realizeUnitHealth;
    private realizeIcon;
    private realizeTooltip;
    private realizePromotions;
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
    updateAffinity(): void;
    /**
     * Hotseat
     */
    localPlayerUpdate(): void;
    /**
     * Helper to get the affinity relationship between the player and independent power.
     * @returns {IndependentRelationship} enum representing the affinity level
     */
    private getRelationship;
    private realizeAffinity;
    get componentID(): Readonly<ComponentID>;
    get unit(): Readonly<Unit>;
}
