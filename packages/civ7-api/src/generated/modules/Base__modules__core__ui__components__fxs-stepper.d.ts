/**
 * @file fxs-stepper.ts
 * @copyright 2020-2023, Firaxis Games
 * @description A stepper primitive.
 *
 * Set the `value` attribute to the current value of the stepper.
 * Set the `min-value` attribute to the minimum value of the stepper.
 * Set the `max-value` attribute to the maximum value of the stepper.
 * Set the `captions-list` attribute to a JSON array of strings to use as captions for each step.
 */
export declare class FxsStepper extends ChangeNotificationComponent {
    private minValue;
    private _value;
    private maxValue;
    private caption;
    private leftArrow;
    private rightArrow;
    private stepperSteps;
    private captionsList;
    private navigateInputEventListener;
    private leftArrowClickEventListener;
    private rightArrowClickEventListener;
    get value(): number;
    get captionText(): any;
    private addEventListeners;
    private removeEventListeners;
    private onNavigateInput;
    private onLeftArrowClick;
    private onRightArrowClick;
    private updateStepperSteps;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(attributeName: string, _oldValue: string | null, newValue: string | null): void;
    private setNewValue;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-stepper": ComponentRoot<FxsStepper>;
    }
}
