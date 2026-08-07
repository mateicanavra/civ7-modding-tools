/**
 * @file screen-general-chooser.ts
 * @copyright 2020-2022, Firaxis Games
 * @description General Chooser screen.  This screen is meant to be a base that's overridden by other screens.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
export declare class ScreenGeneralChooser extends Panel {
    protected defaultFocus: HTMLElement | null;
    protected createCloseButton: boolean;
    private closeButtonListener;
    private entryListener;
    private engineInputListener;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    protected onEngineInput(inputEvent: InputEngineEvent): void;
    private onActivate;
    /**
     * Performs the boilerplate for each entry to work properly with the general chooser framework.
     * Each screen will need to add whatever attribute it wants to identify the entry when it's chosen.
     * @param {element} entry - The HTML element for the entry.
     */
    tagEntry(entry: HTMLElement): void;
    /**
     * Creates the list of entries in the chooser list. Override this in your derived chooser.
     * @param {element} entryContainer - The HTML element that's the parent of all of the entries.
     */
    protected createEntries(entryContainer: HTMLElement): void;
    /**
     * Called when the user chooses an item in the list.  Override this in your derived chooser.
     * @param {element} entryElement - The HTML element chosen.
     */
    entrySelected(_entryElement: HTMLElement): void;
}
