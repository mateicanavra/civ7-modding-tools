/**
 * @file manager-dialog-box.ts
 * @copyright 2020-2025, Firaxis Games
 * This is the singleton helper access class for firing up new dialogue boxes.
 */
import { DialogBoxAction, DialogBoxCallbackSignature, DialogBoxCustom, DialogBoxDefinition, DialogBoxID, DialogBoxOption, DialogBoxValueCallbackSignature, DialogSource } from "/core/ui/dialog-box/model-dialog-box.js";
export type { DialogBoxCallbackSignature, DialogBoxDefinition, DialogBoxID, DialogBoxOption, DialogBoxValueCallbackSignature, };
export { DialogBoxAction, DialogSource };
export interface DialogBoxStepper {
    id: string;
    stepperValue: string;
    stepperMinValue: string;
    stepperMaxValue: string;
}
export interface DialogBoxDropdown {
    id: string;
    dropdownItems?: string;
    selectedIndex?: string;
    disabled?: string;
    actionKey?: string;
    selectionCaption?: string;
    noSelectionCaption?: string;
    label?: string;
}
export interface DialogBoxTextbox {
    id: string;
    placeholder?: string;
    showKeyboardOnActivate?: string;
    enabled?: string;
    maxLength?: string;
    value?: string;
    label?: string;
    classname?: string;
    editStopClose?: boolean;
    cancelClosesPopup?: boolean;
    caseMode?: "uppercase" | "lowercase";
}
export interface DialogBoxExtensions {
    steppers?: DialogBoxStepper[];
    dropdowns?: DialogBoxDropdown[];
    textboxes?: DialogBoxTextbox[];
}
interface DialogBoxParametersBase {
    dialogId?: DialogBoxID;
    body?: string;
    title?: string;
    shouldDarken?: boolean;
    extensions?: DialogBoxExtensions;
    displayHourGlass?: boolean;
    dialogSource?: DialogSource;
    /** If undefined assume highest queue order */
    displayQueue?: string;
    /** If true insert at front of specified display queue */
    addToFront?: boolean;
    custom?: boolean;
    styles?: boolean;
    name?: string;
}
interface DialogBoxParametersOne extends DialogBoxParametersBase {
    callback?: DialogBoxCallbackSignature;
    valueCallback?: DialogBoxValueCallbackSignature;
    canClose?: boolean;
}
interface DialogBoxParametersMulti extends DialogBoxParametersBase {
    options: DialogBoxOption[];
    canClose?: boolean;
    layout?: string;
}
interface DialogBoxParametersCustom extends DialogBoxParametersBase {
    options: DialogBoxOption[];
    customOptions: DialogBoxCustom[];
    canClose?: boolean;
    custom?: boolean;
    customStyles?: boolean;
}
declare class DialogBoxManagerImpl {
    /**
     * Helper function for creating simple boolean choice dialog, where the payload is constructed for you.
     * The Cancel option has no callback
     */
    createDialog_ConfirmCancel(params: DialogBoxParametersOne): DialogBoxID;
    /**
     * Helper function for creating simple confirmation dialog, where the payload is constructed for you.
     */
    createDialog_Confirm(params: DialogBoxParametersOne): DialogBoxID;
    /**
     * Helper function for creating simple cancel dialog, where the payload is constructed for you.
     */
    createDialog_Cancel(params: DialogBoxParametersOne): DialogBoxID;
    /**
     * Helper function for creating a multi-option dialog with user-defined payloads for each option.
     */
    createDialog_MultiOption(params: DialogBoxParametersMulti): DialogBoxID;
    /**
     * Helper function for creation a custom option dialog with user-defined payloads for each option
     */
    createDialog_CustomOptions(params: DialogBoxParametersCustom): DialogBoxID;
    /**
     * Clear all dialog box in the queue
     */
    clear(): void;
    get isDialogBoxOpen(): any;
    closeDialogBox(dialogBoxID: DialogBoxID): void;
    setSource(source: DialogSource): void;
}
export declare const DialogBoxManager: DialogBoxManagerImpl;
export { DialogBoxManager as default };
