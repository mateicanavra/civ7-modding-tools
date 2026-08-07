import { type Component, type ParentComponent, type Resource } from "solid-js";
export declare const ImageCacheContext: any;
type stringOrFunction = string | (() => string[]);
export interface ImageCacheContextValue {
    /**
     * Registers images with the cache.
     * NOTE: This will only invoke the functions and do work if the unique id does not already exist in the cache.
     */
    registerImages: (id: symbol, urls: stringOrFunction[]) => void;
    /**
     * Unlike `registerImages` this method will not early out if the id symbol has already been encountered.
     * Instead, images previously registered or updated with that id will be replaced with the new list of images.
     */
    updateImages: (id: symbol, urls: stringOrFunction[]) => void;
    images?: Resource<void>;
}
export declare const useImageCache: () => any;
export declare const ImageCacheProvider: ParentComponent;
export declare const ImageCacheTrigger: Component;
export {};
