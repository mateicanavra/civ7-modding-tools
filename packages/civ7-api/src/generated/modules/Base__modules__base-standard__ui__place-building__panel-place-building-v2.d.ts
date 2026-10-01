/**
 * @file panel-place-building-v2.ts
 * @copyright 2025, Firaxis Games
 * @description Displays all the useful information when attempting to place a building on a plot
 */
import Panel from "/core/ui/panel-support.js";
declare class PlaceBuildingPanelV2 extends Panel {
    private content;
    private subsystemFrame;
    private selectedDiv;
    private constructibleDetails;
    private minimizedDiv;
    private maximizedDiv;
    private footerContainer;
    private hideShowText;
    private hideShowTouchText;
    private hideShowHybridText;
    private requestCloseListener;
    private onTogglePlacementMinMaxListener;
    private onBuildingPlacementSelectedPlotChangedListener;
    private engineInputEventListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private onBuildingPlacementSelectedPlotChanged;
    private buildView;
    private buildMinimized;
    private buildMaximized;
    private toggleMinMax;
    private buildMainPanel;
    protected requestClose(): void;
    private onInterfaceModeChanged;
    private onTogglePlacementMinMax;
    private setHidden;
    private onEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-place-building-v2": ComponentRoot<PlaceBuildingPanelV2>;
    }
}
export {};
