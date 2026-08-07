/**
 * @file game-creation-panel-base.ts
 * @copyright 2020-2025, Firaxis Games
 * @description Base class for most game creation panels
 */
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
export interface GameCreationNavButtonInfo {
    category: string;
    isActive: boolean;
    eventHandler: () => void;
}
export declare class GameCreationPanelBase extends Panel {
    protected navControls: HTMLElement;
    protected navControlTabs: HTMLElement[];
    protected mainContent: HTMLElement;
    protected detailContent: HTMLElement;
    protected randomLeaderContent: HTMLElement;
    protected bottomBarEle: HTMLElement;
    protected readonly confirmButton: any;
    protected leaderBox: HTMLElement | null;
    protected leaderBoxLeader: HTMLElement | null;
    protected leaderBoxLeaderToAge: HTMLElement | null;
    protected leaderBoxAge: HTMLElement | null;
    protected leaderBoxLeaderToCiv: HTMLElement | null;
    protected leaderBoxCiv: HTMLElement | null;
    protected quoteSubtitles: HTMLElement | null;
    protected isProgressionShown: boolean;
    protected isNavigationEnabled: boolean;
    private activeDeviceTypeListener;
    private navigateInputListener;
    private engineInputListener;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    protected onNavigateInput(navigationEvent: NavigateInputEvent): void;
    protected onEngineInput(event: InputEngineEvent): void;
    protected showProgression(): void;
    protected onActiveDeviceTypeChanged(): void;
    protected createFiligreeFragment(): any;
    protected createLayoutFragment(includeHeader: boolean): any;
    protected createNavControls(options: GameCreationNavButtonInfo[]): HTMLElement;
    protected createHeader(): any;
    protected buildNavButton(options: GameCreationNavButtonInfo): any;
    protected buildBottomNavBar(randomSelectCallback?: () => void): HTMLElement;
    protected updateNavTray(): void;
    protected buildLeaderBox(): any;
    protected updateLeaderBox(): void;
    protected showQuoteSubtitles(): void;
    protected hideQuoteSubtitles(): void;
    protected showPanelFor(category: string): void;
    protected showNextPanel(): void;
    protected onContinue(): boolean;
    protected disableNavigation(): void;
    protected enableNavigation(): void;
    protected showStoreScreen(contentType: string | undefined): void;
}
