/**
 * @file panel-diplo-ribbon.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Houses the players' portraits and stats and start of diplomatic interactions
 */
import Panel from "/core/ui/panel-support.js";
declare class DiploFakeContext extends Panel {
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-diplo-ribbon-fake": ComponentRoot<DiploFakeContext>;
    }
}
export declare class PanelDiploRibbon extends Panel {
    private numLeadersToShow;
    private panArrows;
    private activeDeviceTypeListener;
    private interfaceModeChangedListener;
    private inputContextChangedListener;
    private userOptionChangedListener;
    private attributePointsUpdatedListener;
    private engineInputListener;
    private navigateInputListener;
    private yieldsItemListener;
    private leadersLeftListener;
    private leadersRightListener;
    private windowResizeListener;
    private refreshDataListener;
    private bannerUpdateListener;
    private civFlagEngineInputListener;
    private engineCaptureAllInputListener;
    private mainContainer;
    private toggleNavHelp;
    private navHelpLeft;
    private navHelpRight;
    private isHoverAll;
    private topContainer;
    private civFlagFlexboxPartOne;
    private toggleNavHelpContainer;
    private diploContainer;
    private attributeButton;
    private diploRibbons;
    private firstLeaderIndex;
    private techCivicPopupVisibilityListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    /**
     * Is the diplomacy ribbon in a state where it can take focus from a gamepad?
     * @returns
     */
    private canTakeGamepadFocus;
    private realizeNavHelp;
    private onActiveDeviceTypeChanged;
    private onWindowResize;
    private populateFlags;
    private onModelUpdate;
    /**
     * TODO: Move this check as a method off of the Diplomacy Manager so it can return true for any variety of modes.
     * @returns If showing the ribbon as part of the diplomacy mdoe.
     */
    private isInDiplomacyMode;
    /**
     * Update the banners.
     * This may occur for a variety of events such as being toggled, scrolled, etc...
     */
    private onUpdateBanners;
    private scrollLeadersLeft;
    private scrollLeadersRight;
    /**
     * Obtain index of the selected leader.
     * @returns Index of the selected leader or -1 if error.
     */
    private getCurrentLeaderIndex;
    private refreshRibbonVis;
    private displayRibbonDetails;
    private hideRibbonDetails;
    private onEngineCaptureAllInput;
    private handleEngineCaptureAllInput;
    private onCivFlagEngineInput;
    private handleCivFlagEngineInput;
    private onEngineInput;
    private onNavigateInput;
    private onShowPlayerYieldReport;
    private attachAttributeButton;
    private updateAttributeButton;
    private onAttributePointsUpdated;
    private clickAttributeButton;
    private onInterfaceModeChanged;
    private refreshState;
    private onInputContextChanged;
    /**
     * Player toggled options, this may have included always showing the ribbon so re-evaluate
     */
    private onUserOptionChanged;
    private techCivicPopupVisibility;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-diplo-ribbon": ComponentRoot<PanelDiploRibbon>;
    }
}
export {};
