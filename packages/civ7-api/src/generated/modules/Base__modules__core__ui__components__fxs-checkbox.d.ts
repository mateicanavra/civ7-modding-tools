/**
 * @file fxs-checkbox.ts
 * @copyright 2020-2023, Firaxis Games
 * @description A checkbox primitive.
 */
interface CheckboxValueChangeEventDetail {
    value: boolean;
    forced: boolean;
}
export type CheckboxValueChangeEvent = ComponentValueChangeEvent<CheckboxValueChangeEventDetail>;
export declare class FxsCheckbox extends ChangeNotificationComponent<CheckboxValueChangeEventDetail> {
    private navHelp?;
    private readonly navContainer;
    private readonly idleElement;
    private readonly highlightElement;
    private readonly pressedElement;
    private engineInputListener;
    /** Get the current value of the checkbox */
    get value(): boolean;
    get disabled(): boolean;
    set disabled(value: boolean);
    private _isChecked;
    private get isChecked();
    private set isChecked(value);
    toggle(force?: boolean | undefined): void;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onEngineInput;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private updateCheckboxElements;
    private render;
    private addOrRemoveNavHelpElement;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-checkbox": ComponentRoot<FxsCheckbox>;
    }
}
export {};
