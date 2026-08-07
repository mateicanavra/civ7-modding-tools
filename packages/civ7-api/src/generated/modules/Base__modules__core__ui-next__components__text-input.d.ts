/**
 * @file fxs-textbox.ts
 * @copyright 2022 - 2026, Firaxis Games
 * @description A textbox primitive.
 */
import { Accessor, Setter } from "solid-js";
import { PropsRef } from "/core/ui-next/utilities/solid-utilities.js";
export interface TextInputProps {
    value: Accessor<string>;
    setValue: Setter<string>;
    placeholder?: string;
    enableVirtualKeyboard?: boolean;
    ref?: PropsRef<HTMLInputElement>;
    class?: string;
    disabled?: boolean;
    disableFocus?: boolean;
    autoFocus?: boolean;
    setIsEditing?: Setter<boolean>;
    hotkeyAction?: string;
    tabIndex?: number;
}
export declare const TextInput: any;
