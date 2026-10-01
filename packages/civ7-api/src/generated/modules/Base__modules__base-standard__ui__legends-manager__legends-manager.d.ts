/**
 * legends-manager.ts
 * @copyright 2024, Firaxis Games
 * @description Unified manager object to query legend and challenges data
 */
export interface EarnedProgressItem {
    progressItemType?: number;
    leader: string;
    title: string;
    startLevel: number;
    nextLevel: number;
    previousXP: number;
    gainedXP: number;
    previousLevelXP: number;
    nextLevelXP: number;
}
export interface ChallengeItem {
    title: string;
    description: string;
    points: number;
    rewardIcon: string;
}
export interface UnlockedItem {
    title: string;
    description: string;
    url: string;
}
export interface LegendsData {
    progressItems: EarnedProgressItem[];
    completedFoundationChallenge: ChallengeItem[];
    completedLeaderChallenge: ChallengeItem[];
    unlockedFoundationRewards: UnlockedItem[];
    unlockedLeaderRewards: UnlockedItem[];
}
declare class LegendsManagerImpl {
    getData(): LegendsData;
    getDummyData(): LegendsData;
}
declare const LegendsManager: LegendsManagerImpl;
export { LegendsManager as default };
