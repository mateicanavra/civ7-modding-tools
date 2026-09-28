export interface PreloadedStyle {
    url: string;
    element: HTMLElement;
}
export declare class StyleCache {
    private cachedStylesheetLinks;
    /**
     * Loads a series of stylesheets
     * @param urls A list of urls to load
     * @returns A promise containing an array of loaded stylesheet caches
     */
    loadStyles(...urls: string[]): Promise<PreloadedStyle[]>;
    /**
     * Load a css stylesheet.
     * @param url The url of the stylesheet to be loaded.
     * @returns A promise which resolves the stylesheet cache or rejects it .
     */
    loadStyle(url: string): Promise<PreloadedStyle>;
}
