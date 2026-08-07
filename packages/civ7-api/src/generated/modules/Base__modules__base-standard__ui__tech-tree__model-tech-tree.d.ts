/**
 * model-tech-tree.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Model for Tech Tree
 */
import UpdateGate from "/core/ui/utilities/utilities-update-gate.js";
import { TreeGrid } from "/base-standard/ui/tree-grid/tree-grid.js";
export interface TechTreeData {
    type: ProgressionTreeType;
    treeGrid?: TreeGrid;
}
export declare class TechTreeModel {
    private onUpdate?;
    updateGate: UpdateGate;
    private wasMouseKeyboard;
    private _tree;
    private _activeTree;
    private _sourceProgressionTrees;
    private _iconCallback;
    constructor();
    set updateCallback(callback: (model: TechTreeModel) => void);
    get playerId(): PlayerId;
    get tree(): TechTreeData | null;
    get isGamepadActive(): boolean;
    get activeTree(): ProgressionTreeType | null;
    set activeTree(eType: ProgressionTreeType | null);
    set iconCallback(iconCallback: (node: ProgressionTreeNodeDefinition) => string);
    get iconCallback(): (node: ProgressionTreeNodeDefinition) => string;
    set sourceProgressionTrees(sourceCSV: string);
    private update;
    getCard(type: ProgressionTreeNodeType | undefined): any;
    findNode(id: string): any;
    hoverItems(type: ProgressionTreeNodeType): ProgressionTreeNodeType[] | undefined;
    clearHoverItems(): ProgressionTreeNodeType[] | undefined;
    canAddChooseNotification(): any;
}
declare const TechTree: TechTreeModel;
export { TechTree as default };
