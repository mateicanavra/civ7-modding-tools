/**
 * @file triumph-tracking-manager.ts
 * @copyright 2025-2026, Firaxis Games
 * @description Manages the reading/writing of tracked triumph ids and adds them to the quest tracker
 */
import { IDisplayRequestBase } from "/core/ui/context-manager/display-queue-manager.js";
import { TriumphData } from "/base-standard/ui-next/screens/legacies/legacies-model.js";
export interface TriumphCompletePopupData extends IDisplayRequestBase {
    triumphData: TriumphData;
}
export declare class TriumphTrackingManagerClass {
    private readonly triumphCatalogName;
    private catalog;
    private playerId;
    private isCatalogValueReady;
    constructor(playerId: PlayerId);
    private beforeUnload;
    private onLegacyProgress;
    private onCatalogCommited;
    /**
     * Public exposure for tracked triumphs to be (re-)sent to quest tracker.
     * Required for hotseat when switching players.
     */
    refreshQuestTracker(): void;
    private checkForPendingToUntrack;
    private readTrackedTriumphs;
    private addTriumphToQuestTracker;
    trackTriumph(triumph: LegacyDefinition): void;
    unTrackTriumph(triumph: LegacyDefinition): void;
    setTriumphToUntrack(triumph: LegacyDefinition): void;
    onClickTrackTriumph(legacyType: string): void;
    private writeTrackedLegacies;
}
export declare function getTriumphTrackingManager(): TriumphTrackingManagerClass;
