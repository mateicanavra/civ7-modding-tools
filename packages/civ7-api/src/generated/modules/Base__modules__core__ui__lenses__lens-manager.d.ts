/**
 * @file lens-manager.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Central manager object for lenses used by other scripts to toggles lenses and layers.
 */
declare global {
    /**
     * Lenses need to define a new entry for each lens
     *
     * Example: 'fxs-default-layer' : DefaultLens
     *
     * !DON'T FORGET to also include the reference in index.d.ts!
     * */
    interface LensTypeMap {
    }
}
export type LensName = keyof LensTypeMap extends never ? string : keyof LensTypeMap;
export interface ILens {
    /** Type enum for the layers this lens activates */
    activeLayers: Set<LensLayerName>;
    /** Type enum for the layers this lens allows to be enabled while it's active */
    allowedLayers: Set<LensLayerName>;
    /** Flag whether to skip caching enabled layers, in cases where this may be different from active layers. */
    skipCachingEnabledLayers?: boolean;
    /**
     * Flag whether or not to blend enabled layers when transitioning from one lens to another.
     * If undefined, assume blending.
     */
    blendEnabledLayersOnTransition?: boolean;
    /** Stores the layers that were enabled last time this lens was active so we can enable those layers again */
    lastEnabledLayers?: Set<LensLayerName>;
    /** Stores the player id that has the last enabled layers. */
    lastEnabledLayersPlayerID?: PlayerId;
    /** If a 2D UI piece will exist as a legend or key of what the lens describes.  */
    hasLegend?: boolean;
    /** If true, this lens will query the user config settings. Likely only default-lens.ts */
    useUserConfig?: boolean;
}
declare global {
    /**
     * Lens layers need to define a new entry for each layer
     *
     * Example: 'fxs-hexgrid-layer' : HexGridLensLayer
     *
     * !DON'T FORGET to also include the reference in globals.d.ts!
     * */
    interface LensLayerTypeMap {
    }
}
export type LensLayerName = keyof LensLayerTypeMap;
export interface ILensLayer {
    /** Called when a layer is first registered */
    initLayer(): void;
    /** Called when a layer is applied */
    applyLayer(): void;
    /** Called when a layer is removed */
    removeLayer(): void;
    /** Called if present to determine the option name of a lens layer */
    getOptionName?(): string;
}
export declare const LensLayerEnabledEventName: "lens-event-layer-enabled";
export declare const LensLayerDisabledEventName: "lens-event-layer-disabled";
type LensLayerEventName = typeof LensLayerEnabledEventName | typeof LensLayerDisabledEventName;
/**
 * LensLayerEvent is fired when a lens layer is enabled or disabled
 */
export declare class LensLayerEvent extends CustomEvent<{
    layer: LensLayerName;
}> {
    constructor(name: LensLayerEventName, layer: LensLayerName);
}
export declare const LensActivationEventName: "lens-event-active-lens";
export interface LensActivationEventDetail {
    prevLens: LensName | undefined;
    activeLens: LensName;
    hasLegend: boolean;
}
/**
 * LensActivationEvent is fired when a lens is activated
 */
export declare class LensActivationEvent extends CustomEvent<LensActivationEventDetail> {
    constructor(prevLens: LensActivationEventDetail["prevLens"], activeLens: LensActivationEventDetail["activeLens"], hasLegend: boolean);
}
export interface LensToggleOptions {
    force?: boolean;
    serialize?: boolean;
}
declare class LensManagerSingleton {
    private catalogs;
    private currentCatalog;
    private playerID;
    private showDebugInfo;
    private lenses;
    private layers;
    private activeLensGetter;
    private activeLensSetter;
    private get activeLens();
    private set activeLens(value);
    constructor();
    private enabledLayers;
    registerLens(lensType: LensName, lens: ILens): void;
    registerLensLayer(layerType: LensLayerName, layer: ILensLayer): void;
    getActiveLens(): LensName;
    setActiveLens(type: LensName): boolean;
    getActiveLayers(lens: ILens): Set<keyof LensLayerTypeMap>;
    enableLayers(layerTypes: Set<LensLayerName>): void;
    enableLayer(layerType: LensLayerName): boolean;
    disableLayer(layerType: LensLayerName): boolean;
    getLayerOption(layerType: LensLayerName): string;
    /**
     * toggleLayer toggles a layer on or off
     *
     * @param layerType The name of layer to toggle
     * @param force If true, forces the layer to be enabled. If false, forces the layer to be disabled. If undefined, toggles the layer.
     *
     * @returns true if the layer was toggled, false if the layer was already in the desired state
     */
    toggleLayer(layerType: LensLayerName, options?: LensToggleOptions): boolean;
    isLayerEnabled(layerType: LensLayerName): boolean;
    /**
     * Returns the serialized state of the lens layer, if one exists.
     * @param layerType Name of the layer to look up.
     * @returns true if set to enabled, false if disabled, or undefined if no entry.
     */
    private getSerializedState;
    private readTrackedLayer;
    private writeTrackedLayer;
    private writeEnabledLayers;
    private getEnabledLayers;
    private resetLayersFromSerialize;
    private onLocalPlayerChanged;
}
declare const LensManager: LensManagerSingleton;
export default LensManager;
