import { Component } from "solid-js";
import type { TechNode } from "/base-standard/ui-next/screens/choosers/tech-chooser/tech-chooser.js";
interface TechChooserItemProps {
    node: TechNode;
    onSelect: (id: ProgressionTreeNodeType) => void;
}
export declare const TechChooserItem: Component<TechChooserItemProps>;
export {};
