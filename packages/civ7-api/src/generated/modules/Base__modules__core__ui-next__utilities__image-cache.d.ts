export interface PreloadedImage {
    url: string;
    image: HTMLImageElement;
}
export declare class ImageCache {
    private cachedImages;
    /**
     * Loads a series of images
     * @param urls A list of urls to load
     * @returns A promise containing an array of loaded image caches
     */
    loadImages(...urls: string[]): Promise<PromiseSettledResult<PreloadedImage>[]>;
    /**
     * Load an image.
     * @param url The url of the image to be loaded.
     * @returns A promise which resolves the image cache or rejects it .
     */
    loadImage(url: string): Promise<PreloadedImage>;
    /**
     * Unloads all images registered with the cache
     */
    unloadAllImages(): void;
}
