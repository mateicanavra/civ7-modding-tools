/**
 * @file panel-build-queue.ts
 * @copyright 2020-2024, Firaxis Games
 * @description Displays the build queue for the selected city
 */
/**
 * Area for expanded city information.
 */
declare class PanelBuildQueue extends Component {
    private focusInListener;
    private focusOutListener;
    private navigateInputListener;
    private itemEngineInputListener;
    private itemFocusListener;
    private itemActivateListener;
    private activeDeviceChangeListener;
    private deleteButtonListener;
    private upButtonListener;
    private firstFocus;
    onAttach(): void;
    onDetach(): void;
    private onFocusCityViewEvent;
    private onFocusIn;
    private onFocusOut;
    private onItemEngineInput;
    private requestDelete;
    private requestMoveUp;
    private onNavigateInput;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    private onItemFocus;
    private onItemActivate;
    private onActiveDeviceChange;
    private updateItemsContainerHover;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-build-queue": ComponentRoot<PanelBuildQueue>;
    }
}
export {};
