/**
 * @file advice-support.ts
 * @copyright 2026, Firaxis Games
 * @description Provides common functionality for advice items.
 */
/**
 * Priorities for a piece of advice (or a bundle) can be any value.
 * The higher priority values tend to be evaluated first.
 * These enums are provided as a handy standard set to use.
 */
export declare enum AdvicePriority {
    Low = 50,
    Default = 100,
    High = 200,
    Utmost = 300
}
/**
 * Choose to perform selection every X turns.
 * @param turns how many turns to wait for a selet to occur.
 * @param offset offset from 0
 * @returns true if the current turn alignes with turns and the offset
 */
export declare function selectAfterTurns(turns: number, offset?: number): boolean;
/**
 * Determine if a piece of advice should be selected based on the current turn and game speed
 * @param start The turn number to start selecting advice.
 * @param duration The duration in turns for which the advice should be selected.
 * @param offset An optional offset to stagger advice selection.
 * @return true if the advice should be selected on the current turn, false otherwise.
 */
export declare function shouldSelect(start: number, durration: number, offset?: number): boolean;
/**
 * Does local player have at least X wonders?
 * @param amount Number of wonders to have.
 * @return true if player has at least the amount of wonders
 */
export declare function hasWonders(amount: number): boolean;
/**
 * Does local player have a specific civic?
 * @param name The identifier of a civic node (e.g., "NODE_CIVIC_AQ_MAIN_CODE_OF_LAWS")
 * @returns true if player has the civic, false otherwise.
 */
export declare function hasCivic(name: string): boolean;
/**
 * Does local player have gold in a specific range?
 * @param min Minimum amount (inclusive) or -1 for no minimum.
 * @param max Maximum amount (inclusive) or -1 for unbounded (no maximum).
 * @returns true if player has gold in that range.
 */
export declare function goldInRange(min: number, max: number): boolean;
/**
 * If any of the supplied names of tech nodes are unlocked.
 * @param names An array of tech node names.
 * @returns true if any one of them has been unlocked.
 */
export declare function anyTechUnlocked(names: string[]): boolean;
/**
 * Is the local player at war with any other major civilizations?
 * @returns true if at war.
 */
export declare function isAtWar(): boolean;
/**
 * @returns The number of conquered settlements.
 */
export declare function amountConqueredSettlements(): number;
/**
 * @returns The true if player has created a religion.
 */
export declare function playerHasReligion(): boolean;
