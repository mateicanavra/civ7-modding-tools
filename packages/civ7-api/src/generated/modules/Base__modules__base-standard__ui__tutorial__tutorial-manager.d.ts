/**
 * @file tutorial-manager.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Main coordinator for tutorial content.
 *
 *  Tutorial items are added via "add()" and the "item bank" they are defined in is specified
 *  in the appropriate .modinfo files.
 *	When outputting debug log content it will be prefixed with "TutorialDebug:".
 *	Log messages prefixed with "Tutorial:" are due to a warning or error condition.
 */
import { DisplayHandlerBase, DisplayHideOptions } from "/core/ui/context-manager/display-handler.js";
import { DialogBoxDefinition } from "/core/ui/dialog-box/manager-dialog-box.js";
import { IEngineInputHandler, InputEngineEvent, InputHandlerState } from "/core/ui/input/input-support.js";
import TutorialItem, { TutorialDefinition, TutorialItemModifiers, TutorialDialogDefinition } from "/base-standard/ui/tutorial/tutorial-item.js";
/**
 * The main class of the tutorial engine.
 */
declare class TutorialManagerClass extends DisplayHandlerBase<TutorialItem> implements IEngineInputHandler {
    readonly MAX_CALLOUT_CHECKBOX = 5;
    private dataVersion;
    private tutorialLevel;
    private envRefCount;
    private groups;
    items: TutorialItem[];
    private unseenItems;
    private activeItems;
    private completedItems;
    private persistentItems;
    private overwriteItems;
    private welcomeInstructionsNode;
    private callouts;
    private activationEngineEventNames;
    private completionEngineEventNames;
    private autoplayStartedListener;
    private beforeUnloadListener;
    private turnBeginListener;
    private turnEndListener;
    private activeContextChangedListener;
    private lowerTutorialDialogListener;
    private lowerTutorialCalloutListener;
    private lowerTutorialQuestPanelListener;
    private viewChangedListener;
    private statusChangedLiteEvent;
    private customEventNames;
    dialogData: TutorialDialogDefinition | null;
    private isLocalPlayerTurn;
    private queued;
    private currentTutorialPopupData;
    private inputContext;
    private screenContext;
    private wasSuspended;
    private isPendingShow;
    private lastItemID;
    get isInspecting(): boolean;
    private _calloutBodyParams;
    private _calloutAdvisorParams;
    set calloutBodyParams(value: LocalizedTextArgument[]);
    get calloutBodyParams(): LocalizedTextArgument[];
    set calloutAdvisorParams(value: LocalizedTextArgument[]);
    get calloutAdvisorParams(): LocalizedTextArgument[];
    get currentContextScreen(): string;
    private tutorialPlotFxGroup;
    private _activatingEvent;
    get activatingEvent(): CustomEvent | any | null;
    private _activatingEventName;
    get activatingEventName(): string;
    private _playerId;
    get playerId(): PlayerId;
    private _altPlayerId;
    get altPlayerId(): PlayerId;
    private panelAction;
    private tutorialDialog;
    private tutorialDisplay;
    /**
     * CTOR
     */
    constructor();
    /**
     * @param {InputEngineEvent} inputEvent An input event
     * @returns true if the input is still "live" and not yet cancelled.
     * @implements InputEngineEvent
     */
    handleInput(inputEvent: InputEngineEvent): InputHandlerState;
    /**
     * Tutorial manager doesn't handle navigation input events
     * @returns true if the input is still "live" and not yet cancelled.
     * @implements InputEngineEvent
     */
    handleNavigation(): InputHandlerState;
    /**  Read/Write version information */
    private versionChecks;
    /**
     * Process (newly added) items for any missed events that may have occurred.
     * @param itemBankName Name of the item bank being processed, or "internal" if direct call from the manager itself.
     */
    process(itemBankName: string): void;
    /**
     * Removes items from a collection if the item is overwritten (it's in the overwriteItems array)
     * @param {string} name Name of the collection
     * @param {Array<TutorialItem>} collection The collection to search an overwrite item
     */
    private replaceOverwritesByCollection;
    private initializeListeners;
    private onUnload;
    private cleanup;
    isShowing(): boolean;
    isSuspended(): boolean;
    /**
     * @implements {IDisplayHandler}
     */
    show(request: TutorialItem): void;
    /**
     * @implements {IDisplayHandler}
     */
    hide(request: TutorialItem, options?: DisplayHideOptions): void;
    /**
     * @implements {IDisplayHandler}
     */
    addDialogBoxToQueue(data: DialogBoxDefinition): void;
    /**
     * Returns the panel action component.
     */
    private getPanelActionComponent;
    /**
     * Auto-play is kicking off, auto-complete active and persistent items.
     */
    private onAutoplayStarted;
    private onTurnBegin;
    private onTurnEnd;
    private activateLateItems;
    private isItemExist;
    /**
     * Add a tutorial items to the manager.
     * @param def The definition of the tutorial item.
     * @param modifiers (optional) modifications for the tutorial item.
     */
    add(def: TutorialDefinition, modifiers?: TutorialItemModifiers): void;
    /**
     * Determine the player ID for the associate game engine event.
     * @param {any} engineEvent An object that represents properties from the game engine. (It is not a typescript event!)
     * @returns {[PlayerId],[PlayerId]} The id(s) of the player(s) involved in thie event, or NO_PLAYER if they cannot be determined.
     * The first returned value is the playerId and the second is the alternative playerId.
     */
    private extractPlayers;
    /**
     * Respond to an event fired through engine.
     * @param {string} engineEventName Name of the event, will typically be the name of
     * a context manager event with an underscore and then the panel name.
     * 	e.g., "OnContextManagerOpen_screen-victory-progress"
     * Note, any engine event can be listened to though, it doesn't have to be
     * from the context manager.
     * @param {any} data Some custom payload of data from the game engine
     */
    onEngineEvent(engineEventName: string, data: any): void;
    /**
     * Handle script based custom events and use to activate a item.
     * @param event
     */
    private onCustomEvent;
    /**
     * THE HANDLER! - This is where all events flow eventually flow to in
     * the tutorial system to see if they can be marked complete or activated.
     *
     * @param {string} name of the event
     * @param {any|CustomEvent} eventData either the data from an HTML custom
     * event or some unique object based on the event name.
     */
    private handleEvent;
    /**
     * Catches errors from the authoring item callbacks. If we don't catch them then it would halt the items life cycle.
     * @param properties Environment properties for the executable version
     * @param executeFn Delimits the execution for an environment
     * @param customErrorMessage Optional. Pass a custom error to log when an error is caught
     */
    private executeInEnvironment;
    /**
     * Sets up the environment for item scripts to evaluate against.
     * This includes the event name that triggered the event, the playerID(s), etc...
     * @param {TutorialEnvironmentProperties} properties
     */
    private setEnvironmentProperties;
    private clearEnvironmentProperties;
    /**
     * Gets a tutorial the player hasn't seen via the ID
     * @param {string} id The ID of the tutorial
     */
    private getUnseenNode;
    /**
     * Gets a tutorial persistent item via the ID
     * @param {string} id The ID of the tutorial
     */
    private getPersistentNode;
    /**
     * Gets a completed tutorial via the ID
     * @param {string} id The ID of the tutorial
     */
    private getCompletedNode;
    private getActivatedNode;
    private raiseDialog;
    private lowerDialog;
    onLowerTutorialDialog(event: CustomEvent): void;
    private raiseCallout;
    /**
     * Lower all callout(s) associated with the item ID.
     * If no ID is provided, then all callouts are lowered.
     * @param {TutorialItem} item (optional) Item to match for the raised callout(s).  If undefined, all callouts are lowered.
     */
    private lowerCallout;
    private onLowerTutorialCallout;
    /**
     * Calculates the best position relative to the host
     * @param host: Callout parent element
     * @param callout: Element to position
     */
    private realizeCalloutPosition;
    private getTutorialDisplay;
    private raiseQuestPanel;
    /**
     * Lower all callout(s) associated with the item ID.
     * If no ID is provided, then all callouts are lowered.
     * @param {TutorialItem} item (optional) Item to match for the raised callout(s).  If undefined, all callouts are lowered.
     */
    private lowerQuestPanel;
    private onLowerTutorialQuestPanel;
    /**
     * Ensure that if a view changes that the proper display and interactivity exists on an item.
     * This includes locked items and the actual displaying of items
     * @param _event
     */
    private onViewChanged;
    /**
     * Gets the current shown item from the activeItems list or from the persistentItems list.
     * @returns The current active tutorial item
     */
    private getCurrentActive;
    private onActiveContextChanged;
    /** @description Elements that were already disabled before a mass-disabling occurred by the tutorial item. */
    private alreadyDisabledElements;
    private recurseDisableChildren;
    private recurseEnableChildren;
    private recurseEnableToRoot;
    /**
     * Hide 2d item(s).
     * Commonly used with a persistent item to keep systems "hidden" until the
     * player is ready for them.
     * @param {TutorialItem} item
     * @returns {boolean} true if one ore more items are hidden
     */
    private hide2d;
    /**
     * Show 2d item(s).
     * Commonly used with a persistent item to keep systems "hidden" until the
     * player is ready for them to be shown
     * @param {TutorialItem} item
     * @returns {boolean} true if one ore more items are shown
     */
    private show2d;
    /**
     * Lock input to all of the UI except for those items listed (and parents to those items)
     * @param {TutorialItem} item
     * @returns {boolean} true if (new) 2D user interface items are locked down by being set disabled
     */
    private lock2d;
    private unlock2d;
    /**
     * Prevent input from occuring in one or more systems.
     * @param {TutorialItem} item
     */
    private disableSystems;
    /**
     * Set a filter that prevents (the normal flow of) input.
     * @param item Tutorial item
     */
    private applyInputFilters;
    private clearInputFilters;
    /**
     * Restore input to systems that were previously disabled.
     * @param {TutorialItem} item
     */
    private enableSystems;
    /**
     * Attempt to activate a item but may fail for a variety of reasons:
     * Such as it may be skippable or the tutorial manager has another item taking it's attention
     * @param {TutorialItem} item - The item to activate
     * @param {TutorialEnvironmentProperties} props Properties representing the environment that raised this
     * @returns if activated
     */
    private tryActivating;
    forceActivate(id: string): void;
    forceComplete(id: string): void;
    /**
     * Complete current item and next item. Complete also the persistent items.
     * @param {TutorialItem} activeItem current active item, could also be persistent
     */
    private forceCompleteNextPersistent;
    /**
     * Cleans the tutorial queue on breaking flow scenarios
     */
    private resetTutorialQueue;
    /**
     * Activate a completed tutorial item. (REACTIVATE IS DEBUG ONLY)
     * @param {TutorialItem} item to be set active.
     * @param {TutorialItemState} state to find the tutorial in
     */
    private activate;
    private reactivate;
    private activateInternal;
    /**
     * Only used for Debug!  This is not part of gameplay flow.
     * Unsee a previously shown item
     * @param {string} id The tutorial item identifier to unsee.
     */
    unsee(id: string): void;
    /**
     * Debug only - helper to get name of advisor for log file
     * @param advisorType Type of tutorial advisor.
     * @returns log file friendly name of advisor
     */
    private getAdvisorTypeName;
    /**
     * Debug only
     * @returns An array of debug output about the items (CSV)
     */
    getDebugLogOutput(): string[];
    /**
     * Writes a value for a given key to the current save files.
     * This is how tutorial items save their status.
     * @param {string} key	Typically the name of the tutorial item to save out.
     * @param {any} value		A value representing a tutorial item's status
     * @param {string} prefix	What prefix to write out content with; default is for item writing.
     */
    private writeValue;
    /**
     * Reads a value for a given key from the current save files.
     * @param {string} key	Typically the name of the tutorial item to read from.
     * @param {string} prefix	What prefix on the key to use when reading in content; default is for item reading.
     * @returns {any} 			Whatever was stored at that value.
     */
    private readValue;
    /**
     * Marking an item completed
     * @param item
     */
    private completed;
    /**
     * Set a tutorial item to be completed.
     * If some additional checks need to be performed to ensure this tutorial
     * item can be completed, it should be done earlier.
     * @param {string} id is the identifier of the tutorial item item to mark completed.
     */
    private complete;
    /**
     * Advanced a next item to activated state.
     * @param {TutorialItem} item, The (prior) item which has the next item's ID set.
     */
    private nextItemActivate;
    /**
     * Item that may be activated as another item has just activated (and not completed)
     * This is assuming one of these items (at least) is a "persistent" item.
     * @param item
     */
    private alsoItemActivate;
    onUpdateTutorialLevel(): void;
    private skip;
    /**
     * (DEBUG Only) Attempt to force a tutorial item activation.
     * @param id the identification of the item
     * @returns true if activation occurred, false otherwise.
     */
    forceActivation(id: string): boolean;
    /**
     * Triggered when the tutorial has changed
     */
    get statusChanged(): any;
    reset(): void;
    private setWelcomeInstructions;
    /**
     * Add a quest on the Quest Tracker
     * @param item element that contains the quest
     * @returns true if the quest was added, false otherwise.
     */
    private addQuest;
    get hasWelcomeInstructions(): boolean;
    runWelcomeInstructions(): void;
    isItemCompleted(id: string): boolean;
    isItemExistInAll(id: string): boolean;
    totalCompletedItems(): number;
    private highlightPlots;
    private clearHighlights;
    getCalloutItem(itemID: string): TutorialItem | undefined;
}
declare const TutorialManager: TutorialManagerClass;
export { TutorialManager as default };
