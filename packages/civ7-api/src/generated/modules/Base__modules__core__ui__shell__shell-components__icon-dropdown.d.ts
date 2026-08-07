import { DropdownItem, FxsDropdown, FxsDropdownItemElement } from "/core/ui/components/fxs-dropdown.js";
export type IconDropdownItem = DropdownItem & {
    iconURL?: string;
};
export declare class IconDropdown extends FxsDropdown {
    protected iconContainer: HTMLElement;
    private icon;
    protected render(): void;
    protected update(): void;
    onAttributeChanged(name: string, oldValue: string, newValue: string): void;
    protected createListItemElement(): any;
    protected updateExistingElement(element: ComponentRoot<FxsDropdownItemElement>, dropdownItem: DropdownItem, isSelected: boolean): void;
}
declare class IconDropdownItemElement extends FxsDropdownItemElement {
    private icon;
    protected render(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "icon-dropdown": ComponentRoot<IconDropdown>;
        "icon-dropdown-item": ComponentRoot<IconDropdownItemElement>;
    }
}
export {};
