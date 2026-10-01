/**
 * @file utilities-textprovider.ts			// TODO: Re-evaluate what is a generic text provider and what is specific for a type of file (e.g., trees), break out functions.
 * @copyright 2020-2022, Firaxis Games
 *
 * Helpers for finding, composing, and formatting text for all purposes.
 */
/** ================================================================
 *  Unlock Name/Desc Helpers
 * =============================================================== */
export declare function getUnlockTargetName(targetType: string, targetKind: string): string;
export declare function getUnlockTargetDescriptions(targetType: string, targetKind: string): string[];
export declare function getTraditionDescriptions(traditionType: TraditionType): string[];
/**
 * Get the display name for a progression tree node, including roman numeral suffix for mastery tiers.
 * @param nodeData - The progression tree node data.
 * @param player - The player to be used for Civ Name Injection, where applicable
 * @param appendDepth - Append the mastery depth where applicable. Defaults to true.
 * @returns The localized name with mastery numeral (e.g., "Mysticism", "Mysticism II").
 */
export declare function getNodeName(nodeData: ProgressionTreeNode, player?: PlayerLibrary | null, appendDepth?: boolean): string;
export declare function getNodeNameFromType(nodeType: ProgressionTreeNodeType, depth?: number, player?: PlayerLibrary | null): string;
export declare function getUnlockDepthPrefix(iCurDepth: number, iMaxDepth: number): string;
