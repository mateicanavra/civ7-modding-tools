declare class ComponentUtilitiesImpl {
    private imageCache;
    private styleCache;
    /**
     * Loads stylesheets associated with a component
     * @param urls A list of stylesheet urls to load
     */
    loadStyles(...urls: string[]): any;
    /**
     * Preloads a list of images used by a component
     * @param urls A list of image URLs to load
     */
    preloadImages(...urls: string[]): any;
}
export declare const ComponentUtilities: ComponentUtilitiesImpl;
export {};
