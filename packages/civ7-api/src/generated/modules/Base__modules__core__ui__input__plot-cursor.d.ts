import { IEngineInputHandler, InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
export declare const PlotCursorUpdatedEventName: "plot-cursor-coords-updated";
export declare class PlotCursorUpdatedEvent extends CustomEvent<{
    plotCoords: float2 | null;
}> {
    constructor(plotCoords: float2 | null);
}
declare class PlotCursorSingleton implements IEngineInputHandler {
    private static Instance;
    private init;
    private plotVFXHidden;
    private _PlotCursorCoords;
    private cursorParameters;
    private readonly PAN_MODIFIER;
    private readonly DEFAULT_DELAY;
    private frameDelta;
    private controllerCursor?;
    private nudgeDelay;
    private lookAtSent;
    private isMoving;
    private miniCursorModelGroup;
    private miniCursorMarker;
    private readonly origin;
    private isUnitSelected;
    private unitLocation;
    private plotCursorModelGroup;
    private cursorUpdatedListener;
    private hidePlotVFXListener;
    private showPlotVFXListener;
    private constructor();
    private initialize;
    private startup;
    private shutdown;
    onUpdate(timeDelta: DOMHighResTimeStamp): void;
    /**
     * Singleton accessor
     */
    static getInstance(): PlotCursorSingleton;
    set plotCursorCoords(coords: float2 | null);
    get plotCursorCoords(): float2 | null;
    private updateVirtualScreenPosition;
    private onCameraChanged;
    private onPlotCursorModeChange;
    private onPlotChanged;
    private onCursorUpdated;
    private calculateMovementDelta;
    private onMovePlotCursor;
    private realizeFocusedPlot;
    private onCenterPlotCursor;
    private hidePlotVFX;
    private showPlotVFX;
    hideCursor(): void;
    showCursor(): void;
    private onUnitSelectionChanged;
    private isOnUI;
    private handleTouchTap;
    private handleTouchPress;
    handleInput(inputEvent: InputEngineEvent): boolean;
    handleNavigation(_navigationEvent: NavigateInputEvent): boolean;
}
declare global {
    interface WindowEventMap {
        "plot-cursor-coords-updated": PlotCursorUpdatedEvent;
    }
}
export declare const PlotCursor: PlotCursorSingleton;
export { PlotCursor as default };
