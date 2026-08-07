import { FxsActivatable } from "/core/ui/components/index.js";
interface ProductionChooserAccordionSectionToggleEventDetail {
    isOpen: boolean;
}
export declare const ProductionChooserAccordionSectionToggleEventName = "production-chooser-accordion-section-toggle";
export declare class ProductionChooserAccordionSectionToggleEvent extends CustomEvent<ProductionChooserAccordionSectionToggleEventDetail> {
    constructor(detail: ProductionChooserAccordionSectionToggleEventDetail);
}
export declare class ProductionChooserAccordionSection {
    readonly id: string;
    readonly title: string;
    readonly root: HTMLDivElement;
    readonly slot: HTMLDivElement;
    private readonly slotWrapper;
    readonly header: ComponentRoot<FxsActivatable>;
    readonly arrowIcon: HTMLDivElement;
    readonly sectionHeaderFocus: HTMLDivElement;
    private readonly resizeObserver;
    private readonly mutationObserver;
    accessor isOpen: boolean;
    constructor(id: string, title: string, isOpen: boolean);
    /** Track changes to the size while open */
    private observe;
    /**
     * Stop tracking size changes
     *
     * We do this because Gameface needs to check all elements that changed size to see if a particular resize observer matches,
     * so even if the element is not changing size, there is a performance cost
     *
     * NOTE: The mutation observer is not here because we need to always watch for new items to apply focus policy
     */
    private unobserve;
    /**
     * Completely stop observing changes for cleanup
     */
    disconnect(): void;
    private updateHeight;
    private applyTabIndexPolicyForNode;
    toggle(force?: boolean | undefined): void;
    open(): void;
    close(): void;
}
declare global {
    interface HTMLElementEventMap {
        [ProductionChooserAccordionSectionToggleEventName]: ProductionChooserAccordionSectionToggleEventDetail;
    }
}
export {};
