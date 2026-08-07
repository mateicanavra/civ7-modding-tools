/**
 * @file plot-icons-manager.ts
 * @copyright 2022, Firaxis Games
 * @description Tracks/stores the data needed for plot icons
 */
export interface PlotIconDefine {
    iconType: string;
    location: PlotCoord;
    attributes?: Map<string, string>;
}
interface PlotIconAddEventDetail {
    plot: PlotIconDefine;
}
export declare class PlotIconRootAddEvent extends CustomEvent<PlotIconAddEventDetail> {
    constructor(plot: PlotIconDefine);
}
interface PlotIconRemoveEventDetail {
    plotType: string;
    plotLocation: PlotCoord | null;
}
export declare class PlotIconRootRemoveEvent extends CustomEvent<PlotIconRemoveEventDetail> {
    constructor(detail: PlotIconRemoveEventDetail);
}
declare global {
    interface HTMLElementEventMap {
        "plot-icons-root-add": PlotIconRootAddEvent;
        "plot-icons-root-remove": PlotIconRootRemoveEvent;
    }
}
declare class PlotIconsManagerSingleton {
    private static signletonInstance;
    /** The icon root component used to sent events too */
    private iconRoot;
    /** Queue of custom events used to cache events before the root component is alive */
    private eventQueue;
    /** Lookup for plot icons based on location hash */
    private perPlotMap;
    /** Flag set by debug panel to disable plot icons system. */
    private systemDisabled;
    /** Temporary element used to hold place in DOM when system is disabled. */
    private disabledPlaceholder;
    /**
     * Singleton accessor
     */
    static getInstance(): PlotIconsManagerSingleton;
    constructor();
    rootAttached(root: Element): void;
    /**
     * @description Called by a plot icon to let manager directly access it's instance.
     * @param {PlotIcons} stack - plot icons which manager created.
     */
    addStackForTracking(stack: Component): void;
    /**
     * Add a plot icon to a specifc plot location with the option attributes
     * @param {string} type Type of plot icon to be add
     * @param {PlotCoord} location Location for this plot icon
     * @param {Map<string, any>} attributes Optional attributes that this icon type needs
     */
    addPlotIcon(type: string, location: PlotCoord, attributes?: Map<string, string>): void;
    /**
     * Removes all plot icons of a specificed type or only that type of icon from the provided plot location
     * @param type Type of plot icon to be removed
     * @param location If provide only icons of the provided type will be removed from this location
     */
    removePlotIcons(type: string, location?: PlotCoord | null): void;
    getPlotIcon(x: number, y: number): Component | undefined;
    getPlotIcons(): IterableIterator<Component>;
    private addPlotIconToDataMap;
}
declare const PlotIconsManager: PlotIconsManagerSingleton;
export { PlotIconsManager as default };
