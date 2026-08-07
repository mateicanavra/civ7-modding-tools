import type { CultureNode } from "/base-standard/ui-next/screens/choosers/culture-chooser/culture-chooser.js";
interface CultureChooserItemProps {
    node: CultureNode;
    onSelect: (id: ProgressionTreeNodeType) => void;
}
export declare function CultureChooserItem(props: CultureChooserItemProps): any;
export {};
