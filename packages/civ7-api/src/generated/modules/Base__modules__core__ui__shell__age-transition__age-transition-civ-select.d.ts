/**
 * @file age-transition-civ-select.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Allows the player to select a new civilization between era transitions
 */
import Panel from "/core/ui/panel-support.js";
declare class AgeTransitionCivSelect extends Panel {
    private readonly isMobileViewExperience;
    private civData;
    private ageMap;
    private cardsPanel;
    private civCardsEle;
    private civCards;
    private civBonuses;
    private detailsPanel;
    private detailsPanelContainer;
    private detailsPanelBg;
    private civIcon;
    private civName;
    private civTraits;
    private civHistoricalChoice;
    private historicalChoiceText;
    private civLeaderIcon;
    private civAbilityTitle;
    private civAbilityText;
    private civBonusesScroll;
    private civBonusesContainer;
    private civLockIcon;
    private unlockByInfo;
    private chooseCivButton;
    private ageUnlockPanel;
    private ageUnlockItems;
    private civStepper;
    private leftStepperArrow;
    private rightStepperArrow;
    private civStepperButtons;
    private selectedCard?;
    private selectedCivInfo?;
    private isInDetails;
    private isProgressionShown;
    private engineInputEventListener;
    private navigateInputListener;
    private activeDeviceTypeListener;
    private ageTransitionCivSelectListener;
    constructor(root: ComponentRoot<AgeTransitionCivSelect>);
    onInitialize(): void;
    onReceiveFocus(): void;
    onAttach(): void;
    onDetach(): void;
    private onEngineInput;
    private onNavigateInput;
    private onActiveDeviceTypeChanged;
    private handleActiveDeviceTypeChanged;
    protected showProgression(): void;
    private render;
    protected renderHeader(container: HTMLElement): void;
    private renderCards;
    private renderDetails;
    private renderStepper;
    private updateDetails;
    private handleNavTo;
    private handleNavNext;
    private handleNavPrev;
    private handleCardSelected;
    private onAgeTransitionCivSelect;
    private openAdditionalInfoPanel;
    private closeAdditionalInfoPanel;
    private startGame;
    private openMementoEditor;
}
export { AgeTransitionCivSelect as default };
