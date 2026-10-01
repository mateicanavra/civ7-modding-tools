/**
 * model-advisor-progress.ts
 * @copyright 2023-2024, Firaxis Games
 * @description Advisor Progress Data Model. This includes victory manager and tutorial for quest data
 */
import { QuestItem } from "/base-standard/ui/quest-tracker/quest-item.js";
import TutorialItem from "/base-standard/ui/tutorial/tutorial-item.js";
import { PlayerData } from "/base-standard/ui/victory-manager/victory-manager.js";
declare class AdvisorProgressModel {
    victoryData: any;
    playerData: PlayerData | null;
    questData: TutorialItem[];
    mileStoneData: AgeProgressionMilestoneDefinition[];
    advisorType: string;
    private onUpdate?;
    private ageInfoList;
    constructor();
    set updateCallback(callback: (model: AdvisorProgressModel) => void);
    private updateGate;
    private onVictoryManagerUpdate;
    getActiveQuest(advisorType: AdvisorType): QuestItem | undefined;
    /**
     * @param {AdvisorType} type Category to filter Victory Quests.
     * @returns An ordered list of quests by advisor
     */
    getQuestsByAdvisor(type: AdvisorType): QuestItem[];
    isQuestTracked(quest: QuestItem): boolean;
    updateQuestTracking(quest: QuestItem, isTracked: boolean): void;
    getLegacyPathClassTypeByAdvisorType(advisorType: AdvisorType): string | undefined;
    getAdvisorStringByAdvisorType(advisorType: AdvisorType): string;
    getAdvisorVictoryLoc(advisorType: AdvisorType): string;
    getCivilopediaVictorySearchByAdvisor(advisorType: AdvisorType): string;
    getAdvisorPortrait(advisorType: AdvisorType): string;
    getAdvisorProgressBar(advisorType: AdvisorType): string;
    getAdvisorVictoryIcon(advisorType: AdvisorType): string;
    getRewardGrantIcon(rewardType: string | undefined): string;
    getPlayerProgress(advisor: AdvisorType, currentAge: string): PlayerData | null;
    private getLegacyPathFromAdvisor;
    getAdvisorMileStones(advisorType: AdvisorType): any;
    getAgeStringByType(ageType: string): string | undefined;
    getMaxScoreForAdvisorType(advisor: AdvisorType): number;
    getDarkAgeIcon(advisor: AdvisorType, playerProgress: number, darkAgeIcon?: string): string;
    getDarkAgeBarPercent(advisor: AdvisorType): number;
    isRewardMileStone(advisor: AdvisorType, pip: number): boolean;
    isMilestoneComplete(advisor: AdvisorType): boolean;
    /**
     * Determine the milestone progress amount given for an advisor
     * @param advisor Which advisor this is for
     * @param milestoneRewardNum The milestone reward number this represents
     * @returns The associate reward amount with the milestone or 0 if one can't be found.
     */
    getMilestoneProgressAmount(advisor: AdvisorType, milestoneRewardNum: number): number;
    getDarkAgeReward(advisor: AdvisorType): AgeProgressionDarkAgeRewardInfoDefinition | undefined;
}
declare const AdvisorProgress: AdvisorProgressModel;
export { AdvisorProgress as default };
