/**
 * tree-grid.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Contains tree data for models to use.
 */
import { FxsScrollableHorizontal } from "/core/ui/components/fxs-scrollable-horizontal.js";
import { FxsScrollable } from "/core/ui/components/fxs-scrollable.js";
import { Graph } from "/core/ui/graph-layout/graph.js";
import { NavigateInputEvent } from "/core/ui/input/input-support.js";
export interface GridCard {
    column: number;
    row: number;
}
export interface GridCardLine {
    from: ProgressionTreeNodeType;
    to: ProgressionTreeNodeType;
    locked: boolean;
    dummy: boolean;
    level: number;
    position: number;
    direction: LineDirection;
    aliasTo?: string;
    aliasFrom?: string;
    collisionOffset?: number;
}
export declare enum LineDirection {
    UP_LINE = 0,
    SAME_LEVEL_LINE = 1,
    DOWN_LINE = 2
}
export interface TreeGridCard extends GridCard {
    nodeType: ProgressionTreeNodeType;
    name: string;
    icon: string;
    description: string;
    cost?: number;
    progress?: number;
    progressPercentage: number;
    turns: number;
    queueOrder: string;
    currentDepthUnlocked: number;
    maxDepth: number;
    repeatedDepth: number;
    unlocks: NodeUnlockDisplayData[];
    unlocksByDepth?: TreeGridDepthInfo[];
    unlocksByDepthString: string;
    nodeState: ProgressionTreeNodeState;
    canBegin: boolean;
    isAvailable: boolean;
    isCurrent: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    isRepeatable: boolean;
    isQueued: boolean;
    isHoverQueued: boolean;
    isDummy: boolean;
    treeDepth: number;
    connectedNodeTypes: ProgressionTreeNodeType[];
    hasData: boolean;
    canPurchase: boolean;
    isContent: boolean;
    lockedReason?: string;
    queuePriority?: number;
}
export interface TreeGridData {
    rows: number;
    dataHeight: number;
    layoutHeight: number;
    columns: number;
    dataWidth: number;
    layoutWidth: number;
    extraRows: number;
    extraColumns: number;
    originRow: number;
    originColumn: number;
    graphLayout: Graph;
    horizontalCardSeparation: number;
    verticalCardSeparation: number;
    nodesAtDepth: ProgressionTreeNodeType[][];
    cards: TreeGridCard[];
}
export interface TreeGridDepthInfo {
    header: string;
    unlocks: NodeUnlockDisplayData[];
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    depthLevel: object[];
    iconURL: string;
}
export declare enum TreeGridDirection {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export declare enum TreeClassSelector {
    CARD = "tree-card-selector"
}
interface ITreeCard {
    cardClass: TreeClassSelector;
}
export interface PanelContentElementReferences {
    root: HTMLElement;
    scrollable: ComponentRoot<FxsScrollableHorizontal> | ComponentRoot<FxsScrollable>;
    cardDetailContainer: HTMLDivElement;
    cardScaling: TreeCardScaleBoundary | null;
}
export declare class TreeCardBase extends Component implements ITreeCard {
    cardClass: TreeClassSelector;
    constructor(root: ComponentRoot);
}
export declare const UpdateLinesEventName: "update-tree-lines";
export declare class UpdateLinesEvent extends CustomEvent<never> {
    constructor();
}
export declare const ScaleTreeCardEventName: "scale-tree-card";
export declare class ScaleTreeCardEvent extends CustomEvent<{
    scale: number;
}> {
    constructor(scale: number);
}
export declare class TreeCardScaleBoundary {
    private currentGrid;
    private _currentCardScale;
    private MIN_SCALE;
    private MAX_SCALE;
    private linesContainer;
    private resizeEventListener;
    get currentCardScale(): number;
    set currentCardScale(value: number);
    constructor(container: HTMLElement, minScale?: number, maxScale?: number);
    private resetScale;
    private updateCardLines;
    private onResize;
    checkBoundaries(): void;
    removeListeners(): void;
}
export declare namespace TreeSupport {
    /**
     * Creates a grid element for a given tree from a model.
     * Static because access comes from model, not from instantiation.
     * @param tree
     * @param direction
     * @param createCardFn
     * @returns
     */
    function getGridElement(tree: string, direction: TreeGridDirection, createCardFn: (container: HTMLElement) => void): {
        scrollable: any;
        cardScaling: TreeCardScaleBoundary;
    } | {
        scrollable: any;
        cardScaling: null;
    };
    function isSmallScreen(): boolean;
}
export declare namespace TreeNavigation {
    namespace Horizontal {
        function onNavigateInput(navigationEvent: NavigateInputEvent): void;
    }
    namespace Vertical {
        function onNavigateInput(navigationEvent: NavigateInputEvent): void;
    }
}
export declare namespace TreeNodesSupport {
    /**
     *
     * @param unlocks List of unlock to filter out the unique units
     * @returns A collection of strings with the units that are supposed to replace a unit in the unlocks.
     */
    function getRepeatedUniqueUnits(unlocks: ProgressionTreeNodeUnlockDefinition[]): string[];
    function getUnlocksByDepthStateText(state: TreeGridDepthInfo): string;
    function getValidNodeUnlocks(nodeData: ProgressionTreeNode): ProgressionTreeNodeUnlockDefinition[];
}
export {};
