/**
 * @file fxs-chooser-item.ts
 * @copyright 2024, Firaxis Games
 */
import { FxsChooserItem } from "/core/ui/components/fxs-chooser-item.js";
import { TreeChooserNode } from "/base-standard/ui/tree-chooser-item/model-tree-chooser-item.js";
/**
 * A chooser item to be used with the tech or civic choosers
 */
export declare class TreeChooserItem extends FxsChooserItem {
    protected _treeChooserNode: TreeChooserNode | null;
    get treeChooserNode(): TreeChooserNode | null;
    set treeChooserNode(value: TreeChooserNode | null);
    onInitialize(): void;
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "tree-chooser-item": ComponentRoot<TreeChooserItem>;
    }
}
