/**
 * @file attribute-small-card.ts
 * @copyright 2024, Firaxis Games
 * @description This component is a small version for the nodes on the attributes tree
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
export declare class AttributeSmallCard extends FxsActivatable {
    private disabledDiv?;
    private container;
    private icon;
    private idle;
    private highlight;
    private imagePath;
    private iconContent;
    private get repeatable();
    private get completed();
    get disabled(): boolean;
    onInitialize(): void;
    private render;
    addLockStyling(): void;
    removeLockStyling(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
