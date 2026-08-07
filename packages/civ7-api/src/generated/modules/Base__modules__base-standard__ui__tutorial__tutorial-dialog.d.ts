/**
 * @file tutorial-dialog.ts
 * @copyright 2021-2025, Firaxis Games
 * @description A dialog box (not the popular "callout") that is used to show (paginated) tutorial content.
 */
import Panel from "/core/ui/panel-support.js";
interface LowerDialogEventDetail {
    itemID: string;
}
declare class LowerTutorialDialogEvent extends CustomEvent<LowerDialogEventDetail> {
    constructor(itemID: string);
}
declare class TutorialDialogPanel extends Panel {
    private nextButton;
    private previousButton;
    private pageCounter;
    private itemID;
    private page;
    private lastPage;
    private pages;
    private radioButtons;
    private pagesReady;
    private tutorialDialogPageReadyListener;
    private activeDeviceTypeListener;
    private navigateInputListener;
    private engineInputListener;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private updateInteract;
    onLoseFocus(): void;
    private setButtonVisible;
    private onActiveDeviceTypeChanged;
    close(): void;
    private open;
    private initializePages;
    private updatePreviousButtonState;
    private onPreviousPage;
    private onNextPage;
    private onNavigateInput;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    private onEngineInput;
    private realize;
    private onPageReady;
}
declare global {
    interface HTMLElementTagNameMap {
        "tutorial-dialog": ComponentRoot<TutorialDialogPanel>;
    }
    interface WindowEventMap {
        "lower-tutorial-dialog-event": LowerTutorialDialogEvent;
    }
}
export {};
