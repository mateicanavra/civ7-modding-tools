/**
 * @file dropdown.tsx
 * @copyright 2026, Firaxis Games
 * @description SolidJS version of the dropdown component.
 */
import { JSX, ParentProps } from "solid-js";
export declare class DropDownContextProvider {
    private _selectedValue;
    private _setSelectedValue;
    private _isEditing;
    private _setIsEditing;
    constructor(defaultValue: unknown | undefined);
    get selectedValue(): Accessor<unknown>;
    get isEditing(): Accessor<boolean>;
    setSelectedValue(value: unknown): any;
    setIsEditing(value: boolean | ((prev: boolean) => boolean)): any;
}
export declare const DropDownContext: any;
export declare function useDropDownContext(): any;
export interface DropdownItemProps<T> {
    value: T;
    disabled?: boolean;
    class?: string;
}
export declare function DropdownItem<T>(props: ParentProps<DropdownItemProps<T>>): any;
export interface Dropdown<T> {
    fallback?: JSX.Element;
    defaultValue?: T;
    selectedItemTemplate: (item: T) => JSX.Element;
    onItemSelected?: (value: T) => void;
    class?: string;
    disabled?: boolean;
    disableFocus?: boolean;
    onFocus?: () => void;
    hotkey?: string;
    autoFocus?: boolean;
    tabIndex?: number;
}
export declare function Dropdown<T>(props: ParentProps<Dropdown<T>>): any;
