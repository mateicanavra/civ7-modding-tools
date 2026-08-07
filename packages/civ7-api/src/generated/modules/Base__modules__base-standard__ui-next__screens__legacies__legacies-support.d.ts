/**
 * @file legacies-support.ts
 * @copyright 2026, Firaxis Games
 * @description Utilities for legacies.
 */
export declare function getLegacyCardStyling(legacyType: string): {
    comingSoon: boolean;
    tagType: string;
    traitIcon: string;
    bgColor: string;
    descriptionBG: string;
};
export declare function getStylingFromTag(tagType: string): {
    tagType: string;
    traitIcon: string;
    bgColor: string;
    descriptionBG: string;
};
export declare function getLegacyTypeFromCardID(cardID: string): string;
export declare function isCrisis(cardInfo: AgeCardInfo): any;
export declare function parseCardText(args: string): any;
export declare function parseCardTextArray(args: string[]): any;
export declare function addAvailableCard(typeID: string): boolean;
export declare function removeAvailableCard(typeID: string): void;
export declare function markCompletedDeck(): void;
export declare function selectCapital(cityID: ComponentID, changeName?: boolean): void;
