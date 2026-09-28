/**
 * @file Unit Flag Manger
 * @copyright 2021-2026, Firaxis Games
 * @description Handle showing information for units.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export interface UnitFlagType {
    /** ComponentID of the unit attached to the flag. */
    componentID: ComponentID;
    /** Get property for the unit associated with the component ID. */
    unit: Unit;
    /** Change the visibility of the unit's flag. */
    setVisibility(state: RevealedStates): void;
    hide(): void;
    show(): void;
    disable(): void;
    enable(): void;
    updateHealth(): void;
    updateMovement(): void;
    updateTop(position: number, total: number): void;
    updateAffinity(): void;
    localPlayerUpdate(): void;
    Destroy(): void;
}
export interface UnitFlagFactoryMaker {
    /**
     * Called when a factory is registered so that it can register events.
     */
    initialize(): void;
    /**
     * Is this the best unit flag factory to be used for creating unit flags for this type?
     * @param {Unit} unit - the unit being created
     * @param {UnitDefinition} unitDefinition - Definition of the unit type being created
     * @param {UnitFlagFactory[]} [others] - other factories that match creating for this unit; if populated its assumed to contain this factory as well
     */
    isMatch(unit: Unit, unitDefinition: UnitDefinition, otherMatchingFactories?: UnitFlagFactoryMaker[]): boolean;
    /**
     * @returns The name of a custom HTML component to instantiate.
     */
    getComponentName(): string;
}
/**
 * Helper to determine if an object implemented the UnitFlagType interface.
 * @param object - Object to check out.
 * @returns true if object implements the UnitFlagType interface, false otherwise.
 */
export declare function instanceOfUnitFlagType(object: any): object is UnitFlagType;
export interface UnitFlagFactoryExtension {
    componentName: string;
    apply: (flag: ComponentRoot, unitId: ComponentID) => void;
}
/**
 *
 */
export declare class UnitFlagFactory {
    private static makers;
    private static extensions;
    /**
     * Register a "maker" class that can determine what component should be used	 to make a particulr type of unit flag.
     * @param {UnitFlagFactoryMaker} makerInstance Instance of a "maker" which has the name of HTML component type to instantiate.
     */
    static registerStyle(makerInstance: UnitFlagFactoryMaker): void;
    /**
     * Registers an extension to be applied to a unit flag after it is created.
     * @param flagExtension
     */
    static registerExtension(flagExtension: UnitFlagFactoryExtension): void;
    static applyExtensions(flag: ComponentRoot, unitID: ComponentID): void;
    static getBestHTMLComponentName(componentID: ComponentID): string;
}
/**
 * Manages lifetime of unit flags.
 */
export declare class UnitFlagManager extends Component {
    unitFlagZoomScale: number;
    private flags;
    private rebuildPending;
    private globalHide;
    /** Flag set by debug panel to disable all unit flags. */
    private systemDisabled;
    /** Flag set by debug panel to generate a ton of test units. */
    private stressTestUnitsEnabled;
    /** Array of generated test units used to remove them when the stress test is disabled. */
    private stressTestUnits;
    private globalHideListener;
    private globalShowListener;
    private interactUnitShowListener;
    private interactUnitHideListener;
    private uiDisableUnitFlagsListener;
    private uiEnableUnitFlagsListener;
    private zoomLevel;
    private styleMap;
    private opacityStyle;
    private flagOffsetUpdateGate;
    private plotIndicesToCheck;
    private flagRoots;
    private static _instance;
    static get instance(): UnitFlagManager;
    /**
     * Onetime callback on creation.
     */
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    /**
     * Obtain a root element that contains all unit flags for a given player.
     * This helps partition the flags so that certain changes (add/remove) do not invalidate all flags.
     * @param playerId The player id associated with the unit flag root.
     * @returns
     */
    getFlagRoot(playerId: PlayerId): any;
    getFlag(componentID: ComponentID): UnitFlagType | undefined;
    recalculateFlagOffsets(location: float2): void;
    private onRecalculateFlagOffsets;
    private onInteractUnitShow;
    private onInteractUnitHide;
    private onDisableFlags;
    private onEnableFlags;
    /**
     * Hotseat
     * @param _data unused
     */
    private onLocalPlayerChanged;
    private onUnitDamageChanged;
    private onUnitMovementPointsChanged;
    private onUnitRemovedFromMap;
    private onAffinityLevelChanged;
    private onZoomChange;
    private calculateZoom;
    private setZoomLevel;
    /**
     * Engine callback when visibility of a unit changed.
     * Using this instead of UnitAddedToMap because of event race condition in looking up a valid Unit in WorldAnchor.
     * @param {UnitVisibilityChanged_EventData} data
     */
    onUnitVisibilityChanged(data: UnitVisibilityChanged_EventData): void;
    private removeAllFlags;
    removeStressTestUnits(): void;
    createStressTestFlags(): void;
    /**
     * Make a request to rebuild all flags next frame.
     * Not necessary initially but found when hotloading, sometimes the flags were
     * being built before all flag handlers were registered.
     */
    requestFlagsRebuild(): void;
    /**
     * Handles kick off creating all flags or waiting if the component isn't built yet.
     */
    checkFlagRebuild(): void;
    /**
     * Create all unit flags.
     * TODO: Evaluate if it this will be removed; one of three things must happen first:
     * 		An equivalent of a playerVisibility( x, y) call exposure is made
     * 		The revealed visibility of a unit can be checked on the unit object
     * 		The UnitVisibilityChanged call is guaranteed to fire for units when they are first created
     */
    private createAllFlags;
    /**
     * Create a unit flag associated with a unit ID. External access for panels.
     * @param {ComponentID} unitID The cid that represents the unit.
     */
    createFlagComponent(unitID: ComponentID): HTMLElement | undefined;
    /**
     * Create a unit flag associated with a unit ID.
     * @param {ComponentID} unitID The cid that represents the unit.
     */
    private createFlag;
    /**
     * @description Called by a unit flag to let manager directly access it's instance.
     * @param {UnitFlagType} child - flag which manager created.
     */
    addChildForTracking(child: UnitFlagType): void;
    /**
     * @description Called by a unit flag to remove itself from being tracked by the manager
     * @param {UnitFlagType} child - flag which manager created.
     */
    removeChildFromTracking(child: UnitFlagType): void;
    /**
     * @description Game callback; same as CityAddedToMap (same data payload)
     * but happens at the end of creation so all values are populated.
     * @param {CityAddedToMap_EventData} data - Details about created city.
     */
    private onCityInitialized;
    private onGlobalHide;
    private onGlobalShow;
}
