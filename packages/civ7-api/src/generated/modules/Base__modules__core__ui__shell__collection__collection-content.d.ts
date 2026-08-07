/**
 * @file collection-content.ts
 * @copyright 2020-2026, Firaxis Games
 * @description 2K Store launcher content.
 */
import Panel from "/core/ui/panel-support.js";
export declare class CollectionContent extends Panel {
    private promosRetrievalCompleteListener;
    private focusListener;
    private engineInputListener;
    private mainSlot;
    private selectedCard;
    private pendingContentSelection;
    private contentToCardLookup;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    setPendingContentSelection(contentType: string): void;
    getContent(): string;
    onAttach(): void;
    onDetach(): void;
    private updateNavTray;
    private onFocus;
    private realizeFocus;
    private onActivate;
    private showPromoLoadingSpinner;
    private hidePromoLoadingSpinner;
    private createItemCard;
    private createCards;
    private onEngineInput;
    private handleEngineInput;
    private updatePendingSelection;
    private onRedeemButtonActivate;
}
