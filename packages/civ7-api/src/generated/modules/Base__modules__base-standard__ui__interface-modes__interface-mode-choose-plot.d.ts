/**
 * @file interface-mode-choose.plot.ts
 * @copyright 2021-2023, Firaxis Games
 * @description Base interface mode used for interface modes that require plot selection
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import { PlotCursorUpdatedEvent } from "/core/ui/input/plot-cursor.js";
import { InterfaceMode } from "/core/ui/interface-modes/interface-modes.js";
import { PlotSelectionHandler } from "/base-standard/ui/world-input/world-input.js";
/**
 * Base class for a simple choose plot interface mode.
 */
declare abstract class ChoosePlotInterfaceMode implements InterfaceMode.Handler {
    protected placementOverlayGroup: WorldUI.OverlayGroup;
    protected placementModelGroup: WorldUI.ModelGroup;
    protected placementCursorOverlayGroup: WorldUI.OverlayGroup;
    protected placementCursorModelGroup: WorldUI.ModelGroup;
    protected autoSelectSinglePlots: boolean;
    protected singlePlotCoord: PlotCoord | null;
    private _context;
    isPlotProposed: boolean;
    protected plotSelectionHandler: PlotSelectionHandler;
    private plotCursorCoordsUpdatedListener;
    get Context(): any;
    transitionTo(_oldMode: InterfaceMode.ModeId, _newMode: InterfaceMode.ModeId, context: InterfaceMode.Context): void;
    transitionFrom(_oldMode: InterfaceMode.ModeId, _newMode: InterfaceMode.ModeId): void;
    /** Check if this mode can be safely transitioned from */
    canLeaveMode?(newMode: InterfaceMode.ModeId): boolean;
    selectPlot(plot: PlotCoord, _previousPlot: PlotCoord | null): boolean;
    handleInput(inputEvent: InputEngineEvent): boolean;
    onPlotCursorCoordsUpdated(event: PlotCursorUpdatedEvent): void;
    /**
     * Decorate an overlay with details.
     * @param overlay The overlay group managed by the class.
     */
    decorate(_overlay: WorldUI.OverlayGroup, _modelGroup: WorldUI.ModelGroup): void;
    /**
     * Decorate an overlay with details.
     * @param overlay The overlay group managed by the class.
     */
    decorateHover(_plotCoord: PlotCoord, _overlay: WorldUI.OverlayGroup, _modelGroup: WorldUI.ModelGroup): void;
    /**
     * Remove any decoration overlay.
     * @param overlay The overlay group managed by the class.
     */
    undecorate(_overlay: WorldUI.OverlayGroup, _modelGroup: WorldUI.ModelGroup): void;
    /**
     * Initialize any data for the new context.
     * @returns true if success, false on failure.
     */
    abstract initialize(): boolean;
    /**
     * Reset any stored member data.
     */
    abstract reset(): void;
    /**
     * Propose a plot selection.
     * This is where any sort of validation/confirmation may occur.
     * The check is async and depends on `accept` or `reject` being called.
     * @param plot The plot being proposed.
     * @param accept Accept the plot proposal and commit to it.
     * @param reject Reject the proposal and allow for other plot selections.
     */
    abstract proposePlot(plot: PlotCoord, accept: () => void, reject: () => void): void;
    /**
     * Commit to a particular plot as the selection.
     * @param plot The selected plot.
     */
    abstract commitPlot(plot: PlotCoord): void;
}
export { ChoosePlotInterfaceMode as default };
