/**
 * @file utililties-color.ts
 * @copyright 2021-2025, Firaxis Games
 */
export declare enum HighlightColors {
    unitSelection = 4292584979,
    unitPossibleMovement = 4294967040,
    unitPossibleMovementShadow = 4291611648,
    unitAttack = 4278198271,
    unitAttackShadow = 4278198237,
    unitMovementZOC = 4278190335,
    unitMovementZOCShadow = 0,
    unitCommanderRadius = 4294967295
}
/**
 * The variants of a color
 * @param {string} mainColor The root color
 * @param {string} textColor Body text color (has the most contrast against other colors in the color scheme)
 * @param {string} accentColor Decorative color (has the least contrast against other colors in the color scheme)
 * @param {string} moreColor
 * @param {string} tintColor
 */
export interface ColorVariants {
    mainColor: string;
    textColor: string;
    accentColor: string;
    moreColor: string;
    tintColor: string;
}
/**
 * Variants of the colors used for the player
 * @param {ColorVariants} primaryColor The primary color and its text and accent variants
 * @param {ColorVariants} secondaryColor The secondary color and its text and accent variants
 * @param {boolean} isPrimaryLighter True if the primary color's luminence is lighter than the secondary color
 */
export interface PlayerColorVariants {
    primaryColor: ColorVariants;
    secondaryColor: ColorVariants;
    isPrimaryLighter: boolean;
}
/**
 * Converts an hex number color to a RGB string
 * @param {number} hex
 */
export declare const numberHexToStringRGB: (hex: number) => string;
/**
 * Applies a player's colors as a CSS variables onto a given element based on the playerId
 *
 * @param element HTMLElement to set css variables on
 * @param playerId ID of the player (determines which colors are used)
 */
export declare const applyPlayerColorsToElement: (element: HTMLElement, playerId: PlayerId) => void;
export declare const getPlayerColorVariants: (playerId: PlayerId) => PlayerColorVariants | undefined;
/**
 * isPrimaryColorLighter outputs a boolean that is true if the primary color is a lighter value than the secondary color
 * @param playerId ID of the player (determines which colors are used)
 */
export declare const isPrimaryColorLighter: (playerId: PlayerId) => boolean;
/**
 * Convert a single hex number RGB (with optional 0.0 to 1.0 alpha) to a float4
 * @param hex RGB packed into a number
 * @param alpha (1.0) an alpha value.
 * @returns Color values broken out into a float4 structure with each value being between 0.0 and 1.0.
 */
export declare const HexToFloat4: (hex: number, alpha?: number) => float4;
/**
 * Convert R, G, B, and A values into an rgba(r, g, b, a) string
 * @param object Structure with input R, G, B, and A values
 * @returns String in the form "rgba(r, g, b, a)"
 */
export declare const ObjectToRgbaString: (object: {
    r: number;
    g: number;
    b: number;
    a: number;
}) => string;
/**
 * Convert RGBA struct into an rgba(r, g, b, a) string
 * @param rgba Structure of type RGBA
 * @returns String in the form "rgba(r, g, b, a)"
 */
export declare const RGBAToString: (rgba: RGBA) => string;
