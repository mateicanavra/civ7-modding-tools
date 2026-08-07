/**
 * @file screen-benchmark.ts
 * @copyright 2025, Firaxis Games
 * @description Displays information about currently running benchmarks.
 */
import Panel from "/core/ui/panel-support.js";
declare class ScreenBenchmark extends Panel {
    private readonly benchUpdateListener;
    private readonly benchEndedListener;
    private readonly navigateInputListener;
    private readonly engineInputListener;
    private readonly isGraphicsBenchmark;
    private readonly resultsFrame;
    private readonly counter;
    private readonly turnTime;
    private readonly percentile99;
    private readonly average;
    private readonly lightGraph;
    private readonly closeButton;
    private readonly graphCanvas;
    private readonly filePath;
    private graph;
    private graphConfig;
    private graphData;
    private frameValues;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onNavigateInput;
    private onEngineInput;
    private onBenchmarkEnded;
    private onBenchmarkUpdate;
    private closeBenchmark;
    private createInfoElement;
    private initGraph;
    private drawDistributionGraph;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-benchmark": ComponentRoot<ScreenBenchmark>;
    }
}
export declare function openBenchmarkUi(): void;
export {};
