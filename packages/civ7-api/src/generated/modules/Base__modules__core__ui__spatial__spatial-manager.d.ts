/**
 * @file spatial-manager.ts
 * @copyright 2022, Firaxis Games
 * @description An object to abstract the functionality provided by the spatial_navigation.js library
 */
declare class SpatialManager {
    private static _Instance;
    private directionMap;
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): SpatialManager;
    private onReady;
    getDirection(inputDirection: InputNavigationAction): string | undefined;
    navigate(sectionId: string, elements: Element[], direction: string): boolean;
}
declare const Spatial: SpatialManager;
export { Spatial as default };
