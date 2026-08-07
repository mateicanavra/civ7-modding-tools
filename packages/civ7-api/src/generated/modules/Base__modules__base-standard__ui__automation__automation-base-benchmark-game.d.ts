export declare class AutomationBaseBenchmarkGame {
    protected testName: string;
    private autoplayEndListener;
    private benchmarkCooledListener;
    private benchmarkEndedListener;
    private benchmarkSwappedListener;
    private benchmarkTerminatedListener;
    private benchmarkWarmedListener;
    protected observer: number;
    protected constructor(testName: string);
    private onAutoplayEnd;
    /**
     * @param fileName The filename without an extension
     */
    protected run(fileName: string): void;
    protected restart(): void;
    protected postGameInitialization(_bWasLoaded: boolean): void;
    protected gameStarted(startParameters: GameBenchmarkStartParameters): void;
    protected stop(): void;
    private onBenchmarkEnded;
    private onBenchmarkCooled;
    private onBenchmarkSwapped;
    private onBenchmarkTerminated;
    private onBenchmarkWarmed;
}
