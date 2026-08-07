/**
 * @file unit-selection.ts
 * @copyright 2020-2025, Firaxis Games
 * @description Handles activation/deactivation for when a unit is selected.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare class RaiseUnitSelectionEvent extends CustomEvent<{
    cid: ComponentID;
}> {
    constructor(cid: ComponentID);
}
export declare class LowerUnitSelectionEvent extends CustomEvent<{
    cid: ComponentID;
}> {
    constructor(cid: ComponentID);
}
export type UnitSelectionListener = (cid: ComponentID) => void;
/**
 * Primary class to handle unit selection request from the game.
 * Performs additional gate-keeping based on user interface mode.
 */
declare class UnitSelectionSingleton {
    private trySelectUnitID;
    private currentVFXUnitID;
    private selectionVFXModelGroup;
    private lowerEvent;
    private raiseEvent;
    private onUnitHotkeyListener;
    constructor();
    private updateGate;
    /** Debug only: (this part of the) DOM is reloading. */
    private onUnload;
    private cleanup;
    private onReady;
    private onUpdate;
    /**
     * If an update is requested and the engine shows a unit is selected then
     * switch to the unit selected mode.
     */
    private update;
    private realizeVFX;
    private trySwitchToUnitSelectedMode;
    get onRaise(): ILiteEvent<ComponentID>;
    get onLower(): ILiteEvent<ComponentID>;
    private onUnitSelectionChanged;
    private onPlayerTurnActivated;
    private onUIHidePlotVFX;
    private onUIShowPlotVFX;
    private onGlobalShow;
    private onGlobalHide;
    private onUnitMoveComplete;
    /**
     * Allow a KBM next/previous to raise the unit selection.
     * @param hotkey, the hotkey based event.
     */
    private onUnitHotkey;
}
declare const UnitSelection: UnitSelectionSingleton;
export { UnitSelection as default };
