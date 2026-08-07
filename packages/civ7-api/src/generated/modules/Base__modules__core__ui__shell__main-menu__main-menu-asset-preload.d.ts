/**
 * @file Main menu asset preload
 * @copyright 2026 Firaxis Games
 * @description Preload and keep cached the most visible UI textures needed for the front end to reduce pop-in
 */
declare class MainMenuAssetPreload {
    private readonly preloadedTextureNames;
    private loadedImages;
    preload(): void;
    private preloadTextures;
}
export declare const mainMenuAssetPreload: MainMenuAssetPreload;
export {};
