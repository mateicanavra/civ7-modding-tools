/**
 * @file spatial-wrapper.ts
 * @copyright 2022, Firaxis Games
 * @description A wrapper for the JS spatial_navigation library
 */
declare class SpatialWrapper {
    private static _Instance;
    /**
     * Singleton accessor
     */
    static getInstance(): SpatialWrapper;
    init(): void;
    /**
     * Navigate within a spatial section given its focusable children and a direction.
     * @param sectionId The section ID of the shared parent slot.
     * @param focusableChildren Children Elements that are assumed to be focusable.
     * @param direction The movement direction
     * @returns true if still live, false if input should stop (the navigation was effective).
     */
    navigate(sectionId: string, focusableChildren: Array<Element>, direction: string): boolean;
}
declare const SpatialWrap: SpatialWrapper;
export { SpatialWrap as default };
