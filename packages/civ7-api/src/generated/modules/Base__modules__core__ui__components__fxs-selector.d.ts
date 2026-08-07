/**
 * @file fxs-selector.ts
 * @copyright 2023, Firaxis Games
 * @description A UI selector control primitive for selecting an option from a list of options using a gamepad. Used as a drop-in replacement for the dropdown component.
 *
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
 * - `dropdown-items` The list of items to display in the selector.
 * - `direct-edit` If set to "false", the component must be activated before value can be changed (true by default).
 *
 * @fires DropdownSelectionChangeEvent When an item is selected from the selector.
 *
 * @example
 * ```ts
 * const selector = document.createElement('fxs-selector');
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
export declare class FxsSelector extends FxsActivatable {
    private noSelectionCaption;
    private isEditing;
    private selectorItems;
    private selectedItemContainer;
    private selectorElements;
    private noSelectionElement;
    private leftArrow;
    private rightArrow;
    private leftNavHelp;
    private rightNavHelp;
    private activateListener;
    private navigateInputListener;
    private engineInputListener;
    private updatingItemSelection;
    private get isDisabled();
    private get selectedIndex();
    private set selectedIndex(value);
    private get isNoSelection();
    private get directEdit();
    private set directEdit(value);
    private get enableShellNavControls();
    constructor(root: ComponentRoot<FxsSelector>);
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
    updateSelectorItems(items: DropdownItem[]): void;
    selectNext(): void;
    selectPrevious(): void;
    /**
     * createListItem is called when a new item is added to the selector.
     *
     * Override this method to customize the appearance of selector items.
     */
    protected createListItemElement({ disabled, label, tooltip }: DropdownItem): HTMLElement;
    /**
     * onItemSelected is called when an item is selected from the selector.
     *
     * Override this method to customize item selection.
     *
     * @param index The index of the selected item.
     */
    protected onItemSelected(index: number, force?: boolean): void;
    protected onActivate(_event: ActionActivateEvent): void;
    protected onEngineInput(event: InputEngineEvent): void;
    protected onNavigateInput(event: NavigateInputEvent): void;
    private createListItems;
    private updateElementSelections;
    private updateNoSelectionElement;
    private render;
}
declare const SelectorElementTagName: "fxs-selector";
declare global {
    interface HTMLElementTagNameMap {
        [SelectorElementTagName]: ComponentRoot<FxsSelector>;
    }
    interface HTMLElementEventMap {
        [DropdownSelectionChangeEventName]: DropdownSelectionChangeEvent;
    }
}
export {};
