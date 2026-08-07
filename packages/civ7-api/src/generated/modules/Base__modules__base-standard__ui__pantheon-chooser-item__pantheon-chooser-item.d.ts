import { ChooserItem } from "/base-standard/ui/chooser-item/chooser-item.js";
import { PantheonChooserNode } from "/base-standard/ui/pantheon-chooser-item/model-pantheon-chooser-item.js";
export declare class PantheonChooserItem extends ChooserItem {
    get pantheonChooserNode(): PantheonChooserNode | null;
    set pantheonChooserNode(value: PantheonChooserNode | null);
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "pantheon-chooser-item": ComponentRoot<PantheonChooserItem>;
    }
}
