/**
 * @file panel-diplomacy-actions.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Displays and handles interactions with ongoing diplomatic actions and a history of diplomatic actions
 */
import { TabSelectedEvent } from "/core/ui/components/fxs-tab-bar.js";
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { InterfaceModeChangedEvent } from "/core/ui/interface-modes/interface-modes.js";
import { DiplomacyInputPanel } from "/base-standard/ui/diplomacy/diplomacy-manager.js";
declare enum PlayerDiplomacyType {
    LocalPlayerDiplomacy = 0,
    OtherPlayerDiplomacy = 1
}
export declare class DiplomacyActionPanel extends DiplomacyInputPanel {
    private interfaceModeChangedListener;
    private selectedPlayerChangedListener;
    private supportChangedListener;
    private viewReceiveFocusListener;
    private actionCanceledListener;
    private diplomacyEventEndedListener;
    private diplomacyQueueChangedListener;
    private gameCoreEventPlaybackCompleteListener;
    private populateInitialDataTimerListener;
    private onHandleWarSupportClosedListener;
    protected majorActionsSlot?: HTMLElement;
    private leaderNameElement?;
    private mementosHeaderElement?;
    private befriendIndependentDetails?;
    private civSymbol?;
    private diploTint?;
    private tabBar?;
    private tabItems;
    private panels;
    private slotGroup?;
    protected initialLoadComplete: boolean;
    protected firstFocusSection: HTMLElement | null;
    protected ongoingActionPageNumber: number;
    private needsRefresh;
    private infoTabIndex;
    private actionTabIndex;
    private relationshipTabIndex;
    private governmentTabIndex;
    private previousPlayer;
    private relationshipToolTip;
    private relationshipIcon;
    private previousPlayerIsMajor;
    private initDataPopulationTimerHandle;
    private render;
    private updateSelectedPlayerElements;
    protected populateInitialData(): void;
    /**
     * Refresh all data (warning: VERY expensive!)
     */
    private refreshFullData;
    /**
     * Refresh dynamic data (expensive!)
     */
    protected refreshPartialData(): void;
    onAttach(): void;
    protected startInitDataPopulationTimer(): void;
    onDetach(): void;
    private onPopulateInitialDataTimerFinished;
    handleInput(inputEvent: InputEngineEvent): boolean;
    private trySupportBefriendIndependent;
    private tryBefriendIndependentShowTooltips;
    handleNavigation(navigateInput: NavigateInputEvent): boolean;
    private onViewReceiveFocus;
    protected realizeNavTray(): void;
    protected populateOngoingProjects(): void;
    private createOngoingActionItem;
    /**
     * This says "action", (at base game) the only actions are war support.
     * @param actionID
     */
    protected clickOngoingAction(actionID: DiplomacyActionEventId): void;
    /**
     * Signaled when the war support popup dialog has been dismissed.
     */
    private onHandleWarSupportClosed;
    protected refreshTabItems(playerObject: PlayerLibrary, isLocal: PlayerDiplomacyType): void;
    protected populatePlayerCivInfo(): void;
    protected populateGovernmentInfo(): void;
    protected populateRelationshipInfo(): void;
    private createBorderedIcon;
    private getRelationshipRow;
    private findOrCreateRelationshipRow;
    setOngoingActionsScrollablePosition(): void;
    protected onCollapseActionSection(collapseButton: HTMLElement, actionsContainer: HTMLElement): void;
    protected populateActionsPanel(): void;
    protected createWarInfoElement(war: DiplomaticEventHeader): HTMLElement;
    protected onOptionsTabSelected(e: TabSelectedEvent): void;
    protected onInterfaceModeChanged(event: InterfaceModeChangedEvent): void;
    protected onSelectedPlayerChanged(): void;
    protected realizeInitialFocus(): void;
    private onActionCanceled;
    /**
     * Handler to be overrdien in child classes for updates in response to a support change.
     * @param _actionData
     * @returns true if updates occurred, false if nothing changed.
     */
    protected supportChangedHandler(_actionData: DiplomaticEventHeader): boolean;
    /**
     * Support has changed from the players.
     * @param event Gamecore event data
     */
    protected onSupportChanged(event: DiplomacyEventSupportChanged_EventData): void;
    private onDiplomacyEventEnded;
    private onDiplomacyQueueChanged;
    private onGameCoreEventPlaybackComplete;
    private checkRefesh;
    /**
     * Check if we are in the proper state to show this panel
     * @returns true if panel should be shown, false otherwise.
     */
    protected checkShouldShowPanel(): boolean;
    protected showLeaderModel(): void;
    protected getCostFromTargetList(projectData: DiplomaticProjectUIData): number;
    protected getTargetPlayerFromTargetList(projectData: DiplomaticProjectUIData): PlayerLibrary | null;
    protected refreshActionPanel(): void;
    protected createStartActionListItem(projectData: DiplomaticProjectUIData, recentlyCompletedData?: RecentDiplomaticActions): HTMLElement;
    private clickStartActionItem;
    private clickQuickStartActionItem;
    protected populateAvailableActions(): void;
    protected close(): void;
    protected showBefriendIndependentDetails(): void;
}
export {};
