/**
 * @file interface-mode-pillage-base.ts
 * @copyright 2024, Firaxis Games
 */
import ChoosePlotInterfaceMode from "/base-standard/ui/interface-modes/interface-mode-choose-plot.js";
/**
 * Base Handler for Pillage based interface modes.
 */
declare class PillageBaseInterfaceMode extends ChoosePlotInterfaceMode {
    private operationResult;
    private validPlots;
    protected operationName: string;
    initialize(): boolean;
    reset(): void;
    decorate(overlay: WorldUI.OverlayGroup): void;
    proposePlot(plot: PlotCoord, accept: () => void, reject: () => void): void;
    commitPlot(plot: PlotCoord): void;
}
export { PillageBaseInterfaceMode as default };
