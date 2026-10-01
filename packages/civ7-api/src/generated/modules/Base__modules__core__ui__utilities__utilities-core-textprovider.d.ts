/**
 * Text Provider utility funcitons
 * @copyright 2020-2024, Firaxis Games
 *
 * Helpers for finding, composing, and formatting text for all purposes.
 */
/** ================================================================
 *
 *  FORMATTING
 *
 * =============================================================== */
export declare function formatStringArrayAsListString(strings: string[], separator?: string): string;
export declare function formatStringArrayAsNewLineText(strings: string[], lineBreaks?: number): string;
/** ================================================================
 *
 *  CONSTRUCTIBLE PARSING
 *
 * =============================================================== */
export declare function composeConstructibleDescription(constructible: ConstructibleType, city?: City | null): string;
export declare function getConstructibleEffectStrings(constructible: ConstructibleType, city?: City | null): {
    baseYield: string | undefined;
    adjacencies: string[];
    effects: string[];
};
export declare function parseConstructibleAdjacency(def: Adjacency_YieldChangeDefinition): string;
export declare function parseConstructibleAdjacencyNameOnly(def: Adjacency_YieldChangeDefinition): string;
/**
 * Progression Tree Parsing
 * @param node
 * @param unlocks
 * @returns
 */
export declare function composeProgressionTreeNodeUnlocks(node: NodeDisplayData, unlocks?: NodeUnlockDisplayData[]): any[];
export declare function composeProgressionTreeNodeUnlocksSplit(node: NodeDisplayData, unlocks?: NodeUnlockDisplayData[]): any[];
export declare function quickFormatProgressionTreeNodeUnlocks(nodeDef: ProgressionTreeNodeDefinition): string;
/**
 * Modifier Parsing
 * @param modifierId
 * @param context
 * @returns
 */
export declare function getModifierTextByContext(modifierId: string, context: string): string;
/**
 * Modifier Parsing
 * @param modifierId
 * @param context
 * @returns
 */
export declare function getModifierArgumentByContext(modifierId: string, context: string): string;
export declare function fixupNNBSP(dt: string): any;
/**
 * Round a floating point number to two decimal places.
 * @param {number} v the value to round
 * @returns The same number but rounded to two decimal places (hundreds).
 */
export declare function roundTo2(v: number | undefined): number;
