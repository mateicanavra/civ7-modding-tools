/**
 * @file editor-keyboard-mapping.ts
 * @copyright 2024-2025, Firaxis Games
 * @description The keyboard mapping screen.
 */
import FxsButton from "/core/ui/components/fxs-button.js";
import { FxsCloseButton } from "/core/ui/components/fxs-close-button.js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
interface KeyboardMapActionElementNode {
    context: InputContext | undefined;
    actionName: string;
    actionID: InputActionID;
    gestureIndex: number;
}
declare class EditorKeyboardMapping extends Panel {
    closeButton: ComponentRoot<FxsCloseButton>;
    revertButton: ComponentRoot<FxsButton>;
    confirmButton: ComponentRoot<FxsButton>;
    actionContainer: HTMLDivElement;
    mappingDataMap: any;
    private isReadOnly;
    private engineInputListener;
    private closeButtonListener;
    private revertButtonListener;
    private confirmButtonListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private render;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    private addActionsForContext;
    private createActionEntry;
    private onCloseButton;
    private onRevertButton;
    private onConfirmButton;
    private onEngineInput;
    private handleEngineInput;
}
declare const EditorKeyboardMappingTagName = "editor-keyboard-mapping";
declare global {
    interface HTMLElementTagNameMap {
        [EditorKeyboardMappingTagName]: ComponentRoot<EditorKeyboardMapping>;
    }
}
export interface EditorKeyboardBindingPanelNode {
    contextName: string;
    context: InputContext;
    actionName: string;
    actionID: InputActionID;
    gestureIndex: number;
}
declare class EditorKeyboardBindingPanel extends Panel {
    private _node?;
    get editorKeybardBindingPanelNode(): EditorKeyboardBindingPanelNode | undefined;
    set editorKeybardBindingPanelNode(value: EditorKeyboardBindingPanelNode);
    private contextNameDiv;
    private actionNameDiv;
    private gestureString;
    private engineInputListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onReceiveFocus(): void;
    private onInputGestureRecorded;
    onEngineInput(inputEvent: InputEngineEvent): void;
    private getContent;
}
declare const EditorKeyboardBindingPanelTagName = "editor-keyboard-binding-panel";
declare global {
    interface HTMLElementTagNameMap {
        [EditorKeyboardBindingPanelTagName]: ComponentRoot<EditorKeyboardBindingPanel>;
    }
}
export declare class EditorKeyboardButton extends FxsButton {
    private _buttonNode?;
    get editorControllerChooserNode(): KeyboardMapActionElementNode | undefined;
    set editorControllerChooserNode(value: KeyboardMapActionElementNode | undefined);
    private isReadOnly;
    private activateListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private onInputActionBinded;
    private onActivate;
}
declare global {
    interface HTMLElementTagNameMap {
        "editor-keyboard-button": ComponentRoot<EditorKeyboardButton>;
    }
}
export {};
