/**
 * @file fxs-selector-ornate.ts
 * @copyright 2024, Firaxis Games
 * @description A UI selector control primitive for selecting an option from a list of options using a gamepad.
 * Used as a drop-in replacement for the dropdown component.  Enhanced to support a background image.
 */
import FxsActivatable, { ActionActivateEvent } from "/core/ui/components/fxs-activatable.js";
import { DropdownItem, DropdownSelectionChangeEvent, DropdownSelectionChangeEventName } from "/core/ui/components/fxs-dropdown.js";
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
/**
 * A UI selector control for selecting an option from a list of options. Used as a drop-in replacement for the dropdown component.
 *
 * Attributes:
 * - `selected-item-index` The index of the selected item.
 * - `no-selection-caption` The text label of the button when there is no valid selection (i.e., when `selected-item-index` is -1).
 * - 'label' The label of the selector. ("" by default)
 * - `dropdown-items` The list of items to display in the selector.
 * - `direct-edit` If set to "false", the component must be activated before value can be changed (true by default).
 * - 'default-image' The image to use if none is defined for a given dropdown item (null by default).
 * - 'show-pips' Should pips representing the options be shown at the bottom of the control? (true by default)
 * - 'wrap-selections' If set to "true" selections will wrap when they go out of bounds, otherwise they will clamp. (false by default)
 *
 * @fires DropdownSelectionChangeEvent When an item is selected from the selector.
 *
 * @example
 * ```ts
 * const selector = document.createElement('fxs-selector-ornate');
 * selector.setAttribute('dropdown-items', JSON.stringify([
 *    { label: 'Item 1' },
 *    { label: 'Item 2' },
 *    { label: 'Item 3' }
 * ]));
 * selector.addEventListener(SelectorSelectionChangeEventName, (event: SelectorSelectionChangeEvent) => {
 *   console.log(`Selected item index: ${event.detail.selectedIndex}`);
 *   console.log(`Selected item label: ${event.detail.selectedItem.label}`);
 * });
 * ```
 */
export type OrnateDropdownItem = DropdownItem & {
    description?: string;
    image?: string;
};
export declare class FxsSelectorOrnate extends FxsActivatable {
    private noSelectionCaption;
    private isEditing;
    private selectorItems;
    private selectedItemContainer;
    private selectorElements;
    private noSelectionElement;
    private labelElement;
    private leftArrow;
    private rightArrow;
    private leftNavHelp;
    private rightNavHelp;
    private pipsContainer;
    private pipElements;
    private activateListener;
    private navigateInputListener;
    private engineInputListener;
    private get selectedIndex();
    private set selectedIndex(value);
    private get isNoSelection();
    private get directEdit();
    private set directEdit(value);
    private get defaultImage();
    private get label();
    private get enableShellNavControls();
    private get showPips();
    private get wrapSelections();
    constructor(root: ComponentRoot<FxsSelectorOrnate>);
    onAttributeChanged(name: string, oldValue: string, newValue: string): void;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    protected onActivatableEngineInput(inputEvent: InputEngineEvent): void;
    updateDisabled(value: boolean): void;
    /**
     * ToggleOpen edit mode on the selector.
     *
     * @param force If set, forces the selector to edit mode or not. If not set, toggles the selector based on its current state.
     */
    toggleEdit: (force?: boolean) => void;
    /**
     * UpdateSelectorItems updates the list of items in the selector.
     *
     * @param items The list of items to display in the selector.
     */
    updateSelectorItems(items: OrnateDropdownItem[]): void;
    selectNext(): void;
    selectPrevious(): void;
    /**
     * Called when a new item is added to the selector.
     *
     * Override this method to customize the appearance of selector items.
     */
    protected createListItemElement(item: OrnateDropdownItem): HTMLElement;
    /**
     * Called when a new item is added to the selector to create a pip for it.
     *
     * Override this method to customize the appearance of pip items.
     */
    protected createPipElement(item: OrnateDropdownItem): HTMLElement;
    /**
     * Called when an item is selected from the selector.
     *
     * Override this method to customize item selection.
     *
     * @param index The index of the selected item.
     */
    protected onItemSelected(index: number): void;
    protected onActivate(_event: ActionActivateEvent): void;
    protected onEngineInput(event: InputEngineEvent): void;
    protected onNavigateInput(event: NavigateInputEvent): void;
    private updateNavVisiblity;
    private createListItems;
    private updateLabel;
    private updateElementSelections;
    private updateNoSelectionElement;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        ["fxs-selector-ornate"]: ComponentRoot<FxsSelectorOrnate>;
    }
    interface HTMLElementEventMap {
        [DropdownSelectionChangeEventName]: DropdownSelectionChangeEvent;
    }
}
