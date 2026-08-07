/**
 * model-culture-tree.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Model for Civics Tree
 */
import UpdateGate from "/core/ui/utilities/utilities-update-gate.js";
import { TreeGrid } from "/base-standard/ui/tree-grid/tree-grid.js";
export interface CultureTreeData {
    type: ProgressionTreeType;
    treeGrid?: TreeGrid;
}
export declare class CultureTreeModel {
    private onUpdate?;
    updateGate: UpdateGate;
    private wasMouseKeyboard;
    private _trees;
    private _activeTree;
    private _sourceProgressionTrees;
    private _iconCallback;
    private _lastHighlightTree;
    constructor();
    set updateCallback(callback: (model: CultureTreeModel) => void);
    get playerId(): PlayerId;
    get trees(): CultureTreeData[];
    get isGamepadActive(): boolean;
    get activeTree(): ProgressionTreeType | undefined;
    set activeTree(eType: ProgressionTreeType | undefined);
    set iconCallback(iconCallback: (node: ProgressionTreeNodeDefinition) => string);
    get iconCallback(): (node: ProgressionTreeNodeDefinition) => string;
    set sourceProgressionTrees(sourceCSV: string);
    private update;
    getCultureTreeData(attr: ProgressionTreeType): CultureTreeData;
    getCard(type: ProgressionTreeNodeType | undefined): any;
    findNode(id: ProgressionTreeNodeType): any;
    findTree(type: ProgressionTreeNodeType): CultureTreeData | null;
    hoverItems(type: ProgressionTreeNodeType): ProgressionTreeNodeType[] | undefined;
    clearHoverItems(): ProgressionTreeNodeType[] | undefined;
}
declare const CultureTree: CultureTreeModel;
export { CultureTree as default };
