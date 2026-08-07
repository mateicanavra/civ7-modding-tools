/**
 * @file create-game-nav-model.ts
 * @copyright 2024, Firaxis Games
 * @description Model for game creation navigation info
 */
import { AgeData, CivData } from "/core/ui/shell/create-panels/age-civ-select-model.js";
import { ICreationPanelInfo } from "/core/ui/shell/create-panels/game-creator-types.js";
import { LeaderData } from "/core/ui/shell/create-panels/leader-select-model.js";
declare class CreateGameModelImpl {
    private _categories;
    private openPanel;
    private currentPanelIndex;
    private createGameRoot;
    private panelList;
    private currentBackground?;
    private _isFirstTimeCreateGame;
    private _gameStartingEvent;
    private _selectedLeader?;
    private _selectedAge?;
    private _selectedCiv?;
    get categories(): string[];
    get activeCategory(): string | undefined;
    private get currentPanel();
    get selectedLeader(): LeaderData | undefined;
    set selectedLeader(value: LeaderData | undefined);
    get selectedAge(): AgeData | undefined;
    set selectedAge(value: AgeData | undefined);
    get selectedCiv(): CivData | undefined;
    set selectedCiv(value: CivData | undefined);
    get isLastPanel(): boolean;
    get nextActionStartsGame(): boolean;
    get isFirstTimeCreateGame(): boolean;
    set isFirstTimeCreateGame(value: boolean);
    get gameStartingEvent(): LiteEvent<void>;
    getAgeBackgroundName(ageId: string): string;
    getCivBackgroundName(civId: string): string;
    onInviteAccepted(): void;
    isCurrentPanel(name: string): boolean;
    showPanelByName(name: string): void;
    showPanelFor(category: string): void;
    showNextPanel: (opts?: {
        skip: string;
    }) => void;
    showPreviousPanel: () => void;
    setCreateGameRoot(element: HTMLElement | null): void;
    setPanelList(panelList: ICreationPanelInfo[]): void;
    startGame(): void;
    setBackground(background?: string, forceDisplay?: boolean): void;
    launchFirstPanel(): void;
    private popPanel;
    private showPanel;
}
export declare const CreateGameModel: CreateGameModelImpl;
export {};
