import { BeliefPickerChooserNode } from "/base-standard/ui/belief-picker-chooser-item/model-belief-picker-chooser-item.js";
import { ChooserItem } from "/base-standard/ui/chooser-item/chooser-item.js";
export declare class BeliefPickerChooserItem extends ChooserItem {
    get beliefPickerChooserNode(): BeliefPickerChooserNode | null;
    set beliefPickerChooserNode(value: BeliefPickerChooserNode | null);
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "belief-picker-chooser-item": ComponentRoot<BeliefPickerChooserItem>;
    }
}
