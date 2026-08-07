/**
 * World VFX Manager
 * @copyright 2020-2023, Firaxis Games
 *
 * Handles ambient and game event based VFX.
 */
declare class WorldVFXManager {
    private static instance;
    private ambientVfxModelGroup;
    private discoveryHashes;
    constructor();
    onReady(): void;
    private onDistrictAddedToMap;
    private onConstructibleAddedToMap;
    private onPlotEffectAddedToMap;
    private onPlotEffectRemovedFromMap;
    private onRouteAddedToMap;
}
declare const WorldVfx: WorldVFXManager;
export { WorldVfx as default };
