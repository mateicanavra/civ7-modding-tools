/**
 * @file interface-mode-coordinated-attack.ts
 * @copyright 2021, Firaxis Games
 */
import ChoosePlotInterfaceMode from "/base-standard/ui/interface-modes/interface-mode-choose-plot.js";
/**
 * Base handler for focused attacks.
 */
declare class FocusedAttackBaseInterfaceMode extends ChoosePlotInterfaceMode {
    protected operationResult: OperationResult | null;
    protected validPlots: any;
    protected commandName: string;
    initialize(): boolean;
    reset(): void;
    decorate(overlay: WorldUI.OverlayGroup): void;
    proposePlot(plot: PlotCoord, accept: () => void, reject: () => void): void;
    commitPlot(plot: PlotCoord): void;
}
export { FocusedAttackBaseInterfaceMode as default };
