/**
 * @file context-manager.ts
 * @copyright 2021-2023, Firaxis Games
 * @description An object to manager new UI "context" requests.
 */
import { IEngineInputHandler, InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
export interface PushProperties<PanelOptions = never, Attributes = Record<string, string | undefined>> {
    singleton: boolean;
    createMouseGuard?: boolean;
    targetParent?: HTMLElement;
    attributes?: Attributes;
    panelOptions?: PanelOptions;
    viewChangeMethod?: UIViewChangeMethod;
}
export interface PopProperties {
    mustExist?: boolean;
    dontDetach?: boolean;
    viewChangeMethod?: UIViewChangeMethod;
}
export declare namespace ContextManagerEvents {
    const OnChanged = "OnContextManagerChanged";
    const OnOpen = "OnContextManagerOpen";
    const OnClose = "OnContextManagerClose";
}
declare class ContextManagerSingleton {
    private static _instance;
    private engineInputEventHandlers;
    private screens;
    private receiveFocusEvent;
    private loseFocusEvent;
    private popFocusEvent;
    private targetSlotPrefix;
    private lastActivatedComponent;
    private ignoreCursorTargetDueToDragging;
    private dragStartingTarget;
    private dragStartingTime;
    private clickDuration;
    private pushingTarget;
    private pushingClassName;
    constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): ContextManagerSingleton;
    get isEmpty(): boolean;
    /** ------------------------------------------------------------------------------------------------------------------
     * Push a reference to a component in to the front of the stack.
     * @param targetElement The element you want to register with the ContextManager, extending HTMLElement somewhere in its parentage.
     */
    pushElement<PanelOptions, Attributes>(targetElement: HTMLElement, prop?: PushProperties<PanelOptions, Attributes>): void;
    push<T extends keyof HTMLElementTagNameMap, PanelOptions, Attributes>(targetClassName: T, prop?: PushProperties<PanelOptions, Attributes>): HTMLElementTagNameMap[T];
    push<PanelOptions, Attributes>(targetClassName: string, prop?: PushProperties<PanelOptions, Attributes>): HTMLElement;
    /** ------------------------------------------------------------------------------------------------------------------
     * Pop the first instance found of an element out of the Context.
     * Note: this does NOT pop anything else. If you want to pop all elements
     * on top of the target, too; use PopUntil().
     * @param target string class name of the screen or element you are looking for
     * @param prop.mustExist optional flag to require the target to exist. A warning in the log generated if flagged but target not found.
     */
    pop(target: string | HTMLElement | undefined, prop?: PopProperties): void;
    /** ------------------------------------------------------------------------------------------------------------------
     * Pop all elements until target is reached, NOT INCLUDING target.
     * @param targetClassName string class name of the screen or element you are looking for
     * @param prop optional flags
     */
    popUntil(targetName: string, prop?: PopProperties): void;
    /** ------------------------------------------------------------------------------------------------------------------
     * Pop all elements until the target is reached AND INCLUDING the target.
     * @param targetClassName string class name of the screen or element you are looking for
     * @param prop optional flags
     */
    popIncluding(targetClassName: string, prop?: PopProperties): void;
    /** ------------------------------------------------------------------------------------------------------------------
     * Clear the entire stack, generally down to the HUD.
     */
    clear(): void;
    /** ------------------------------------------------------------------------------------------------------------------
     * Returns a REFERENCE to an HTMLElement, if found in the screen Context array
     * @param targetClassName string class name of the screen or element you are looking for
     */
    getTarget(target: string | HTMLElement): HTMLElement | undefined;
    /** ------------------------------------------------------------------------------------------------------------------
     * Private look up for INDEX of an HTMLElement in the Context array
     * @param target string class name of the screen or element you are looking for
     */
    private getTargetIndex;
    /** ------------------------------------------------------------------------------------------------------------------
     * Returns current HTMLElement at the top of the stack
     */
    getCurrentTarget(): HTMLElement | undefined;
    /** ------------------------------------------------------------------------------------------------------------------
     * Returns true if there is any instance of the target class
     * @param targetClassName string class name of the screen or element you are looking for
     */
    hasInstanceOf(targetClassName: string, prop?: PopProperties): boolean;
    /** ------------------------------------------------------------------------------------------------------------------
     * Returns true if the target screen class is atzero in the array
     * @param targetClassName string class name of the screen or element you are looking for
     */
    isCurrentClass(targetClassName: string): boolean;
    /** ------------------------------------------------------------------------------------------------------------------
     * Indicates that the click delay setting has changed.
     */
    updateClickDuration(): void;
    /** ------------------------------------------------------------------------------------------------------------------ */
    /** Convert generic key:value object in to HTML attributes  */
    private passTargetAttributes;
    /** ------------------------------------------------------------------------------------------------------------------ */
    /**
     * Output formatted debugging information to the log.
     */
    log(): void;
    canUseInput(source: string, action: string): boolean;
    registerEngineInputHandler(engineEventHandler: IEngineInputHandler): void;
    unregisterEngineInputHandler(engineEventHandler: IEngineInputHandler): void;
    private onSetActivatedEvent;
    private setLastActivatedComponent;
    private shouldSendEventToCursor;
    /**
     * Run through input handlers
     * @param inputEvent An 'engine-input' event to process.
     * @returns true if still valid (may need to be handled) or false if event was cancelled.
     */
    handleInput(inputEvent: InputEngineEvent): boolean;
    /**
     * Handle focus navigation specific events.  These are based on input events but may bounce around the system more based on the rules slots contain.
     * @param navigationEvent Event with navigation details.
     * @returns true if even is still valid, or false if it was cancelled.
     */
    handleNavigation(navigationEvent: NavigateInputEvent): boolean;
    /**
     * Since the context manager lives in the shell and game, it would be best
     * to move a pause menu out to a game specific area only.
     * @returns true, if the pause menu can be raised.
     */
    canOpenPauseMenu(): boolean;
    isGameActive(): boolean;
    canSaveGame(): boolean;
    canLoadGame(): boolean;
    /** Should the UI show a modal popup, based on the input player
     * This helps prevent popups from being shown if automation is
     * running.
     */
    shouldShowPopup(playerId: PlayerId): any;
    shouldShowModalEvent(playerId: PlayerId): any;
    noUserInput(): any;
}
export declare const ContextManager: ContextManagerSingleton;
export { ContextManager as default };
