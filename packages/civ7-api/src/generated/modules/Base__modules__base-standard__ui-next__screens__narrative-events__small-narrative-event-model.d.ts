/**
 * @file small-narrative-event-model.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Data model and factory for small narrative event popups.
 */
export interface SmallNarrativeEventChoice {
    key: string;
    mainText: string;
    rewardText: string;
    actionText: string;
    icons: NarrativeRewardIconDefinition[];
    canAfford: boolean;
}
export interface SmallNarrativeEventData {
    targetStoryId: ComponentID;
    bodyText: string;
    choices: SmallNarrativeEventChoice[];
    storyCoordinates: float2 | null;
    storyType: "LIGHT" | "DISCOVERY";
    leaderCiv: string;
}
export declare function createSmallNarrativeEventData(): SmallNarrativeEventData | null;
export declare function getPrimaryChoiceIcon(icons: NarrativeRewardIconDefinition[]): string;
export declare function chooseNarrativeDirection(targetStoryId: ComponentID, choiceKey: string, icons: NarrativeRewardIconDefinition[]): boolean;
