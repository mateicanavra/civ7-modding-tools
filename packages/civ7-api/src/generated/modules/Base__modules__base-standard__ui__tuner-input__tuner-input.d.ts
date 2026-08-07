/**
 * Tuner Input support.
 * @copyright 2020-2022, Firaxis Games
 *
 * Handles reacting to input on behalf of the Tuner scripts.
 */
declare class Tuner_MapPanel {
    constructor();
    private previewModelGroup;
    getPreviewModelGroup(): WorldUI.ModelGroup;
    onActionA(loc: float2): boolean;
    onActionB(loc: float2): boolean;
}
declare class Tuner_CityPanel {
    constructor();
    onActionA(loc: float2): boolean;
    onActionB(loc: float2): boolean;
}
declare class Tuner_WorldUIPanel {
    constructor();
    private previewModelGroup;
    getPreviewModelGroup(): WorldUI.ModelGroup;
    onActionA(loc: float2): boolean;
    onActionB(_loc: float2): boolean;
}
declare class Tuner_AdvancedStartPanel {
    constructor();
    onActionA(loc: float2): boolean;
    onActionB(_loc: float2): boolean;
}
declare enum ShowingOverlayType {
    NONE = 0,
    AREAS = 1,
    REGIONS = 2
}
declare const AREA_HIGHLIGHT_COLOR: {
    readonly x: 0;
    readonly y: 0.671;
    readonly z: 0;
    readonly w: 0.75;
};
declare const REGION_HIGHLIGHT_COLOR: {
    readonly x: 0;
    readonly y: 0.671;
    readonly z: 0;
    readonly w: 0.75;
};
declare class Tuner_MapAreasPanel {
    private overlayGroup;
    private overlay;
    private showing;
    private showingId;
    constructor();
    onActionA(loc: float2): boolean;
    onActionB(loc: float2): boolean;
    clearOverlay(): void;
    showMapArea(areaId: number): void;
    showMapRegion(regionId: number): void;
}
declare let g_TunerState: any;
declare class TunerInput {
    panels: any;
    constructor();
    onReady(): void;
    onActionA(loc: float2): boolean;
    onUserActionA(event: CustomEvent): boolean;
    onActionB(loc: float2): boolean;
    onUserActionB(event: CustomEvent): boolean;
}
declare const g_TunerInput: TunerInput;
