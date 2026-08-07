/**
 * @file utilities-overlay.ts			// TODO: Re-evaluate what is a generic text provider and what is specific for a type of file (e.g., trees), break out functions.
 * @copyright 2020-2025, Firaxis Games
 *
 * Helpful Constants that are used with overlays.
 */
/**
 * This enum is used to centralize the render piority for all of the overlays in the UI system.
 * that way if we need to change the render order for the overlays it can be done in one placed based on the category to each overlay.
 * If you are adding a new overlay please add its priority to this enum, or use one of the existing priority values.
 *
 */
export declare enum OVERLAY_PRIORITY {
    MIN_PRIORITY = 0,
    HEX_GRID = 1,
    CONTINENT_LENS = 2,
    SETTLER_LENS = 3,
    PLOT_HIGHLIGHT = 4,
    CULTURE_BORDER = 5,
    UNIT_ABILITY_RADIUS = 6,
    UNIT_COMBAT = 7,
    UNIT_MOVEMENT_SKIRT = 8,
    CURSOR = 9,// This is for cursors implemented in the Overlay system, the game's main plot cursor currently goes through the VFX system
    MAX_PRIORITY = 10
}
