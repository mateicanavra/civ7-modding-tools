import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
declare const enum CinematicTypes {
    WONDER_COMPLETE = 0,
    NATURAL_WONDER_DISCOVERED = 1,
    NATURAL_DISASTER = 2,
    GAME_VICTORY = 3
}
interface CinematicData {
    cinematicType: CinematicTypes;
    plot: float2;
    cameraSettingName: string | null;
    victoryType?: string;
    quoteAudio?: string | null;
    endGame?: boolean;
    vfxAsset?: string;
}
interface CinematicRequest extends CinematicData, IDisplayRequestBase {
}
declare class CinematicManagerImpl extends DisplayHandlerBase<CinematicRequest> {
    private wonderCompletedListener;
    private naturalWonderRevealedListener;
    private randomEventOccurredListener;
    private projectCompletedListener;
    private awaitCinematicListener;
    private readyListener;
    private previousMode;
    private previousModeContext;
    private movieInProgress;
    private eventReference;
    private currentCinematicData;
    private CinematicVFXModelGroup;
    private CinematicScreenVfx3DMarker;
    private currentCinematic;
    private isCameraDynamic;
    private isFogChanged;
    private musicIndex;
    private static readonly FOCUS_HEIGHT;
    private static readonly CAMERA_HEIGHT;
    private static readonly FALLBACK_DYNAMIC_CAMERA_PARAMS;
    constructor();
    onReady(): void;
    getCinematicLocation(): float2;
    getCinematicAudio(): string | null;
    getCinematicDynamicCameraParams(): DynamicCameraParams;
    private getCinematicHeightFogParams;
    startEndOfGameCinematic(victoryCinematicType: string, victoryName: string, location: PlotCoord, quoteAudio?: string): void;
    private getVictoryCinematicAssetName;
    private getCinematicPlotVFXAssetName;
    private getFallbackCinematicPlotVFXAssetName;
    private getCinematicScreenVFXAssetName;
    private getFallbackCinematicScreenVFXAssetName;
    isLoadingCurtainOpen(): boolean;
    isMovieInProgress(): boolean;
    stop(): void;
    private releaseCinematic;
    replayCinematic(): void;
    /**
     * @implements {IDisplayQueue}
     */
    show(request: CinematicRequest): void;
    isShowing(): boolean;
    private startCinematic;
    /**
     * @implements {IDisplayQueue}
     */
    hide(request: CinematicRequest, _options?: DisplayHideOptions): void;
    private awaitCinematic;
    private onWonderCompleted;
    private onNaturalWonderRevealed;
    private onRandomEventOccurred;
    private onCityProjectCompleted;
}
export declare const CinematicManager: CinematicManagerImpl;
export { CinematicManager as default };
