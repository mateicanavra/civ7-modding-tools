/**
 * model-victory-progress.ts
 * @copyright 2021-2024, Firaxis Games
 * @description Gathers the score data for the era victory conditions
 */
import { IDisplayRequestBase } from "/core/ui/context-manager/display-queue-manager.js";
export interface PlayerScore {
    playerID: PlayerId;
    leaderName: string;
    score: number;
    scoreGoal: number;
    scoreIcon: string;
    leaderPortrait: string;
    rankIcon: string;
    rank: number;
    victoryType: string;
    victoryClass: string;
    victoryTurn: number;
    victoryAchieved: boolean;
}
export declare const VictoryAchievedScreenCategory: "VictoryAchieved";
export interface VictoryRequest extends IDisplayRequestBase {
    milestoneDefinition: AgeProgressionMilestoneDefinition;
}
declare class VictoryProgressModel {
    playerScores: PlayerScore[];
    victoryEvent: TeamVictory_EventData | undefined;
    private onUpdate?;
    private rankingsHotkeyListener;
    private _advisorVictoryTab;
    get advisorVictoryTab(): number;
    set updateAdvisorVictoryTab(index: number);
    constructor();
    private onVictoryManagerUpdate;
    set updateCallback(callback: (model: VictoryProgressModel) => void);
    private onTeamVictory;
    private onAgeEnded;
    private onPlayerDefeated;
    private onLegacyPathMilestoneCompleted;
    update(): void;
    private createScoreData;
    private onRankingsHotkey;
    getBackdropByAdvisorType(advisorType: AdvisorType): string;
    getEnabledLegacyPaths(): LegacyPathDefinition[];
}
declare const VictoryProgress: VictoryProgressModel;
export { VictoryProgress as default };
