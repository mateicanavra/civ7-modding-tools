/**
 * @file unit-rename.ts
 * @copyright 2025, Firaxis Games
 * @description Panel for renaming units.
 */
import Panel from "/core/ui/panel-support.js";
export declare const UnitRenameConfirmEventName = "unit-rename-confirm";
export declare class UnitRenameConfirmEvent extends CustomEvent<{
    newName: string;
}> {
    constructor(newName: string);
}
export declare const UnitRenameHideStatusToggledEventName = "unit-rename-hide-status-toggle";
export declare class UnitRenameHideStatusToggledEvent extends CustomEvent<{
    isHidden: boolean;
}> {
    constructor(isHidden: boolean);
}
declare class UnitRename extends Panel {
    private nameEditConfirmButton;
    private nameEditTextBox;
    private nameEditCloseButton;
    private onCommanderNameConfirmedListener;
    private onTextBoxTextChangedListener;
    private onTextBoxEditingStoppedListener;
    private onCloseButtonListener;
    private onEngineInputListener;
    private textboxMaxLength;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onNameConfirmed;
    private onTextBoxTextChanged;
    private onTextBoxEditingStopped;
    private onEngineInput;
    private onCloseButton;
    onAttributeChanged(name: string, oldValue: string, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "name-edit": ComponentRoot<UnitRename>;
    }
    interface HTMLElementEventMap {
        "unit-rename-confirm": UnitRenameConfirmEvent;
    }
}
export {};
