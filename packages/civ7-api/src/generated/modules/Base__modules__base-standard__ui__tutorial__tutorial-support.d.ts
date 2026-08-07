/**
 * @file tutorial-support
 * @copyright 2022, Firaxis Games
 * @description Helper functions for tutorial items. (Any functions here should not maintain state!)
 *
 */
import TutorialItem, { TutorialActionPrompt, TutorialCalloutOptionDefinition } from "/base-standard/ui/tutorial/tutorial-item.js";
export declare function calloutAcceptNext(nextID: string): TutorialCalloutOptionDefinition;
export declare function calloutBeginNext(nextID: string): TutorialCalloutOptionDefinition;
export declare function calloutCloseNext(nextID: string): TutorialCalloutOptionDefinition;
export declare function calloutContinueNext(nextID: string): TutorialCalloutOptionDefinition;
export declare function calloutExploreNext(nextID: string): TutorialCalloutOptionDefinition;
export declare function calloutCancelQuest(): TutorialCalloutOptionDefinition;
/**
 * Ensure that an object has 1 or more series of properties on it.
 * @param {Object} obj The object to query.
 * @param {Array<string>} properties Array of strings with the names of properties.
 * @returns true if all properties exist on the object.
 */
export declare function ensurePropertiesExist(obj: any, properties: string[]): boolean;
/**
 * Callout helper function for opening the Civilopedia to a desired page
 * @param searchTerm string parameter indicating the name of the page to open to
 */
export declare function OpenCivilopediaAt(searchTerm: string): any;
export declare function hasAnyWondersUnlocked(_TutorialItem: TutorialItem): boolean;
/**
 * Did a specific tech unlock for the local player? (Typically raised with a 'TechNodeCompleted' engine event.)
 * @param node the tutorial item that raised this function
 * @param techName the NodeType to match
 * @param depth required depth
 * @returns true if the tech node that just unlocked matched the techname
 */
export declare function didTechUnlock(node: TutorialItem, techName: string, depth?: number): boolean;
/**
 * Did a specific civic unlock for the local player? (Typically paired with 'CultureNodeCompleted' engine event)
 * @param node the tutorial item that raised this function
 * @param civicName the NodeType to match
 * @param depth required depth
 * @returns true if the civic node that just unlocked matched the culture name
 */
export declare function didCivicUnlock(node: TutorialItem, civicName: string, depth?: number): boolean;
/**
 * Obtain the unit related to the active tutorial event.
 * @param errorMsg A string to show in the log if it fails.
 * @returns {Unit} Unit object or null if not found.
 */
export declare function getUnitFromEvent(errorMsg?: string): Unit | null;
export declare function getUnitFromOnly(errorMsg?: string): Unit | null;
export declare function hasTreeUnlocks(node: TutorialItem): boolean;
/**
 * Is a unit of a certain type?
 * @param {TutorialItem} node The tutorial node making this call.
 * @param {string[]} unitTypeNames An array of unit type names to check against.
 * @returns true if match, false otherwise.
 */
export declare function isUnitOfType(node: TutorialItem, unitTypeNames: string[]): boolean;
/**
 * Is a unit of a certain domain?
 * @param {TutorialItem} node The tutorial node making this call.
 * @param {string} eDomain the domain to look up
 * @returns true if match, false otherwise.
 */
export declare function isUnitOfDomain(node: TutorialItem, domain: string): boolean;
/**
 * Is a resource a treasure reource?
 * @param {TutorialItem} node The tutorial node making this call.
 * @returns true if match, false otherwise.
 */
export declare function isTreasureResource(node: TutorialItem): boolean;
/**
 * Gets the unit name from the last event
 * @returns The unit name, NO_UNIT otherwise.
 */
export declare function getUnitName(): string;
/**
 * Gets the name of a unit that has the specified tag
 * @param tag the tag to search for
 * @returns The unit name, NO_UNIT otherwise.
 */
export declare function getNameOfFirstUnitWithTag(tag: string): string;
/**
 * Gets the name of an unlocked unit that has the specified tag
 * @param tag the tag to search for
 * @returns The unit name, NO_UNIT otherwise.
 */
export declare function getNameOfFirstUnlockedUnitWithTag(tag: string): string;
/**
 * Gets the text prompts from a the action prompts definition
 * @param actionPrompts An array of tutorial action prompts definitions in the tutorial items.
 * @returns Text prompts for each action prompt
 */
export declare function getTutorialPrompts(actionPrompts: TutorialActionPrompt[]): string[];
/**
 * Gets the player's current turn blocking notification
 * @param playerID Player for the current turn blocking notification.
 * @returns The found notification
 */
export declare function getCurrentTurnBlockingNotification(playerID: PlayerId): Notification | undefined | null;
/**
 * Helper function to indicate the next item to be activated.
 * This should be used in "onCompleteCheck" to activate based in the user interaction.
 * @param {TutorialItem} item - Item to change the nextID.
 * @param nextID - An ID to activate the next item. If not provided, the next item will be canceled.
 * @returns true after the process is complete. Can be used as a return value for "onCompleteCheck".
 */
export declare function setNextItemActivation(item: TutorialItem, nextID?: string): boolean;
/**
 * Helper function to check state for previous and next quest to activate current triggering tutorial item
 * @param prevQuestTracking: Previous tracking item quest
 * @param currQuestTracking: Current tracking item quest
 */
export declare function canQuestActivate(prevQuestTracking: string, currQuestTracking: string): any;
/**
 * Helper function to activate the next tracking quest in a legacy path. This is only to be used on a disabled tutorial state
 * @param item: current tutorial item (victory quest)
 */
export declare function activateNextTrackedQuest(item: TutorialItem): void;
