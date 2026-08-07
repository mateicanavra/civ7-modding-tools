/**
 * @file narrative-quest-manager
 * @copyright 2023, Firaxis Games
 * @description Intermediary script that handles the events for narrative quests and translates them to the quest tracker
 *
 */
declare class NarrativeQuestManagerClass {
    private static instance;
    private narrativeQuestUpdateListener;
    private narrativeStoryRemovedListener;
    constructor();
    private initializeListeners;
    /**
     * Hotseat, new player.
     */
    private onLocalPlayerChanged;
    private initializeActiveNarrativeQuests;
    private onNarrativeQuestUpdate;
    private onNarrativeStoryRemoved;
}
declare const NarrativeQuestManager: NarrativeQuestManagerClass;
export { NarrativeQuestManager as default };
