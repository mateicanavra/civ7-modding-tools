/**
 * @file tutorial-item.ts
 * @copyright 2020-2024, Firaxis Games
 * @description What makes up the pieces of a tutorial item, one "unit" of tutorial content.
 *
 * @notes Common between activation and completion
 * 		Event (or turn)?
 * 		(optional) Script condition
 *      (optional) Script to run if conditions are true
 *      (optional) Player(s) involved in event
 *      (optional) eval on all turns or just local?
 */
import { DisplayRequestCategory, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
import { InputFilter } from "/core/ui/input/input-filter.js";
import { QuestItem } from "/base-standard/ui/quest-tracker/quest-item.js";
/**
 * @description The state of a tutorial item.
 *
 * ! IMPORTANT !
 * These enums are serialized to the save game so adding new values should only
 * be added on the end or previously existing saves will break.
 */
export declare enum TutorialItemState {
    Unseen = 0,// Not shown to player
    Active = 1,// Item being shown to player; these are modal and expire at the end of the player's turn
    Completed = 2,// No longer shown
    Persistent = 3
}
/**
 * Tutorial items are associated with a particular level.
 * 0 = off, and the higher the # generally the more messages will be seen.
 */
export declare enum TutorialLevel {
    None = 0,// Off - used for turning off the tutorial system
    WarningsOnly = 2,// Only Warnings - tutorial doesn't run (only advisor warnings)
    TutorialOn = 4
}
/**
 * How the item behaves.
 */
export declare enum ItemType {
    PerTurn = 0,// Item only exists for the turn, auto-completes when next turn starts
    Persistent = 1,// Item stays persistent across turns
    Tracked = 2,// Not only stays persistent but shown in Quest Tracker
    Legacy = 3
}
export declare enum TutorialAnchorPosition {
    TopLeft = "top-left",
    TopCenter = "top-center",
    TopRight = "top-right",
    MiddleLeft = "middle-left",
    MiddleCenter = "middle-center",
    MiddleCenterWide = "middle-center-wide",
    MiddleRight = "middle-right",
    BottomLeft = "bottom-left",
    BottomCenter = "bottom-center",
    BottomRight = "bottom-right"
}
export declare enum NextItemStatus {
    Canceled = "NextItemCanceled"
}
export declare enum TutorialAdvisorType {
    Default = "advisor-default",
    Military = "advisor-military",
    Culture = "advisor-culture",
    Science = "advisor-science",
    Economic = "advisor-economic"
}
/**
 * Subset of the QuestItem that is specific for a tutorial define.
 * Certain fields (e.g., ID) are omitted as they are provided from the tutorial item itself
 * when generating the actual QuestItem.
 */
export interface TutorialQuestItem extends Pick<QuestItem, "title" | "description" | "getDescriptionLocParams" | "getCurrentProgress" | "goal" | "victory"> {
    progressType?: string;
    /** If true adds a cancel quest option for the triggering callout */
    cancelable?: boolean;
}
type HTMLSelector = string;
type NamedSystems = "city-banners" | "unit-flags" | "world-input" | "world-unit-input" | "world-city-input";
/**
 * TODO: implement
 * A common block used in tutorial items.
 * Used for: activate, complete, obsolete
 */
export interface TutorialTrigger {
    events?: string[];
    triggered?: (item: TutorialItem) => boolean;
    onTriggered: (item: TutorialItem) => void;
    players?: PlayerId[];
    localTurnOnly?: boolean;
    nextStates?: {
        id: string;
        state: TutorialItemState;
    }[];
    chainID?: string;
}
/**
 * Defines a way to select a specific element using element attributes.
 * Indicates a container where you can look the specific item.
 * This is useful for the scenario where there are two identical items but in different containers.
 * Then you can highlight the item you are looking for
 */
export interface TutorialDynamicHighlight {
    containerSelector: ElementAttributeSelector;
    itemSelector: ElementAttributeSelector;
}
export interface ElementAttributeSelector {
    baseSelector: HTMLSelector;
    attributeSelector?: AttributeSelector;
}
export interface AttributeSelector {
    attributeName: string;
    attributeValue: string;
}
/**
 * Defines what pieces exist in a tutorial item definition.
 */
export interface TutorialDefinition {
    ID: string;
    nextID?: string | undefined;
    alsoActivateID?: string;
    level?: TutorialLevel;
    isPersistent?: boolean;
    onActivate?: (item: TutorialItem) => void;
    onCleanUp?: (item: TutorialItem) => void;
    skip?: boolean;
    runAllTurns?: boolean;
    filterPlayers?: PlayerId[];
    activationCustomEvents?: string[];
    activationEngineEvents?: string[];
    completionEngineEvents?: string[];
    completionCustomEvents?: string[];
    onActivateCheck?: (item: TutorialItem) => boolean;
    onCompleteCheck?: (item: TutorialItem) => boolean;
    onObsoleteCheck?: (item: TutorialItem) => boolean;
    inputContext?: InputContext;
    dialog?: TutorialDialogDefinition;
    callout?: TutorialCalloutDefinition;
    questPanel?: TutorialQuestPanelDefinition;
    highlights?: HTMLSelector[];
    dynamicHighlights?: TutorialDynamicHighlight[];
    enabled2d?: HTMLSelector[];
    disable?: NamedSystems[];
    hiders?: HTMLSelector[];
    quest?: TutorialQuestItem;
    highlightPlots?: PlotIndex[];
    inputFilters?: InputFilter[];
    canMinimize?: boolean;
}
/**
 * Meta data that can be applied to any tutorial item.
 */
export interface TutorialItemModifiers {
    isWelcomeInstructions?: boolean;
    version?: number;
    canDeliver?: (item: TutorialItem) => boolean;
}
export type CalloutShortOptionCallback = {
    text?: string;
    nextID?: string;
} & ({
    text: string;
} | {
    nextID: string;
});
/**
 * A button that appears on a callout.
 */
export interface TutorialCalloutOptionDefinition {
    /** After effect when a callout is lowered by activating a button */
    callback: () => void;
    /** Label on the button */
    text: string;
    /** Associated keyboard or gamepad button to activate the button */
    actionKey: string;
    /** Does pressing this button close the callout? */
    closes?: boolean;
    /** Set to activate a tutorial item after this button is pressed */
    nextID?: string;
}
export type TutorialQuestPanelOptionDefinition = TutorialCalloutOptionDefinition & {
    questID: string;
    pathDesc: string;
};
/**
 * Action prompt texts used for tutorial callouts
 */
export interface TutorialActionPrompt {
    kbm?: string;
    gamepad?: string;
    hybrid?: string;
    touch?: string;
    actionName?: string;
}
interface CalloutDefinitionText<T extends string | undefined = string> {
    text: T;
    getLocParams?: T extends string ? (item: object) => LocalizedTextArgument[] : never;
}
interface TutorialContentBody {
    body: CalloutDefinitionText;
}
interface TutorialContentAdvisor {
    advisor: CalloutDefinitionText;
}
type TutorialCalloutContent = {
    body?: CalloutDefinitionText;
    advisor?: CalloutDefinitionText;
} & (TutorialContentBody | TutorialContentAdvisor);
export declare enum TutorialCalloutType {
    BASE = 0,
    NOTIFICATION = 1
}
/**
 * Informational box that persists on top of the UI (modal) until a button is
 * pressed on it and/or a condition is met, such as openning a certain panel.
 */
export type TutorialCalloutDefinition = TutorialCalloutContent & {
    title?: string;
    actionPrompts?: TutorialActionPrompt[];
    anchorHost?: string;
    option1?: TutorialCalloutOptionDefinition;
    option2?: TutorialCalloutOptionDefinition;
    option3?: TutorialCalloutOptionDefinition;
    anchorPosition?: TutorialAnchorPosition;
    advisorType?: TutorialAdvisorType;
    type?: TutorialCalloutType;
};
export type TutorialQuestContent = TutorialCalloutContent & {
    title?: string;
};
export interface AdvisorQuestPanel {
    type: AdvisorType;
    quote?: string;
    button: TutorialQuestPanelOptionDefinition;
    legacyPathClassType: string;
}
export interface TutorialQuestPanelDefinition {
    title: string;
    description: CalloutDefinitionText;
    actionPrompts?: TutorialActionPrompt[];
    advisors: AdvisorQuestPanel[];
    altNoAdvisorsDescription: CalloutDefinitionText;
}
export interface TutorialDialogDefinition {
    series?: TutorialDialogPageData[];
}
export interface TutorialDialogImageData {
    image: string | undefined;
    width?: string | number;
    height?: string | number;
    x?: string | number;
    y?: string | number;
}
export interface TutorialDialogPageData {
    images: TutorialDialogImageData[] | undefined;
    title: string | undefined;
    subtitle: string | undefined;
    body: string;
    backgroundImages: string[] | undefined;
}
export interface TutorialEnvironmentProperties {
    eventName: string;
    event: any;
    playerId: PlayerId;
    altPlayerId: PlayerId;
    isLocalPlayerTurn: boolean;
}
/**
 * This is the internal information object that the TutorialManager uses.
 */
export default class TutorialItem implements IDisplayRequestBase {
    ID: string;
    group: number;
    version: number;
    nextID: string | undefined;
    alsoActivateID: string | undefined;
    properties: TutorialEnvironmentProperties;
    level: TutorialLevel;
    type: ItemType;
    addToFront?: boolean | undefined;
    category: DisplayRequestCategory;
    priority?: number | undefined;
    subpriority?: number | undefined;
    /** If defined will attempt to override the default IDisplayHandler category for this tutorial item  */
    queueToOverride: DisplayRequestCategory | undefined;
    activationCustomEvents: string[];
    activationEngineEvents: string[];
    completionEngineEvents: string[];
    completionCustomEvents: string[];
    filterPlayers: PlayerId[];
    runAllTurns: boolean;
    _skip: boolean;
    dialog?: TutorialDialogDefinition;
    callout?: TutorialCalloutDefinition;
    questPanel?: TutorialQuestPanelDefinition;
    highlights?: HTMLSelector[];
    dynamicHighlights?: TutorialDynamicHighlight[];
    enabled2d?: HTMLSelector[];
    disable?: NamedSystems[];
    hiders?: HTMLSelector[];
    inputContext?: InputContext;
    quest?: QuestItem;
    highlightPlots?: PlotIndex[];
    inputFilters?: InputFilter[];
    canMinimize: boolean;
    disablesPausing?: boolean | undefined;
    calloutElement: HTMLElement | null;
    onActivate?: (item: TutorialItem) => void;
    onCleanUp?: (item: TutorialItem) => void;
    onActivateCheck?: (item: TutorialItem) => boolean;
    onCompleteCheck?: (item: TutorialItem) => boolean;
    onObsoleteCheck?: (item: TutorialItem) => boolean;
    eState: TutorialItemState;
    get isUnseen(): boolean;
    get isActive(): boolean;
    get isResident(): boolean;
    get isCompleted(): boolean;
    get skip(): boolean;
    get isPersistent(): Readonly<boolean>;
    get isTracked(): Readonly<boolean>;
    get isLegacy(): Readonly<boolean>;
    constructor(def: TutorialDefinition);
    private warnRepeatedActionKeys;
    private _processed;
    get processed(): boolean;
    set processed(value: boolean);
    /**
     * Helper to turn on/off any associate highlights with the tutorial item.
     * @param {Tutorial.HighlightFunc} The function to call which highlights or unhighlights all nodes in the selector.
     */
    private doHighlights;
    activateHighlights: () => void;
    deactivateHighlights: () => void;
    markActive(): boolean;
    markComplete(): boolean;
    markUnseen(): boolean;
    /**
     * Is the environment compatible with the item's expected environment?
     * @param {TutorialEnvironmentProperties} properties that describe the environment the item is running in.
     * @returns {boolean} true if properties are a match.
     */
    runsInEnvironment(properties: TutorialEnvironmentProperties): boolean;
    /**
     * Writes a value for the current tutorial item to the current save files.
     */
    writeMem(value: any): void;
    /**
     * Reads a value for a given tutorial item from the current save files.
     * @param {string} ID Optional ID for a different tutorial item that we want to check the storage of.
     */
    readMem(ID?: string): any;
}
export {};
