/**
 * @file fxs-radio-button.ts
 * @copyright 2020-2023, Firaxis Games
 * @description A radio button primitive.
 *
 */
export interface RadioButtonChangeEventDetail<T extends string> {
    isChecked: boolean;
    /** value is the string value represented by the radio button */
    value: T;
}
export type RadioButtonChangeEvent<T extends string = string> = ComponentValueChangeEvent<RadioButtonChangeEventDetail<T>>;
export interface RadioButtonGroupChangeEventDetail<T extends string> {
    groupTag: string;
    /** value is the string value represented by the radio button */
    value: T;
}
/**
 * RadioButtonGroupChangeEvent is fired when the value of a radio button group changes.
 *
 * The event is dispatched to the window.
 *
 * The event `value` is the value of the radio button that was selected.
 */
export declare class RadioButtonGroupChangeEvent<T extends string = string> extends CustomEvent<RadioButtonGroupChangeEventDetail<T>> {
    constructor(detail: RadioButtonGroupChangeEventDetail<T>);
}
/**
 * A custom radio button component that can be used in a radio button group.
 *
 * @example
 * ```
 * <fxs-radio-button group-tag="user-graphics" value="high" checked="true" caption="LOC_UI_OPTIONS_GRAPHICS_HIGH"></fxs-radio-button>
 * <fxs-radio-button group-tag="user-graphics" value="medium" caption="LOC_UI_OPTIONS_GRAPHICS_MEDIUM"></fxs-radio-button>
 * <fxs-radio-button group-tag="user-graphics" value="low" caption="LOC_UI_OPTIONS_GRAPHICS_LOW"></fxs-radio-button>
 * ```
 *
 * @fires RadioButtonChangeEvent - Dispatched to the radio button root element when the radio button is toggled. This is a type alias for ComponentValueChangeEvent.
 * @fires RadioButtonGroupChangeEvent - Dispatched to the window when the radio button is toggled.
 *
 * `group-tag` - The group tag of the radio button. Used for associating radio buttons together.
 * `value` - The value of the radio button.
 * `selected` - Whether the radio button is checked.
 * `disabled` - Whether the radio button is disabled.
 */
export default class FxsRadioButton extends ChangeNotificationComponent<string> {
    private readonly ballElement;
    private readonly highlightElement;
    private engineInputEventListener;
    private radioButtonChangeEventListener;
    private mouseEnterEventListener;
    /**
     * If set to a value, other radio buttons with the same groupTag will be deselected when this radio button is selected.
     * If set to null, or not set, no other radio buttons will be deselected automatically.
     */
    private get groupTag();
    /**
     * value is the string value represented by this radio button, not it's checked state.
     */
    private get value();
    private _isChecked;
    private get isChecked();
    private set isChecked(value);
    get disabled(): boolean;
    private set disabled(value);
    private get isTiny();
    private get isSoundDisabled();
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private playPressSound;
    private playFocusSound;
    private onEngineInput;
    private onRadioButtonGroupChange;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private toggle;
    private updateRadioButtonElements;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-radio-button": ComponentRoot<FxsRadioButton>;
    }
    interface WindowEventMap {
        "radio-button-change": RadioButtonGroupChangeEvent;
    }
}
