/**
 * @file model-dialog-box.ts
 * @copyright 2020-2024, Firaxis Games
 * This is the data component for a dialog box.
 */
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
export type DialogBoxCallbackSignature = (eAction: DialogBoxAction) => void;
export type DialogBoxValueCallbackSignature = (id: string, newValue: string) => void;
export type DialogBoxValueChangeCallbackSignature = (id: string, newValue: string, option: HTMLElement | undefined) => void;
export interface DialogBoxDefinition {
    id?: DialogBoxID;
    title?: string;
    body: string;
    canClose: boolean;
    shouldDarken?: boolean;
    extensions?: string;
    displayHourGlass?: boolean;
    source?: DialogSource;
    displayQueue?: string;
    addToFront?: boolean;
    custom?: boolean;
    styles?: boolean;
    layout?: string;
    name?: string;
}
export interface DialogBoxCustom {
    componentName?: string;
    layoutBodyWrapper?: HTMLElement;
    layoutImageWrapper?: HTMLElement;
    useChooserItem?: boolean;
    chooserInfo?: HTMLElement;
    cancelChooser?: boolean;
}
export interface DialogBoxOption {
    callback?: DialogBoxCallbackSignature;
    valueCallback?: DialogBoxValueCallbackSignature;
    valueChangeCallback?: DialogBoxValueChangeCallbackSignature;
    disabled?: boolean;
    tooltip?: string;
    label: string;
    actions: string[];
}
export declare enum DialogBoxAction {
    Invalid = -1,
    Error = 0,// Uh oh.
    Confirm = 1,// Any positive answer
    Cancel = 2,// Any negative answer
    Close = 3
}
export declare enum DialogSource {
    Game = "Game",
    Shell = "Shell"
}
export type DialogBoxID = number;
interface DialogBoxData {
    id?: DialogBoxID;
    data: DialogBoxDefinition;
    options?: DialogBoxOption[];
    customOptions?: DialogBoxCustom[];
}
interface DialogBoxRequest extends DialogBoxData, IDisplayRequestBase {
}
export declare class DialogBoxDisplayHandler extends DisplayHandlerBase<DialogBoxRequest> {
    private source;
    private inactiveRequests;
    private isInactive;
    constructor(source: DialogSource, priority: number, isInactive: boolean);
    addDisplayRequest(dialogData: DialogBoxData): any;
    show(request: DialogBoxRequest): void;
    hide(_request: DialogBoxRequest, _options: DisplayHideOptions): void;
    setInactive(): void;
    clear(): void;
    setActive(): void;
    setRequestIdAndPriority(request: DialogBoxRequest): void;
}
export declare class DialogBoxModelImpl {
    private source;
    private _shellHandler;
    private _gameHandler;
    get isDialogBoxOpen(): boolean;
    private get activeHandler();
    private get inactiveHandler();
    get shellHandler(): DialogBoxDisplayHandler;
    get gameHandler(): DialogBoxDisplayHandler;
    private getHandler;
    clear(): void;
    showDialogBox(definition: DialogBoxDefinition, options: DialogBoxOption[], customOptions?: DialogBoxCustom[]): any;
    /**
     * Close (if already displayed) or cancel (from the pending list) the dialog box which the DialogBoxID is given.
     * @param dialogBoxID The id of the dialog box to close
     */
    closeDialogBox(dialogBoxID: DialogBoxID): void;
    setSource(source: DialogSource): void;
}
/** ------------------------------------------------------------------------------------------------------------------ */
export declare const DialogBoxModel: DialogBoxModelImpl;
export { DialogBoxModel as default };
