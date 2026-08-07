/**
 * @file fxs-chooser-item.ts
 * @copyright 2024, Firaxis Games
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { ChooserNode } from "/base-standard/ui/chooser-item/model-chooser-item.js";
/**
 * A chooser item to be used with the tech or civic choosers
 */
export declare class ChooserItem extends FxsActivatable {
    private isSelectHighlight;
    private canFocusOnDisabled;
    protected _chooserNode: ChooserNode | null;
    private disabledDiv?;
    private container;
    private selectedBorder;
    private focusOutline;
    private highlight;
    private selectHighlight;
    get chooserNode(): ChooserNode | null;
    set chooserNode(value: ChooserNode | null);
    onInitialize(): void;
    protected render(): void;
    protected createChooserIcon(iconStr: string): HTMLElement;
    addLockStyling(): void;
    removeLockStyling(): void;
    /**
     * @override
     */
    addOrRemoveNavHelpElement(parent: HTMLElement, value: string | null): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "chooser-item": ComponentRoot<ChooserItem>;
    }
}
