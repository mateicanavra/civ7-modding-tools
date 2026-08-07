/**
 * @file fxs-editable-header.ts
 * @copyright 2025, Firaxis Games
 */
import { FxsHeader } from "/core/ui/components/fxs-header.js";
export declare const EditableHeaderTextChangedEventName = "editable-header-text-changed";
export declare class EditableHeaderTextChangedEvent extends CustomEvent<{
    newStr: string;
}> {
    constructor(newStr: string);
}
export declare const EditableHeaderExitEditEventName = "editable-header-exit-edit";
export declare class EditableHeaderExitEditEvent extends CustomEvent<{
    newStr: string;
}> {
    constructor();
}
export declare class FxsEditableHeader extends FxsHeader {
    private inputHandler;
    private editableTextBox;
    private staticText;
    private textEditToggleButton;
    private textEditToggleNavHelp;
    private disable;
    private onEditToggleActivatedListener;
    private onTextEditStoppedListener;
    private engineInputListener;
    private activeDeviceChangedListener;
    private bPreventRecursion;
    private textboxMaxLength;
    onAttach(): void;
    onDetach(): void;
    protected render(): void;
    private onActiveDeviceChange;
    private onTextEditStopped;
    private onEngineInput;
    private onCancelEdit;
    private onEditToggleActivated;
    private textEditBegin;
    private textEditEnd;
    onAttributeChanged(_name: string, _oldValue: string, _newValue: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-editable-header": ComponentRoot<FxsEditableHeader>;
    }
    interface HTMLElementEventMap {
        "editable-header-text-changed": EditableHeaderTextChangedEvent;
    }
}
