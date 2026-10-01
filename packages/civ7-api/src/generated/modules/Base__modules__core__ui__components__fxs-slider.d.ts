/**
 * @file fxs-slider.ts
 * @copyright 2020-2023, Firaxis Games
 * @description A UI slider control primitive for selecting a smooth or stepped value between a range.
 *
 * TODO: @todo Need support for stylizing "steps".
 *
 * Note: these attributes are not observable and are only read once during initialization.
 *
 * Set the `steps` attribute to 0 for a smooth slider, or a positive integer for a stepped slider.
 *
 * Set the `min` attribute to the minimum value of the slider.
 *
 * Set the `value` attribute to set the initial value of the slider.
 *
 * Set the `max` attribute to the maximum value of the slider.
 */
export interface SliderValueChangeEventDetail {
    percent: number;
    value: number;
    min: number;
    max: number;
    steps: number;
}
export type SliderValueChangeEvent = ComponentValueChangeEvent<SliderValueChangeEventDetail>;
export declare class FxsSlider extends ChangeNotificationComponent {
    private readonly leftArrow;
    private readonly rightArrow;
    private readonly bar;
    private readonly fill;
    private readonly thumb;
    private dragInProgress;
    private _percent;
    private min;
    private max;
    private steps;
    private intervalHandle;
    private intervalActive;
    private intervalLeft;
    private navigateInputListener;
    private intervalHandler;
    private thumbMouseDownListener;
    private blurListener;
    private engineInputListener;
    private engineInputCaptureListener;
    private dragStopEventListener;
    private dragMoveEventListener;
    private onRightArrowActivateListener;
    private onLeftArrowActivateListener;
    private resizeObserver;
    /** Whether the slider is disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    get range(): number;
    /** return the real, internal value between 0-1 of the slider */
    get percent(): number;
    /** Get the current value of the slider based on the min/max range and any steps that have been set */
    get value(): number;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onBlur;
    private onEngineInput;
    private onEngineInputCapture;
    private onTouchPan;
    private stopDrag;
    private updateValueAttribute;
    private onInterval;
    private onNavigateInput;
    private playChangeSound;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    private getHTMLAttributeNumber;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private updateArrowDisabledState;
    private updateDisabledState;
    private realizeThumb;
    private onDragStart;
    private onDragMove;
    private onDragStop;
    /**
     * Determine the ranged value on the slider based on a cursor's X position relative to the screen.
     * @param {number} cursorX The X position (in pixels) of the cursor
     * @returns {number} A value in the slider's range.
     */
    private computeValueFromCursor;
    /**
     * For a given value, obtain the equivalent step value.  (If step is 0, the value is the same.)
     * @param value A values
     * @returns value when placed within steps
     */
    private getStepValue;
    /**
     * Set the range of values that can be returned from this slider.
     * @param min The minimum boundary of the range.
     * @param max The maximum boundary of the range.
     */
    setRange(min?: number, max?: number): void;
    setSteps(steps?: number): void;
    setValue(value: number): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-slider": ComponentRoot<FxsSlider>;
    }
}
