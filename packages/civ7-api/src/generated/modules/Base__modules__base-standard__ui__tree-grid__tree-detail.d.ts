import { TreeGridDepthInfo } from "/base-standard/ui/tree-grid/tree-support.js";
export declare class TreeDetail extends Component {
    private readonly nameContainer;
    private readonly lockedOverlay;
    private readonly lockedOverlayText;
    private readonly stateText;
    private readonly descriptionContainer;
    private readonly unlocksContainer;
    private readonly scrollableContent;
    readonly scrollable: any;
    private readonly progressContainer;
    private readonly nodeIcon;
    private readonly ringMeter;
    private readonly turnContainer;
    private readonly chooserItem;
    private readonly chooserContainer;
    private readonly ringContent;
    private readonly repeatedCount;
    private readonly costContainer;
    get type(): number;
    get name(): string;
    get cost(): number;
    get costIcon(): string;
    get lockedReason(): string;
    get hasLockedReason(): boolean;
    get level(): number;
    get progress(): string;
    get turns(): number;
    get icon(): string;
    get detailed(): boolean;
    get repeated(): number;
    get unlocksByDepth(): TreeGridDepthInfo[];
    onInitialize(): void;
    private render;
    private readonly updateCostsUpdateGate;
    private updateCost;
    private readonly updateDetailedUpdateGate;
    private updateDetailed;
    private readonly updateUnlocksUpdateGate;
    private updateUnlocks;
    private readonly updateProgressUpdateGate;
    private updateProgress;
    private readonly updateDetailImageUpdateGate;
    private updateDetailImage;
    onAttributeChanged(name: string, _oldValue: string, _newValue: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "tree-detail": ComponentRoot<TreeDetail>;
    }
}
