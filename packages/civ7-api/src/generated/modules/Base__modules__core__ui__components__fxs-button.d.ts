/**
 * @file fxs-button.ts
 * @copyright 2019-2023, Firaxis Games
 * @description Base button.
 *
 * Set the `caption` attribute to the text you want to display on the button.
 *
 * Set the `action-key` attribute to the action key you want to display on the button.
 *
 * Set the `type` attribute to `big` to make the button bigger.
 */
import FxsActivatable, { FxsActivatableAttribute } from "/core/ui/components/fxs-activatable.js";
export type FxsButtonAttribute = Extract<FxsActivatableAttribute, "action-key"> | "caption";
/**
 * FxsButton is a simple clickable button element, not intended to be overridden.
 *
 * Other buttons should FxsActivatable as a base class instead.
 */
export declare class FxsButton extends FxsActivatable {
    private readonly label;
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-button": ComponentRoot<FxsButton>;
    }
}
export { FxsButton as default };
