/**
 * @file fxs-textbox.ts
 * @copyright 2022 - 2025, Firaxis Games
 * @description A textbox primitive.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export declare class FxsTextboxValidateVirtualKeyboard extends CustomEvent<{
    value: string;
}> {
    constructor(detail: {
        value: string;
    });
}
export declare const TextBoxTextChangedEventName = "text-changed";
export declare class TextBoxTextChangedEvent extends CustomEvent<{
    newStr: string;
}> {
    constructor(newStr: string);
}
export declare const TextBoxTextEditStopEventName = "text-edit-stop";
export declare class TextBoxTextEditStopEvent extends CustomEvent<{
    confirmed: boolean;
    inputEventName?: string;
}> {
    constructor(confirmed: boolean, inputEventName?: string);
}
declare class FxsTextbox extends ChangeNotificationComponent {
    private readonly textInput;
    private textInputListener;
    private textInputFocusListener;
    private focusListener;
    private focusOutListener;
    private engineInputListener;
    private navigateInputListener;
    private handleDoubleClick;
    private keyUpListener;
    private placeholder;
    private isPlaceholderActive;
    private overrideText;
    private showKeyboardOnActivate;
    private caseMode;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onKeyUp;
    private onEngineInput;
    private onNavigateInput;
    private onDoubleClick;
    private onTextInput;
    private onTextInputFocus;
    private tryRemovePlaceholder;
    private tryFallbackOnPlaceholderValue;
    private onFocus;
    private onFocusOut;
    onActivate(inputEvent?: InputEngineEvent): void;
    private onVirtualKeyboardTextEntered;
    private onVirtualKeyboardTextCanceled;
    private clearVirtualKeyboardCallbacks;
    onAttributeChanged(name: string, oldValue: string, newValue: string | null): void;
    get value(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-textbox": ComponentRoot<FxsTextbox>;
    }
    interface HTMLElementEventMap {
        "text-changed": TextBoxTextChangedEvent;
        "text-edit-stop": TextBoxTextEditStopEvent;
    }
}
export { FxsTextbox as default };
