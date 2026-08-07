/**
 * model-attribute-trees.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Gathers the identity data for the active player
 */
import UpdateGate from "/core/ui/utilities/utilities-update-gate.js";
import { TreeGrid } from "/base-standard/ui/tree-grid/tree-grid.js";
export interface AttributeData {
    type: AttributeType;
    availablePoints: number;
    nextPointProgress: number;
    attributeTree: ProgressionTreeType;
    wildCardLabel: string;
    treeGrid?: TreeGrid;
}
declare class AttributeTreesModel {
    private onUpdate?;
    updateGate: UpdateGate;
    private wasMouseKeyboard;
    private _attributes;
    private _activeTreeAttribute;
    private _wildCardPoints;
    private attributesHotkeyListener;
    constructor();
    set updateCallback(callback: (model: AttributeTreesModel) => void);
    get playerId(): PlayerId;
    get attributes(): AttributeData[];
    get wildCardPoints(): number;
    get isGamepadActive(): boolean;
    get activeTreeAttribute(): AttributeType | null;
    set activeTreeAttribute(eType: AttributeType | null);
    private update;
    getAttributeData(attr: AttributeType): AttributeData;
    canBuyAttributeTreeNode(nodeId: ProgressionTreeNodeType): boolean;
    buyAttributeTreeNode(nodeId: ProgressionTreeNodeType): void;
    getCard(type: string | undefined): any;
    private onAttributesHotkey;
}
declare const AttributeTrees: AttributeTreesModel;
export { AttributeTrees as default };
