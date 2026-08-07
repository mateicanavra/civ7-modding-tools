/**
 * @file fxs-text-button.ts
 * @copyright 2023-24, Firaxis Games
 * @description A simple text button.
 *
 * For increased size, set the type attribute to "big".
 * For decorative highlight set highlight-style attribute to "decorative".
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
declare class FxsTextButton extends FxsActivatable {
    onInitialize(): void;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-text-button": ComponentRoot<FxsTextButton>;
    }
}
export {};
