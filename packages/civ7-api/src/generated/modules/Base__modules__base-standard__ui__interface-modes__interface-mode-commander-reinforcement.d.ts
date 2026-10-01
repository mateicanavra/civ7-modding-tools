/**
 * @file interface-mode-commander-reinforcement.ts
 * @copyright 2024, Firaxis Games
 * @description Interface mode to handle visualization on units reinforcing a commander
 */
import { InterfaceMode } from "/core/ui/interface-modes/interface-modes.js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare class CommanderReinforcementInterfaceMode implements InterfaceMode.Handler {
    transitionTo(_oldMode: InterfaceMode.ModeId, _newMode: InterfaceMode.ModeId): void;
    static updateDisplay(unitID: ComponentID, path: UnitGetPathToResults): void;
    transitionFrom(_oldMode: InterfaceMode.ModeId, _newMode: InterfaceMode.ModeId): void;
}
