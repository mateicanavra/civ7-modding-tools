/**
 * @file advanced-options-panel.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Displays advanced game options and player setup
 */
import { OptionsBase } from "/core/ui/shell/create-panels/game-creation-options.js";
export declare class PlayerLeaderOrCivOption extends OptionsBase {
    private playerID?;
    private parameterID;
    private possibleValues;
    private root;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
    private handleSelection;
    private rebuildPossibleValues;
}
