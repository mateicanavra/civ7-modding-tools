import { ChooserItem } from "/base-standard/ui/chooser-item/chooser-item.js";
import { ChooserNode } from "/base-standard/ui/chooser-item/model-chooser-item.js";
export declare const ActionConfirmEventName: "action-confirm";
export declare class ActionConfirmEvent extends CustomEvent<never> {
    constructor();
}
export interface LoadChooserNode extends ChooserNode {
    secondaryIcon: string;
    primaryColor: string;
    secondaryColor: string;
    description1: string;
    description2: string;
    time: string;
    hour: string;
}
export interface SaveChooserNode extends ChooserNode {
    initialValue: string;
}
export declare class SaveLoadChooserItem extends ChooserItem {
    readonly SMALL_SCREEN_MODE_MAX_HEIGHT = 768;
    get saveloadChooserNode(): LoadChooserNode | SaveChooserNode | null;
    set saveloadChooserNode(value: LoadChooserNode | SaveChooserNode | null);
    private type;
    private textboxValidateVirtualKeyboardListener;
    private textboxValueChangeListener;
    private handleDoubleClick;
    private handleFocusIn;
    private resizeListener;
    private iconContainer;
    private textbox;
    private leaderIcon;
    private civIcon;
    private header;
    private description1;
    private description2;
    private time;
    private hour;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    render(): void;
    private updateData;
    private updateIconContainer;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private onTextboxValidateVirtualKeyboard;
    private onTextboxValueChange;
    private onFocusIn;
    private onDoubleClick;
    private onResize;
}
declare global {
    interface HTMLElementTagNameMap {
        "save-load-chooser-item": ComponentRoot<SaveLoadChooserItem>;
    }
    interface HTMLElementEventMap {
        [ActionConfirmEventName]: ActionConfirmEvent;
    }
}
