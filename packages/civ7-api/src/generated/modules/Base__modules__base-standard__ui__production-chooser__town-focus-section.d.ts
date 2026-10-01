/**
 * town-focus-section.ts
 * @copyright 2024, Firaxis Gmaes
 * @description The sectin foo 4
 */
import { FxsChooserItem } from "/core/ui/components/fxs-chooser-item.js";
import { FxsVSlot } from "/core/ui/components/fxs-slot.js";
export declare class TownFocusChooserItem extends FxsChooserItem {
    private readonly nameElement;
    private readonly descriptionElement;
    private readonly projectIconElement;
    onInitialize(): void;
    private updateIcon;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
}
export declare class TownFocusSection extends FxsVSlot {
    private readonly townFocusItem;
    private readonly defaultLabelElement;
    private readonly connectionsElement;
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string, newValue: string): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "town-focus-chooser-item": ComponentRoot<TownFocusChooserItem>;
        "town-focus-section": ComponentRoot<TownFocusSection>;
    }
}
