import { FxsActivatable } from "/core/ui/components/fxs-activatable.js";
/**
 * FxsPlusMinusButton
 */
export declare class FxsMinusPlusButton extends FxsActivatable {
    private readonly plusContainer;
    private readonly plusBg;
    private readonly plusBgHighlight;
    private readonly minusContainer;
    private readonly minusBg;
    private readonly minusBgHighlight;
    private readonly mobileHitbox;
    set type(value: "plus" | "minus");
    get type(): "plus" | "minus";
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private update;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-minus-plus": ComponentRoot<FxsMinusPlusButton>;
    }
}
