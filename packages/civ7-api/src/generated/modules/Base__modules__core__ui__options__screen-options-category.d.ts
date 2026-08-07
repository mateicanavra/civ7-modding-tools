/**
 * @file screen-options-category.ts
 * @copyright 2023, Firaxis Games
 * @description Holds options of a single category in the options screen.
 */
import { FxsVSlot } from "/core/ui/components/fxs-slot.js";
import { OptionInfo } from "/core/ui/options/model-options.js";
/**
 * ScreenOptionsCategory holds a collection of options under a certain category.
 */
export declare class ScreenOptionsCategory extends FxsVSlot {
    groupHeaders: Record<string, HTMLElement | undefined>;
    /**
     * appendOption adds the given option to the group.
     */
    appendOption(option: OptionInfo): {
        optionRow: any;
        optionElement: any;
    };
    /**
     * getOptionReferenceNode finds the node to insert the option after.
     *
     * This should be the next group header, or if no group is specified, the first group header.
     */
    private getOptionReferenceNode;
    private createGroupHeader;
    onInitialize(): void;
    private render;
}
declare const ScreenOptionsCategoryTagName: "screen-options-category";
declare global {
    interface HTMLElementTagNameMap {
        [ScreenOptionsCategoryTagName]: ComponentRoot<ScreenOptionsCategory>;
    }
}
export {};
