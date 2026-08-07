/**
 * @file fxs-ring-meter.ts
 * @copyright 2024, Firaxis Games
 * @description Ring meter control
 *
 * Set min-value and max-value to control the range of the meter.
 * Set value to adjust how full the the meter is.
 * Set animation-duration to choose how fast the meter animates in milliseconds.
 * Set ring-class to alter the style of the ring halves and/or background.
 *
 * NOTE: This control fits its size to its content unless width/height are directly set.
 *       It must have an equal width and height or clipping may occur along the diagonals.
 */
/** @description A primitive ring meter component */
export declare class FxsRingMeter extends Component {
    private ring?;
    private leftRing?;
    private rightRing?;
    private leftMask?;
    private rightMask?;
    private ringFill;
    private ringFillStart;
    private ringFillEased;
    private isAnimating;
    private lastAnimationTime;
    private animationTimeElapsed;
    get animationDuration(): number;
    set animationDuration(value: number);
    get minValue(): number;
    set minValue(value: number);
    get maxValue(): number;
    set maxValue(value: number);
    get value(): number;
    set value(value: number);
    get ringClass(): string;
    set ringClass(value: string);
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
    private calculateRingFillPercentage;
    private startAnimation;
    private stopAnimation;
    private startAnimationTimer;
    private calculateEasedRingFill;
    private animate;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-ring-meter": ComponentRoot<FxsRingMeter>;
    }
}
export { FxsRingMeter as default };
