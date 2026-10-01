/**
 * @file civ-unlock-tracking-manager.ts
 * @copyright 2026, Firaxis Games
 * @description Manages tracked civilization gameplay unlocks and mirrors them into the quest tracker.
 */
export declare class CivUnlockTrackingManager {
    private catalog;
    private playerId;
    constructor(playerId: PlayerId);
    private beforeUnload;
    private onPlayerUnlockChanged;
    private onPlayerUnlockProgressChanged;
    private refreshTrackedCivUnlocks;
    private getCivUnlockReward;
    private getGameplayUnlockRequirements;
    private makeRequirementQuestId;
    private getCivTypeForQuestId;
    private getTrackedCivTypes;
    private removeTrackedQuestItemsForCiv;
    private getRequirementProgressForCiv;
    private getGameplayUnlockRequirementStatuses;
    private readTrackedCivUnlocks;
    private addCivUnlockToQuestTracker;
    isTracked(civType: string): any;
    canTrack(civType: string): boolean;
    trackCivUnlock(civType: string): void;
    untrackCivUnlock(civType: string): void;
    private writeTrackedCivUnlocks;
}
export declare function getCivUnlockTrackingManager(): CivUnlockTrackingManager;
