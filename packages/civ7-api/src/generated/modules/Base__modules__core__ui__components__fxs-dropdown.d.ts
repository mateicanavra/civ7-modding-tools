/**
 * @file fxs-dropdown.ts
 * @copyright 2020-2025, Firaxis Games
 * @description A UI dropdown control primitive for selecting an option from a list of options.
 *
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
/**
 * DropdownItem is the base data type for items in a dropdown.
 *
 * You can add additional properties to this type to store additional data for each item.
 * @example
 * ```ts
 * type MyDropdownItem = DropdownItem & {
 *   id: number
 * }
 * ```
 */
export interface DropdownItem {
    label: string;
    tooltip?: string;
    disabled?: boolean;
}
export type DropdownSelectionChangeEventDetail<T extends DropdownItem = DropdownItem> = {
    selectedIndex: -1;
    selectedItem: null;
} | {
    selectedIndex: number;
    selectedItem: T;
};
export declare const DropdownSelectionChangeEventName: "dropdown-selection-change";
/**
 * DropdownSelectionChangeEvent is the event fired when an item is selected from a dropdown.
 */
export declare class DropdownSelectionChangeEvent<T extends DropdownItem = DropdownItem> extends CustomEvent<DropdownSelectionChangeEventDetail<T>> {
    constructor(detail: DropdownSelectionChangeEventDetail<T>);
}
export declare class FxsDropdown extends FxsActivatable {
    private isOpen;
    protected selectedIndex: number;
    protected labelElement: HTMLDivElement;
    protected highlightElement: HTMLDivElement;
    protected dropdownItems: DropdownItem[];
    private dropdownElements;
    protected openArrowElement: HTMLElement;
    private readonly scrollableElement;
    private readonly dropdownItemSlot;
    private scrollArea;
    private noSelectionCaption;
    private selectionCaption;
    private wasOpenedUp;
    private onScrollWheelEventListener;
    private onActivateEventListener;
    private onEngineInputEventListener;
    private dropdownSlotItemFocusInListener;
    private dropdownSlotItemFocusOutListener;
    private onClickOutsideEventListener;
    private onTouchOutsideEventListener;
    private onBlurEventListener;
    private onResizeEventListener;
    private activeDeviceTypeListener;
    private listeningForClickOutside;
    private onActivate;
    private onClickOutside;
    private onTouchOutside;
    private onBlur;
    private onResizeEvent;
    private onActiveDeviceTypeChanged;
    private onScrollWheel;
    protected onEngineInput(event: InputEngineEvent): void;
    protected onDropdownSlotItemFocusIn(_focusEvent: FocusEvent): void;
    protected onDropdownSlotItemFocusOut(focusEvent: FocusEvent): void;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    /**
     * ToggleOpen opens or closes the dropdown.
     *
     * @param force If true, forces the dropdown to open or close. If false, toggles the dropdown based on its current state.
     */
    toggleOpen(force?: boolean): void;
    /**
     * UpdateDropdownItems updates the list of items in the dropdown.
     *
     * @param items The list of items to display in the dropdown.
     */
    updateDropdownItems(items: DropdownItem[]): void;
    /**
     * createListItemElement is called when a new item is added to the dropdown.
     *
     * Override this method to customize or replace the default dropdown item.
     *
     * @returns An 'fxs-dropdown-item' element.
     */
    protected createListItemElement(): any;
    /**
     * onItemSelected is called when an item is selected from the dropdown.
     *
     * Override this method to customize item selection.
     *
     * @param index The index of the selected item.
     */
    protected onItemSelected(index: number): void;
    private createListItems;
    protected updateExistingElement(element: ComponentRoot<FxsDropdownItemElement>, dropdownItem: DropdownItem, isSelected: boolean): void;
    protected update(): void;
    protected updateOpenArrowElement(): void;
    protected isArrowElementVisibile(): boolean;
    onAttributeChanged(name: string, oldValue: string, newValue: string): void;
    private updateDropdownVisibility;
    addOrRemoveNavHelpElement(parent: HTMLElement, value: string | null): void;
    protected render(): void;
}
export declare class FxsDropdownItemElement extends FxsActivatable {
    private readonly highlightElement;
    private readonly arrowElement;
    protected readonly labelElement: any;
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    protected render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-dropdown": ComponentRoot<FxsDropdown>;
        "fxs-dropdown-item": ComponentRoot<FxsDropdownItemElement>;
    }
    interface HTMLElementEventMap {
        [DropdownSelectionChangeEventName]: DropdownSelectionChangeEvent;
    }
}
