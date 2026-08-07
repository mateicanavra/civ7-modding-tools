/**
 * @file editor-controller-mapping.ts
 * @copyright 2021-2023, Firaxis Games
 * @description The controller mapping screen.
 */
import { FxsChooserItem } from "/core/ui/components/fxs-chooser-item.js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
/**
 * Display and modify the game options.
 */
declare class EditorControllerMapping extends Panel {
    private controlList;
    private prevContext;
    private currentContext;
    private prevActionID;
    private currentActionID;
    private inputDeviceLayout;
    private inputControllerIcon;
    private inputDeviceType;
    private isDeviceTypeToActionsDefined;
    private isReadOnly;
    private actionListDivs;
    private actionVisDivs;
    private expandButtons;
    private controllerContainer;
    private actionListContainer;
    private controllerActionDiv;
    private actionList;
    private invertCheckbox?;
    private actionDescriptionDivs;
    private controllerSection;
    private backButton;
    private restoreButton;
    private saveButton;
    private title;
    private selectedAction;
    private expandButtonActivateListener;
    private chooserItemFocusListener;
    private chooserItemHoverListener;
    private chooserItemBlurListener;
    private chooserItemActivateListener;
    private expandButtonFocusListener;
    private expandButtonHoverListener;
    private backButtonActivateListener;
    private restoreButtonActivateListener;
    private saveButtonActivateListener;
    private invertCheckboxFocusListener;
    private invertCheckboxHoverListener;
    private invertCheckboxActivateListener;
    private activeDeviceTypeListener;
    private resizeListener;
    private engineInputListener;
    onInitialize(): void;
    private getContent;
    private getControllerMapActionElement;
    private getEditorControllerChooserItem;
    private generateControlList;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private updateActionList;
    private updateControllerActionDiv;
    private updateNavTray;
    private updateInvertCheckbox;
    private updateActionVisDivs;
    private updateTitle;
    private updateControllerContainer;
    private updateMapActionElements;
    private updateControllerSection;
    private updateActionDescriptionDiv;
    private updateInputDeviceLayout;
    private updateInputDeviceType;
    private updateTargetedAction;
    private onEngineInput;
    private handleEngineInput;
    private onInputActionBinded;
    private onExpandButtonActivate;
    private onChooserItemFocus;
    private onChooserItemHover;
    private onChooserItemBlur;
    private onChooserItemActivate;
    private onInvertCheckboxFocus;
    private onInvertCheckboxHover;
    private onActiveDeviceTypeChanged;
    private onInvertCheckboxActivate;
    private onExpandButtonFocus;
    private onExpandButtonHover;
    private onBackButtonActivate;
    private onRestoreDefaultActivate;
    private onConfirmChangeActivate;
    private onResize;
}
declare const EditorControllerMappingTagName = "editor-controller-mapping";
declare global {
    interface HTMLElementTagNameMap {
        [EditorControllerMappingTagName]: ComponentRoot<EditorControllerMapping>;
    }
}
export interface EditorInputBindingPanelNode {
    contextName: string;
    context: InputContext;
    actionName: string;
    actionID: InputActionID;
}
declare class EditorInputBindingPanel extends Panel {
    private _node?;
    get editorInputBindingPanelNode(): EditorInputBindingPanelNode | undefined;
    set editorInputBindingPanelNode(value: EditorInputBindingPanelNode);
    private contextNameDiv;
    private actionNameDiv;
    private gestureIcon;
    private gestureIconText;
    private inputDeviceType;
    private recordingDeviceTypes;
    private engineInputListener;
    private activeDeviceTypeListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onReceiveFocus(): void;
    private onInputGestureRecorded;
    private onActiveDeviceTypeChanged;
    onEngineInput(inputEvent: InputEngineEvent): void;
    private getContent;
}
declare const EditorInputBindingPanelTagName = "editor-input-binding-panel";
declare global {
    interface HTMLElementTagNameMap {
        [EditorInputBindingPanelTagName]: ComponentRoot<EditorInputBindingPanel>;
    }
}
export interface EditorControllerChooserNode {
    context: InputContext;
    actionName: string;
    actionID: InputActionID;
}
export declare class EditorControllerChooserItem extends FxsChooserItem {
    private _chooserNode?;
    get editorControllerChooserNode(): EditorControllerChooserNode | undefined;
    set editorControllerChooserNode(value: EditorControllerChooserNode | undefined);
    protected actionNameDiv: HTMLElement;
    protected gestureIcon: HTMLElement;
    protected gestureIconText: HTMLElement;
    private inputDeviceType;
    private activeDeviceTypeListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    renderChooserItem(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private onInputActionBinded;
    private onActiveDeviceTypeChanged;
    private updateInputDeviceType;
}
declare global {
    interface HTMLElementTagNameMap {
        "editor-controller-chooser-item": ComponentRoot<EditorControllerChooserItem>;
    }
}
export declare class EditorControllerReadOnlyItem extends EditorControllerChooserItem {
    onAttach(): void;
    renderChooserItem(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editor-controller-read-only-item": ComponentRoot<EditorControllerReadOnlyItem>;
    }
}
export interface ControllerMapActionElementNode {
    context: InputContext;
    actionName: string;
    actionID: InputActionID;
    gestureKey?: number;
}
export declare class ControllerMapActionElement extends Component {
    private _node?;
    private highlight;
    get controllerMapActionElementNode(): ControllerMapActionElementNode | undefined;
    set controllerMapActionElementNode(value: ControllerMapActionElementNode);
    private actionNameDiv;
    private gestureIconContainer;
    private gestureIcon;
    private gestureIconText;
    private highlightDiv;
    private handleResize;
    private activeDeviceTypeListener;
    private inputDeviceLayout;
    private inputDeviceType;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    render(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private onActiveDeviceTypeChanged;
    private onResize;
    private onInputActionBinded;
    private updateActionNameDiv;
    private updateGestureIconContainer;
    private updateHighlight;
    private updateInputDeviceLayout;
    private updateInputDeviceType;
}
declare global {
    interface HTMLElementTagNameMap {
        "controller-map-action-element": ComponentRoot<ControllerMapActionElement>;
    }
}
export {};
