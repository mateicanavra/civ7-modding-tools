/**
 * @file fxs-activatable.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Base activatable component.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export type FxsActivatableAttribute = "action-key";
export declare const ActionActivateEventName: string;
export declare class ActionActivateEvent extends CustomEvent<{
    x: number;
    y: number;
}> {
    constructor(x: number, y: number);
}
/** @description A component that you can activate */
export declare class FxsActivatable extends Component {
    protected navHelp?: HTMLElement;
    private static readonly FEEDBACK_LOW;
    private static readonly FEEDBACK_HIGH;
    private static readonly FEEDBACK_DURATION;
    private actionKey;
    private isFeedbackEnabled;
    private isSoundEnabled;
    private onActivatableEngineInputEventListener;
    private onActivatableFocusEventListener;
    private onActivatableBlurEventListener;
    private onActivatableMouseLeaveEventListener;
    private onActivatableMouseEnterEventListener;
    protected shouldPlayErrorSound: boolean;
    get disabledCursorAllowed(): boolean;
    set disabledCursorAllowed(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    private onActivatableMouseEnter;
    private onActivatableMouseLeave;
    protected onActivatableFocus(): void;
    protected onActivatableBlur(): void;
    protected onActivatableEngineInput(inputEvent: InputEngineEvent): void;
    triggerUiVFX(eventName: string): void;
    playActivateSound(): void;
    playPressedSound(): void;
    playErrorPressedSound(): void;
    private updateDisabledStyle;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    addOrRemoveNavHelpElement(parent: HTMLElement, value: string | null): void;
    /**
     * @override
     */
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
/**
 * Updates the button state and captions in response to an OperationResult.
 *
 * @example
 * ```
 * const button = document.querySelector('.my-fxs-button');
 * const result = Game.PlayerOperations.canStart(playerID, operationType);
 * UpdateFromOperationResult(button, result);
 * ```
 * @param element The button to update. This is an element where the component is an FxsActivatable.
 * @param result The OperationResult to process.
 */
export declare const UpdateFromOperationResult: (element: HTMLElement, result: OperationResult) => void;
export interface UpdateTooltipDisabledStateParams {
    element: HTMLElement;
    disabled: boolean;
    /** Localized text explaining why the activatable is disabled */
    disabledReasons?: LocalizedString[];
}
/**
 * UpdateActivatableDisabledState updates the disabled state of an activatable element.
 *
 */
export declare const UpdateActivatableDisabledState: ({ element, disabled, disabledReasons, }: UpdateTooltipDisabledStateParams) => void;
declare global {
    interface HTMLElementTagNameMap {
        "fxs-activatable": ComponentRoot<FxsActivatable>;
    }
    interface HTMLElementEventMap {
        "action-activate": ActionActivateEvent;
    }
}
export { FxsActivatable as default };
