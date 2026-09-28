import { TabItem } from "/core/ui/components/fxs-tab-bar.js";
import Panel from "/core/ui/panel-support.js";
export declare const ShowCityDetailsEventName: "show-city-details";
interface ShowCityDetailsEventDetail {
    shouldShow: "toggle" | boolean;
}
export declare class ShowCityDetailsEvent extends CustomEvent<ShowCityDetailsEventDetail> {
    constructor(detail: ShowCityDetailsEventDetail);
}
export declare const CityDetailsClosedEventName: "city-details-closed";
export declare class CityDetailsClosedEvent extends CustomEvent<void> {
    constructor();
}
export type CityDetailsTabItem = TabItem & {
    headerText: string;
};
export declare const AddTabItemEventName: "add-panel-city-details-tab";
interface AddTabItemEventDetail {
    tabItem: CityDetailsTabItem;
}
export declare class AddTabItemEvent extends CustomEvent<AddTabItemEventDetail> {
    constructor(detail: AddTabItemEventDetail);
}
export declare class PanelCityDetails extends Panel {
    private readonly frame;
    private readonly headerElement;
    private readonly tabHeaderElement;
    private readonly tabBar;
    private readonly slotGroup;
    private readonly prevCityButton;
    private readonly nextCityButton;
    private growthSlot;
    private growthBarContainer;
    private growthBarNext;
    private growthBarCurrent;
    private growthTurnsText;
    private growthBreakdown;
    private urbanPopCount;
    private ruralPopCount;
    private specialistCount;
    private specialistContainer;
    private specialistText;
    private currentCitizenCount;
    private happinessStatusText;
    private happinessBoundaryText;
    private happinessIcon;
    private happinessPerTurn;
    private foodPerTurn;
    private foodNeededToGrow;
    private connectedToContainer;
    private connectionsSubtitle;
    private connectionsExport;
    private connectionsList;
    private constructibleSlot;
    private buildingsCategory;
    private buildingsList;
    private improvementsCategory;
    private improvementsList;
    private improvementsCollapseAllContainter;
    private improvementsCollapseAll;
    private improvementsCollapseAllText;
    private improvementsHeader;
    private improvementsWarehouseIcon;
    private wondersCategory;
    private wondersList;
    private yieldsSlot;
    private yieldsContainer;
    private beingRazedContainer;
    private razedTurnsText;
    private treasureFleetContainer;
    private treasureFleetText;
    private readonly LANDMARK_BORDER_STYLE;
    private readonly HIGHLIGHT_BORDER_STYLE;
    private landmarkOverlayGroup;
    private landmarkOverlay;
    private highlightOverlay;
    private engineInputListener;
    private inputContextChangedListener;
    private updateCityDetailersListener;
    private onNextCityButtonListener;
    private onPrevCityButtonListener;
    private onCollapseAllImprovementsListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onPrevCityButton;
    private onNextCityButton;
    private onTabSelected;
    private onEngineInput;
    private handleEngineInput;
    private onInputContextChanged;
    private selectPrevCity;
    private selectNextCity;
    private onFocus;
    private onAddTabItemEvent;
    private onShowCityDetailsEvent;
    protected requestClose: () => void;
    private toggleClose;
    private setHidden;
    private render;
    private renderGrowthSlot;
    private renderBuildingSlot;
    private renderYieldsSlot;
    update(): void;
    private addConnectedToEntry;
    private updateYields;
    private getValueFormat;
    private addTopYieldButton;
    private addChildYieldButton;
    private disposeTooltips;
    private addProductionTooltip;
    private addWarehouseBreakdownTooltip;
    private addDistrictData;
    protected updateCollapseAll(collapseButton: HTMLElement, collapseText: HTMLElement, sectionCollapse: HTMLElement): void;
    protected onCollapseAllSection(collapseButton: HTMLElement, collapseText: HTMLElement, sectionCollapse: HTMLElement): void;
    protected onCollapseAllImprovements(): void;
    protected onCollapseImprovementSection(collapseButton: HTMLElement, listContainer: HTMLElement, collapseAllButton: HTMLElement, collapseAllText: HTMLElement, sectionCollapse: HTMLElement, playSound?: boolean): void;
    private addImprovementEntry;
    private addImprovementPlotEntry;
    private addConstructibleData;
    private mouseOverBuildingListener;
    private mouseOutBuildingListener;
    private focusBuildingListener;
    private focusOutBuildingListener;
    private activateBuildingListener;
    private onMouseOverBuilding;
    private onMouseOutBuilding;
    private onFocusBuilding;
    private onFocusOutBuilding;
    private activateBuilding;
    private addBuildingHighlight;
    private removeBuildingHighlight;
    private createDivider;
}
export {};
