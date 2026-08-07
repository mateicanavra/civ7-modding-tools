/**
 * @copyright 2024, Firaxis Games
 * @description a component that represents a tab item in a tab bar
 * @file fxs-tab-item.ts
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
export declare class FxsTabItem extends FxsActivatable {
    private _labelElement;
    private get labelElement();
    private iconGroupElement;
    onInitialize(): void;
    updateLabelText(): void;
    updateIconState(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-tab-item": ComponentRoot<FxsTabItem>;
    }
}
