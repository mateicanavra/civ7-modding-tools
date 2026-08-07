/**
 * @file utilities-tags.ts
 * @copyright 2025, Firaxis Games
 * @description Utilities to interact with the Tags defined in Gameplay DBs
 */
export declare function composeTagString(tags: string[]): string;
export declare function getConstructibleTagsFromType(type: string): string[];
/** Checks if a constructible has a specific tag type */
export declare function ConstructibleHasTagType(ConstructibleType: string, TypeTag: string): boolean;
