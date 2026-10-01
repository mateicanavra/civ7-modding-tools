/**
 * @file panel-celebration-chooser.ts
 * @copyright 2020-2024, Firaxis Games
 * @description Celebration chooser screen.  This screen is an instance of a general chooser.
 */
import { ChooserItem } from "/base-standard/ui/chooser-item/chooser-item.js";
import { ChooserNode } from "/base-standard/ui/chooser-item/model-chooser-item.js";
declare class CelebrationChooserItem extends ChooserItem {
    get celebrationChooserNode(): CelebrationChooserNode | null;
    set celebrationChooserNode(value: CelebrationChooserNode | null);
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "celebration-chooser-item": ComponentRoot<CelebrationChooserItem>;
    }
}
interface CelebrationChooserNode extends ChooserNode {
    description: string;
    turnDuration: number;
}
export {};
