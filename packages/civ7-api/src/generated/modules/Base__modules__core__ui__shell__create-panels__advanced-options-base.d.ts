/**
 * @file advanced-options-base.ts
 * @copyright 2025-2026, Firaxis Games
 * @description Base class for single and multi player advanced setup screens
 */
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { AdvancedOptionsParameter } from "/core/ui/shell/create-panels/game-creation-options.js";
import { GameCreationNavButtonInfo, GameCreationPanelBase } from "/core/ui/shell/create-panels/game-creation-panel-base.js";
export declare class AdvancedOptionsBase extends GameCreationPanelBase {
    static GAME_PANEL_ID: string;
    static PLAYER_PANEL_ID: string;
    static LEGACY_PATHS_PANEL_ID: string;
    private wasCompact;
    protected frame: HTMLElement;
    protected headerText: string;
    protected readonly setupSlotGroup: any;
    protected gameSetupPanel: any;
    protected legacyPathSetupPanel: any;
    protected saveConfigAttributes: {
        "menu-type": string;
        "server-type": any;
        "save-type": any;
    };
    protected loadConfigAttributes: {
        "menu-type": string;
        "server-type": any;
        "save-type": any;
    };
    protected showSaveScreenListener: any;
    protected showLoadScreenListener: any;
    protected onConfirmButtonPressedListener: any;
    private onWindowResizeListener;
    private tooltipElements;
    protected confirmButton: any;
    protected gameParamEles: HTMLElement[];
    private gameOptionsHeaders;
    private LegacyPathsParameterID;
    private groupContainers;
    protected activeGameParameters: any;
    protected groupNames: any;
    protected currentSlotIndex: number;
    protected slotIDs: string[];
    protected activePanel: HTMLElement;
    protected navControlButtonInfo: GameCreationNavButtonInfo[];
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    protected createTopNav(): HTMLElement;
    protected createBottomNav(): HTMLElement;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    protected setupNavTray(): void;
    onEngineInput(event: InputEngineEvent): void;
    onActiveDeviceTypeChanged(): void;
    protected createGameSetupPanel(panelId: string): void;
    protected createLegacyPathSetupPanel(panelId: string): void;
    protected createParamEleLabel(setupParam: GameSetupParameter, paramEle: HTMLElement): any;
    protected goToNewPanel(panel: HTMLElement): void;
    protected showGameSetupPanel(): void;
    protected showLegacyPathSetupPanel(): void;
    protected updateFocus(): void;
    private showSaveScreen;
    private showLoadScreen;
    onNavigateInput(navigationEvent: NavigateInputEvent): void;
    protected refreshGameOptions(): void;
    protected resolveParamGroup(param: GameSetupParameter): any;
    protected resetToDefaults(): void;
    private onResize;
    private updateTooltipPosition;
    private updateFrame;
    protected getOptionFromParam(param: GameSetupParameter): AdvancedOptionsParameter;
    protected onResetConfirmed(): void;
    protected onConfirmButtonPressed(): void;
    protected onUpdate(): void;
    protected getTabContainerForParam(param: GameSetupParameter): HTMLElement;
}
