/**
 * @file model-commander-interact.ts
 * @copyright 2023, Firaxis Games
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
import UpdateGate from "/core/ui/utilities/utilities-update-gate.js";
import { UnitAction } from "/base-standard/ui/unit-actions/unit-actions.js";
export interface CommanderModelInterface {
    updateCallback: () => void;
}
interface ArmyCommanderItem {
    commander: Unit;
    commanderExperience?: UnitExperience | undefined;
    army: Army;
    packedUnits: Unit[];
}
interface CommanderExperience {
    caption: string;
    progress: string;
}
export interface CommanderReinforcementItem {
    unitID: ComponentID;
    armyID: number;
    startLocation: float2;
    arrivalTime: number;
    commanderToReinforce?: Unit;
    isTraveling: boolean;
}
declare class CommanderInteractModel {
    private _registeredComponents;
    private armyCommanders;
    private unitReinforcementIDs;
    private _index;
    private _name;
    private _experience;
    private _hasExperience;
    private _hasPackedUnits;
    private _hasActions;
    private _hasData;
    private _currentArmyCommander;
    private _currentReinforcements;
    private _commanderActions;
    private _OnUpdate?;
    updateGate: UpdateGate;
    constructor();
    set updateCallback(callback: (model: CommanderInteractModel) => void);
    registerListener(c: CommanderModelInterface): void;
    unregisterListener(c: CommanderModelInterface): void;
    get name(): string;
    get experience(): CommanderExperience | null;
    get hasExperience(): boolean;
    get hasPackedUnits(): boolean;
    get hasActions(): boolean;
    get hasData(): boolean;
    get currentArmyCommander(): ArmyCommanderItem | null;
    get currentReinforcements(): CommanderReinforcementItem[];
    get commanderActions(): UnitAction[];
    private update;
    setName(name: string): void;
    setArmyCommander(unitID: ComponentID): void;
    getCommanderReinforcementItem(unitID: ComponentID): CommanderReinforcementItem | undefined;
    private updateArmyData;
    private onUnitAddedRemoved;
    private onUnitArmyChange;
    private onUnitExperienceChanged;
    private onUnitSelectionChanged;
    getUnitActions(unit: Unit): UnitAction[];
    /**
     * Does a particular unit operation require a targetPlot if selected?
     * @param type Game core unit operation as string name.
     * @returns true if this operation requires a plot to be targeted before exectuing.
     */
    private isTargetPlotOperation;
    private getUnitAbilitiesForOperationOrCommand;
}
declare const CommanderInteract: CommanderInteractModel;
export { CommanderInteract as default };
