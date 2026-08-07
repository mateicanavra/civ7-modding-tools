/**
 * @file screen-dialog-box.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Popup dialog, visual part of the dialog box.
 */
import "/core/ui/components/fxs-button-group.js";
import { DialogBoxID, DialogBoxOption } from "/core/ui/dialog-box/manager-dialog-box.js";
import { DialogBoxCustom, DialogBoxDefinition } from "/core/ui/dialog-box/model-dialog-box.js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
/**
 * Generic dialog box pop up.
 */
export declare class ScreenDialogBox extends Panel {
    private dialogId;
    private canClose;
    private readonly header;
    private extensions;
    private extensionsContainer;
    private buttonContainer;
    private closeButtonListener;
    private engineInputListener;
    private navigateInputListener;
    private valueChangeListener;
    private textboxKeyupListener;
    private textBoxTextEditStopListener;
    private closing;
    private options;
    private customOptions;
    private useChooserItem;
    private customDialog;
    private isBodyCentered;
    private buttonAudioGroup;
    private buttonAudioPress;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    setDialogId(dialogId: DialogBoxID): void;
    setOptions(definition: DialogBoxDefinition, options: DialogBoxOption[], customOptions: DialogBoxCustom[]): void;
    private onEngineInput;
    private onNavigateInput;
    protected requestClose(inputEvent?: InputEngineEvent): void;
    private onValueChange;
    private onOption;
    close(): void;
    private onTextboxKeyup;
    private onTextboxEditStop;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-dialog-box": ComponentRoot<ScreenDialogBox>;
    }
}
