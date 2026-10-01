import Panel from "/core/ui/panel-support.js";
export declare enum UnitActionCategory {
    NONE = 0,
    MAIN = 1,
    COMMAND = 2,
    HIDDEN = 3
}
/**
 * An individual unit operation or command.
 */
export interface UnitAction {
    name: string;
    callback: Function;
    type: string;
    icon?: string;
    annotation?: string;
    requireConfirm: boolean;
    confirmTitle?: string;
    confirmBody?: string;
    active: boolean;
    UICategory: UnitActionCategory;
    priority: number;
    chargesLeft?: number;
    hotkeyId?: string;
    targetPlayer?: PlayerId;
}
declare class UnitActions extends Panel {
    private unitId;
    private isCommander;
    private isInArmy;
    private shelfButton;
    private shelfButtonIcon;
    private animTimer;
    static readonly ANIM_DELAY: number;
    private isSubscribed;
    private _currentState;
    private mainContainer;
    private panelDecor;
    private actions;
    private standardContainer;
    private commanderContainer;
    private hiddenContainer;
    private standardActions;
    private commandActions;
    private hiddenActions;
    private standardActionElements;
    private commandActionElements;
    private hiddenActionElements;
    private unitNameDiv;
    private unitNameFiligreeContainer;
    private commanderNameDiv;
    private commanderBannerContainer;
    private commanderLevelValue;
    private commanderXPMeter;
    private portraitContainer;
    private portraitImage;
    private identifierRow;
    private actionRowSpacer;
    private originCityNameDiv;
    private originCityContainer;
    private healthValueDiv;
    private unitHealthbar;
    private moveValueDiv;
    private unitStatsContainer;
    private portraitStatsRow;
    private statInstances;
    private statDividers;
    private commanderNameEditButton;
    private commanderInfoContainer;
    private commanderRenameElement;
    private readonly MEDIUM_HEALTH_THRESHHOLD;
    private readonly LOW_HEALTH_THRESHHOLD;
    private toggleShelfNavHelpContainer;
    private toggleShelfNavHelp;
    private unitCycleNavHelpContainer;
    private unitCycleNavHelp;
    private unitNavHelpWorldAnchorHandle;
    private dialogId;
    private unitReselectedListener;
    private onGlobalShowListener;
    private onGlobalHideListener;
    private onViewReceiveFocusListener;
    private onUnitHotkeyListener;
    private onEngineInputListener;
    private inputContextChangedListener;
    private onNavigateListener;
    private shelfFocusoutListener;
    private shelfFocusInListener;
    private shelfToggleListener;
    private onCommanderEditPressedListener;
    private infoContainerEngineInputListener;
    private onCommanderNameConfirmedListener;
    private onCommanderNameHideStatusToggledListener;
    private readonly raiseUnitSelectionListener;
    private readonly lowerUnitSelectionListener;
    get isCyclable(): boolean;
    constructor(root: ComponentRoot);
    static getIconsToPreload(): string[];
    private get currentState();
    /**
     * Set the visibility on a group of elements (by classname) guaranteeed to exist
     * @param isVisible true if made visibile, false for hidden
     * @param names Array of elements to toggle visibility.
     */
    private setElementsVisibility;
    private set currentState(value);
    onAttach(): void;
    onDetach(): void;
    onInitialize(): void;
    private onInputContextChanged;
    private getElements;
    private startup;
    private shutdown;
    private onUnitOperationUpdated;
    private updateFocusGate;
    private onDebugWidgetUpdated;
    private updateLayout;
    /**
     * @param unit the unit selected
     * @param data1 the value of (int) IsReadyToSelect(pkUnit)
     */
    private onUnitOperationDeactivated;
    /**
     * @param unit the unit selected
     * @param data1 always set to false atm
     */
    private onUnitOperationSegmentComplete;
    private switchToDefault;
    private shouldSwitchToDefaultAfterOperation;
    /**
     * Conforms to UnitSelectionListener
     */
    private onRaiseUnitSelection;
    /**
     * Conforms to UnitSelectionListener
     */
    private onLowerUnitSelection;
    private onPlayerTurnActivated;
    private onUnitMovementPointsChanged;
    /**
     * Update heath indicators now that combat has occurred.
     * @param data Details on the combat.
     */
    private onUnitDamageChanged;
    private onUnitReselected;
    private onGlobalHide;
    private onGlobalShow;
    private onViewReceiveFocus;
    private realizeFocus;
    private setupUnitInfo;
    private updateUnitCycleNavHelp;
    private addUnitCycleNavHelp;
    private addToggleShelfNavHelp;
    private addStat;
    private addStatDivider;
    private realizeButtons;
    private cleanupStats;
    private clearButtons;
    private updateMovement;
    private updateHealth;
    private getUnitActions;
    private getUnitAbilitiesForOperationOrCommand;
    private setupButtonSections;
    private sortActions;
    private onUnitHotkey;
    private createButtons;
    private createUnitActionButton;
    private createDeselectUnitAction;
    private setButtonData;
    private onButtonActivated;
    private onShelfFocused;
    private onShelfFocusout;
    private onActionChosen;
    private toggleShelfOpen;
    private updateShelf;
    private onCommanderEditPressed;
    private onInfoContainerEngineInput;
    private onCommanderNameConfirmed;
    private onCommanderNameHideStatusToggled;
    private findSelectedUnitAction;
    /**
     * Does a particular unit operation require a targetPlot if selected?
     * @param type Game core unit operation as string name.
     * @returns true if this operation requires a plot to be targeted before exectuing.
     */
    private isTargetPlotOperation;
    private getUnitActionCategory;
    private onEngineInput;
    private onNavigateInput;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
}
declare global {
    interface HTMLElementTagNameMap {
        "unit-actions": ComponentRoot<UnitActions>;
        "unit-action-button": ComponentRoot<Component>;
    }
}
export declare class UnitActionsPanelModelImpl {
    private _isShelfOpen;
    get isShelfOpen(): boolean;
    set isShelfOpen(value: boolean);
}
export declare const UnitActionsPanelModel: UnitActionsPanelModelImpl;
export {};
