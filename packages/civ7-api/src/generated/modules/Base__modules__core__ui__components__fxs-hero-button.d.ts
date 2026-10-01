import { FxsActivatable } from "/core/ui/components/fxs-activatable.js";
/**
 * FxsHeroButton
 */
export declare class FxsHeroButton extends FxsActivatable {
    private readonly label;
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-hero-button": ComponentRoot<FxsHeroButton>;
    }
}
