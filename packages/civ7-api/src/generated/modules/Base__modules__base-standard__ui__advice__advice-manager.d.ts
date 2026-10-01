import { AdvicePage, BundleDefinition, ItemDefinition } from "/base-standard/ui/advice/advice-defines.js";
import { NotificationID } from "/base-standard/ui/notification-train/model-notification-train.js";
import { TutorialAdvisorType } from "/base-standard/ui/tutorial/tutorial-item.js";
/**
 * Handles giving out advice for the Advisor council "books" and other systems.
 */
declare class AdviceManagerClass {
    private catalog;
    private advisorMinds;
    private localPlayerID;
    private showPopupOnce;
    /**
     * Open a catalog to load/save values to the save-game, to track pages selected for the advisors.
     *
     * Hotseat support: this will work as-is if the UI is reloaded between players.
     * If we persist the UI tree (and hence this manager) then either this CTOR functionality
     * needs to be moved out into an init() or the catalog needs to be switched based on player changes.
     */
    constructor(playerId: PlayerId);
    /**
     * Helper to create empty arrays for what is in an advisor's "mind"."
     */
    private createMind;
    /**
     * Realize a deferred request to consider adding pages.
     * Likely only called one per age when initially loading advice bundles.
     */
    updateGate: any;
    /**
     * Event player turn has started
     * @param data Information about the player activating on this turn.
     */
    private onPlayerTurnActivated;
    /**
     * DEBUG - list contents of a bundle
     */
    private debugInspectBundle;
    /**
     * DEBUG - list out what's in a mind, will attempt to determine advisorType from associated bundles if one isn't passed in.
     */
    private debugInspectMind;
    /**
     * DEBUG - Inspect the contents of the system
     */
    private debugInspect;
    /**
     * Helper to return if a bundle of advice pages is done being activated and can be retired.
     * @param bundle A bundle of advisor advice.
     * @returns true if bundle has no new pages to add.
     */
    private bundleIsDone;
    /**
     * Add a page to a mind.
     * @param mind Adivsor mind to add page into.
     * @param pageId Identifier of the page
     * @returns true if successfully added, false otherwise (such as duplicate)
     */
    private addPage;
    /**
     * Determines the index # of a page.
     * @param mind Advisor mind who has the book to look through.
     * @param pageId The ID of the page to be looked up.
     * @returns -1 if not found, otherwise the index of the page.
     */
    private existingPageIndex;
    /**
     * Convert the advisor type to the row # for a notification (watch-out) warning.
     * @returns hash of the appropriate type of -1 if unknown advisor.
     */
    private advisorTypeToWarningHash;
    /**
     * Check if a bundle has become obsolete.
     * @param bundle The bundle to check
     * @returns true if just made obsolete, false otherwise.
     */
    private obsoleteCheck;
    /**
     * Signal to game engine to generate a warning notification based on information
     * from the added page of advise.
     * @param mind Which Advisor "mind" this advice page is from.
     * @param pageId The page of Advice.
     */
    private generateWarning;
    /**
     * Go through each advisor and auto-select the next page if it's time.
     */
    private considerNextPages;
    /**
     * De-serialize mind-specific save information.
     * Bundle based information will be overlayed as bundles are added back.
     * @param mind The advisor's "mind".
     */
    private readFromDisk;
    /**
     * Convert an array of page IDs to a format that can be serialized as a property
     * @param pageIds Array of pageIDs.
     * @returns Single string to write to disk.
     */
    private serializePageIds;
    /**
     * Take a string which is actually a serialize version of page Ids.
     * Purposely does not use map() inorder to prevent another scope.
     * @param idString String containing a serialize array of PageIDs read from disk.
     * @returns Array of pageIDs
     */
    private unserializePageIds;
    /**
     * Serialize the entire mind to save file.
     * @param mind The advisor mind to output.
     */
    private writeToDisk;
    /**
     * Read in bundle data from disk (if it exists) and overwrite existing fields with i.
     * @param bundle The bundle to modify.
     */
    private readBundleData;
    /**
     * Write out a bundle's data to disk.
     * @param bundle The bundle to write.
     */
    private writeBundleData;
    /**
     * Take bundle defintion and turn it into a full blow bundle data to track.
     * @param bundle A bundle of advice to potentially add to the "advice book"
     */
    addBundle(bundle: BundleDefinition): void;
    /**
     * Wrap an "item" into a one item bundle for delivery.
     * @param item
     */
    addItem(item: ItemDefinition): void;
    /**
     * Convert game engine string type to strong type for advisors.
     * @param adviceTypeString A string from the game engine (XML)
     * @returns Enum for the corresponding advisor or NO_ADVISOR if mismatch.
     */
    private getAdvisorTypeFromString;
    /**
     * Convert TutorialAdvisorTypes to AdvisorType.
     * @param tutorialAdvisorType An Advisor enum used by the tutorial
     * @returns Enum for the corresponding advisor or NO_ADVISOR if mismatch.
     */
    getAdvisorTypeFromTutorialAdvisorType(tutorialAdvisorType: TutorialAdvisorType): AdvisorType;
    /**
     * Immediately add a page based on a (watch-out) notification if it contains advisor information to share.
     * @param notificationId The game engine notificationID.
     */
    addFromWatchOut(notificationId: NotificationID): void;
    /**
     * Take a page from a bundle and add it to the associated page.
     * @param bundle the bundle of advice to pull from.
     * @return pageID associated
     */
    private getNextPageId;
    /**
     * Helper to generate an empty "page", usually being returned as part of an error.
     * @returns An empty page.
     */
    private emptyPage;
    /**
     * Build the bundle of LOC strings which constitute a page of advice from the advisor.
     * @param pageId The ID to build the advice off of.
     * @returns Structure populated with LOC strings, structure of empty strings if it fails.
     */
    private createAdvice;
    /**
     * On which turn was the advice last served for an advisor?
     * Public so scripts can check.
     * @param advisorType The advisor's mind to look at. If none is provided,
     * 					  will look across all minds and provide the most
     * 					  recent turn number
     * @returns -1 for none, otherwise the turn for the mind (or all minds) in which an item was last served
     */
    lastTurnAdviceGiven(advisorType?: AdvisorType): number;
    /**
     * Returns the pages of information for a given advisor.
     * @param advisorType The advisor to get pages for.
     * @returns Array of structures represnting "pages" in a book of advice from one advisor.
     */
    private getAdvicePages;
    /**
     * @returns The ordered list of page advice for the culture advisor.
     */
    getCulturePages(): AdvicePage[];
    /**
     * @returns The ordered list of page advice for the military advisor.
     */
    getMilitaryPages(): AdvicePage[];
    /**
     * @returns The ordered list of page advice for the economic advisor.
     */
    getEconomicPages(): AdvicePage[];
    /**
     * @returns The ordered list of page advice for the scientific advisor.
     */
    getScientificPages(): AdvicePage[];
    /**
     * Helper to get if a particular advisor 'mind" is followed
     * @param advisorType Which advisor to look at
     * @returns true if followed false if not (or advisor not found).
     */
    isFollowed(advisorType: AdvisorType): boolean;
    isCultureFollowed(): boolean;
    isMilitaryFollowed(): boolean;
    isEconomicFollowed(): boolean;
    isScientificFollowed(): boolean;
    isAnyFollowed(): boolean;
    /**
     * Internal helper to set if a particular advisor 'mind" is followed.
     * @param advisorType Which advisor to look at
     * @param isFollowed Whether or not the advisor is followed.
     */
    private setFollowedInternal;
    /**
     * Internal helper to report an advisor changed
     * @param advisorType Which advisor to report
     * @param isFollowed Whether or not the advisor is followed.
     */
    private reportAdvisorStatusEvent;
    setCultureFollowed(isFollowed: boolean): void;
    setMilitaryFollowed(isFollowed: boolean): void;
    setEconomicFollowed(isFollowed: boolean): void;
    setScientificFollowed(isFollowed: boolean): void;
    /**
     * Function helper for Tuner Panel functions.
     * @param advisorType
     * @returns List of bundle IDs and their state, separated by semi-colon.
     */
    private getTunerBundles;
    /**
     * Tuner Panel request to get bundles in a form for the controls.
     * List control takes one string per row, with semicolon between columns.
     */
    tunerGetBundles(): string[][];
    /**
     * Tuner Panel request to get bundles in a form for the controls.
     * List control takes one string per row, with semicolon between columns.
     */
    tunerGetItemsInBundle(bundleId: string): string[];
    /**
     * Tuner Panel request to force adding all items from a bundle.
     * @param id
     */
    tunerAddBundleForcibly(id: string): void;
    /**
     * Tuner Panel request to force adding a single page.
     * This will automatically find the bundle and corresponding mind.
     * @param id The identifier of the page to add.
     */
    tunerAddPageForcibly(id: string): void;
    private tunerClearMind;
    tunerClearCultureMind(): void;
    tunerClearEconomicMind(): void;
    tunerClearMilitaryMind(): void;
    tunerClearScienceMind(): void;
}
export default function getAdviceManager(): AdviceManagerClass;
/**
 * Add advice item across all players.
 * @param item The piece of advice to add.
 */
export declare function adviceAddItem(item: ItemDefinition): void;
/**
 * Add advice item across all players.
 * @param item The piece of advice to add.
 */
export declare function adviceAddBundle(bundle: BundleDefinition): void;
export {};
