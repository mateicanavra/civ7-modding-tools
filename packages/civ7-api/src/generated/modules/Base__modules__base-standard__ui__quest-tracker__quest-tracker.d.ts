/**
 * @file quest-tracker.ts
 * @copyright 2023-2026, Firaxis Games
 * @description Tracks "quests" from narrative, tutorial, etc... loaded via modinfo.
 *
 */
import { QuestItem, VictoryQuest, VictoryQuestState } from "/base-standard/ui/quest-tracker/quest-item.js";
/**
 * ActiveDeviceTypeChangedEvent is triggered when the active input device type changes.
 */
export interface QuestListUpdatedEventDetail {
    name: string;
}
export declare const QuestListUpdatedEventName: "quest-list-update";
export declare class QuestListUpdatedEvent extends CustomEvent<QuestListUpdatedEventDetail> {
    constructor(name: string);
}
/**
 * ActiveDeviceTypeChangedEvent is triggered when the active input device type changes.
 */
export interface QuestCompletedEventDetail {
    name: string;
}
export declare const QuestCompletedEventName: "quest-completed";
export declare class QuestCompletedEvent extends CustomEvent<QuestCompletedEventDetail> {
    constructor(name: string);
}
/**
 * Quest Tracker is requesting any systems that push it data to do so now because it's
 * performing an update.  So far only needs to do this for HotSeat between players.
 */
export declare const QuestTrackerRefreshRequestName: "quest-tracker-refresh-request";
export declare class QuestTrackerRefreshRequest extends CustomEvent<never> {
    constructor();
}
/**
 * Holds the data for all "quest items" that come in from various source.
 * This is data-only, with no displayable values.
 */
declare class QuestTracker {
    private items;
    private trackerItemAddedLiteEvent;
    private trackerItemRemovedLiteEvent;
    private readonly questCatalogName;
    private catalog;
    private _listSelectedQuest;
    private _isDrawerOut;
    set selectedQuest(value: string);
    get selectedQuest(): string;
    set isDrawerOut(value: boolean);
    get isDrawerOut(): boolean;
    /**
     * CTOR
     * @param playerId, ID of the player this tracker belongs to.
     */
    constructor(playerId: PlayerId);
    get AddEvent(): ILiteEvent<QuestItem>;
    get RemoveEvent(): ILiteEvent<QuestItem>;
    /**
     * Items should not be manipulated when handed out.
     */
    getItems(): IterableIterator<Readonly<QuestItem>>;
    /**
     * Check if the tracker has a specific item.
     * @param id The id of the item to check for.
     * @param system An optional parameter to match against
     */
    has(id: string, system?: string): boolean;
    /**
     * Check if the tracker is empty.
     */
    get empty(): boolean;
    /**
     * Get a specific item from the tracker.
     * @param id The id of the item to get.
     */
    get(id: string): Readonly<QuestItem> | undefined;
    /**
     * Add (or update) an item to the quest tracker.
     */
    add(item: QuestItem): void;
    /**
     * Remove item from quest tracker.
     * @param {string} id The item ID to remove.
     * @param {string} system The system the item belongs to.
     * @param {object} params.force If not used, the tracker makes Legacy Quests to appear as completed instead of removed.
     */
    remove(id: string, system: string, params?: {
        forceRemove: boolean;
    }): void;
    /**
     * Writes a Quest's Victory in memory
     */
    writeQuestVictory(quest: QuestItem): any;
    /**
     * Reads a Quest's Victory from memory
     */
    readQuestVictory(id: string): VictoryQuest;
    /**
     * Sets state for a quest object
     * @returns true if the state was set
     */
    setQuestVictoryState(quest: QuestItem, state: VictoryQuestState): boolean;
    setQuestVictoryStateById(id: string, state: VictoryQuestState): boolean;
    isQuestVictoryUnstarted(id: string): boolean;
    isQuestVictoryInProgress(id: string): boolean;
    isQuestVictoryCompleted(id: string): boolean;
    setPathTracked(isTracked: boolean, pathType: AdvisorType): void;
    isPathTracked(pathType: AdvisorType): any;
    /**
     * Handy utility to update quest-list
     */
    updateQuestList(questName: string): void;
}
export declare function getQuestTracker(): QuestTracker;
export {};
