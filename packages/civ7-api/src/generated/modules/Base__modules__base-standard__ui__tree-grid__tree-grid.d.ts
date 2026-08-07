/**
 * tree-grid.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Contains tree data for models to use.
 */
import { GridCard, GridCardLine, TreeGridCard, TreeGridDirection } from "/base-standard/ui/tree-grid/tree-support.js";
type GetIconPath = (node: ProgressionTreeNodeDefinition) => string;
type GetTurnForNode = (nodeType: ProgressionTreeNodeType) => number;
type GetCostForNode = (nodeType: ProgressionTreeNodeType) => number | null;
type CanPurchaseNode = (node: ProgressionTreeNodeType) => boolean;
interface TreeGridConfigurationAPI {
    delegateGetIconPath?: GetIconPath;
    delegateTurnForNode?: GetTurnForNode;
    delegateCostForNode?: GetCostForNode;
    canPurchaseNode?: CanPurchaseNode;
    flipColumns?: boolean;
    flipRows?: boolean;
}
export interface TreeGridConfiguration extends TreeGridConfigurationAPI {
    direction: TreeGridDirection;
    activeTree?: ProgressionTreeType;
    extraRows?: number;
    extraColumns?: number;
    originRow?: number;
    originColumn?: number;
    treeType?: TreeGridSourceType;
}
export declare enum TreeGridSourceType {
    ATTRIBUTES = 0,
    TECHS = 1,
    CULTURE = 2
}
export declare class TreeGrid implements TreeGridConfigurationAPI {
    private _player;
    private _sourceProgressionTree;
    private _treeData;
    private _grid;
    private _lines;
    private _direction;
    private _activeTree;
    private _extraColumns;
    private _extraRows;
    private _originRow;
    private _originColumn;
    private _collisionOffsetPX;
    private treeType;
    private targetRows;
    private targetColumns;
    delegateGetIconPath?: GetIconPath;
    delegateTurnForNode?: GetTurnForNode;
    delegateCostForNode?: GetCostForNode;
    canPurchaseNode?: CanPurchaseNode;
    flipColumns?: boolean;
    flipRows?: boolean;
    private currentResearching;
    private queuedElements;
    private prerequisiteQueue;
    constructor(progressTreeType: ProgressionTreeType, configuration?: TreeGridConfiguration);
    initialize(): void;
    updateLines(): void;
    get grid(): GridCard[][];
    get lines(): GridCardLine[];
    private generateData;
    private generateLayoutData;
    private generateLinesData;
    getCard(type: ProgressionTreeNodeType | undefined): TreeGridCard | undefined;
    private getVerticalOffsets;
    private generateGrid;
    private generateCollisionData;
    /**
     * Helper to evaluate if we show the available visual state on a card based on a node state
     * @param state
     * @returns
     */
    private isAvailable;
    /**
     * Helper to evaluate if the card can be started based on node state
     * @param state
     * @returns
     */
    private canBegin;
    queueCardItems(nodeIndex: ProgressionTreeNodeType): void;
    setHoverItem(nodeIndex: ProgressionTreeNodeType): ProgressionTreeNodeType[] | undefined;
    clearHoverItems(): ProgressionTreeNodeType[];
    /**
     * Queues the prerequisite nodes for a given node
     * @param {ProgressionTreeNodeType} nodeIndex Id for the selected node
     * @returns
     */
    private queueItems;
    /**
     * Activates by sendRequest the next queue item
     */
    private activateQueueItems;
    private updateQueuePriorities;
    /**
     *  If true notifications for ChooseTech handler can be added and not automatically dismissed
     */
    canAddChooseNotification(): boolean;
    getLastAvailableNodeType(): string;
}
export {};
