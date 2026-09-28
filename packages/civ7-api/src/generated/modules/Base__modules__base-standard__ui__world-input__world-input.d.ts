/**
 * World Input Mangement
 * @copyright 2020-2025, Firaxis Games
 *
 * Handles input interacting with the world.
 */
import { IEngineInputHandler, InputEngineEvent, InputHandlerState, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export type PlotSelectionHandler = (plot: PlotCoord, previousPlot: PlotCoord | null) => boolean;
export type PostDeclareWarActionFunc = () => void;
export type WarHandler = (warDeclarationTarget: WarDeclarationTarget, postDeclareWarActionFunc: PostDeclareWarActionFunc) => boolean;
declare class WorldInputSingleton implements IEngineInputHandler {
    private selectedPlot;
    private canUnitSelect;
    private canCitySelect;
    private defaultPlotSelectionHandler;
    private plotSelectionHandler;
    private warHandlers;
    private uiDisableWorldInputListener;
    private uiEnableWorldInputListener;
    private uiDisableWorldCityInputListener;
    private uiEnableWorldCityInputListener;
    private uiDisableWorldUnitInputListener;
    private uiEnableWorldUnitInputListener;
    constructor();
    onReady(): void;
    /**
     * Should be raised when player hits the "start" button from the loading screen.
     * Also is raised during a hotload.
     */
    private onGameStarted;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleNavigation(_navigationEvent: NavigateInputEvent): InputHandlerState;
    private trySelectPlot;
    /**
     * @returns true if still live, false if input should stop.
     */
    private actionActivate;
    private isOnUI;
    private handleTouchTap;
    private actionCancel;
    /**
     * @returns true if still live, false if input should stop.
     */
    private actionMouseRightButton;
    private onSocialPanel;
    /**
     * Swap the selection between units and city in the same plot.
     * @returns true if still live, false if input should stop.
     */
    private swapPlotSelection;
    isDistrictSelectable(districtId: ComponentID): boolean;
    setPlotSelectionHandler(handler: PlotSelectionHandler): void;
    useDefaultPlotSelectionHandler(): void;
    private unselectPlot;
    private selectPlot;
    /**
     * Default handler for clicking a plot with a unit potentially in it.
     * @param {PlotCoord} location a plot's x/y location in the world map.
     * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
     * @returns {boolean} true if input is still "live", false if "handled" and/or consumed
     */
    private handleSelectedPlotUnit;
    /**
     * Handle selecting the city at the given plot
     * @param {PlotCoord} location a plot's x/y location in the world map.
     * @returns {boolean} true if input is still live, false otherwise
     */
    private handleSelectedPlotCity;
    /**
     * Default handler if a player has clicked on the world.
     * Attempts to select a unit first, if all units in plot have had a chance, loops around to any city selection.
     * @param {PlotCoord} location a plot's x/y location in the world map.
     * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
     * @returns {boolean} true if input is still "live", false if "handled" and/or consumed
     */
    private handleSelectedPlot;
    requestMoveOperation(unitComponentID: ComponentID, parameters: any): boolean;
    /**
     * Check for units and proceed to handleSelection, otherwise return to interface modes PlotSelectionHandler
     * @param {PlotCoord} location a plot's x/y location in the world map.
     * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
     */
    handleChoosePlotWithUnits(location: PlotCoord, previousPlot: PlotCoord | null): boolean;
    private checkDeclareWarAt;
    /**
     * Add a handler for when war may be declared.
     * @param warHandler callback function to raise.
     */
    addWarHandler(warHandler: WarHandler): void;
    private doActionOnPlot;
}
declare const WorldInput: WorldInputSingleton;
export { WorldInput as default };
