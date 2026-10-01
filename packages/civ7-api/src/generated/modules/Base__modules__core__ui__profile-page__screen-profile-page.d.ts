/**
 * @file screen-profile-page.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Show the player's online progression
 */
import { DropdownItem } from "/core/ui/components/fxs-dropdown.js";
import { NavigateInputEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
import { LeaderButton } from "/core/ui/shell/leader-select/leader-button/leader-button.js";
export declare enum ProfileTabType {
    NONE = -1,
    PROGRESS = 0,
    CHALLENGES = 1,
    CUSTOM = 2
}
type EventDropdownItem = DropdownItem & {
    id: string;
};
export declare const ScreenProfilePageExternalStatus: {
    isGameCreationDomainInitialized: boolean;
};
export declare class ScreenProfilePage extends Panel {
    private closeButtonListener;
    private engineInputListener;
    private navigationInputListener;
    private progressLeaderSelectedListener;
    private challengeTabSelectedListener;
    private challengeLeaderSelectedListener;
    private challengeSortLeftListener;
    private challengeSortRightListener;
    private badgeSelectListener;
    private bannerSelectListener;
    private titleSelectListener;
    private borderSelectListener;
    private colorSelectListener;
    private leaderButtonListener;
    private leaderFocusListener;
    private challengeTabItems;
    private challengeGroups;
    private slotGroup?;
    private challengesSlotGroup?;
    private prevFocus;
    private currentChallengeCategoryToShow;
    private challengeCategoriesMap;
    private challengesMap;
    private onlyChallenges;
    private focusTab;
    private noCustomize;
    private currentSortType;
    private currentChallengeGroup;
    private currentHOFGroup;
    private currentlySelectedMainTab;
    private currentlySelectedCustomizeTab;
    private sortTextLocale;
    private cardInfo;
    private progressRightScrollable?;
    private readonly challengeSortHslot;
    private cancelRewardsUpdate;
    private rewardsUpdateBusy;
    private readonly isOfflineMemento;
    private readonly isMobile;
    private panelOptions;
    private selectedLeaderEle?;
    /**
     * currentProfile is the user profile we retrived after lauching the game
     */
    readonly currentProfile: DNAUserProfile;
    eventItems: EventDropdownItem[];
    /**
     * Store the local changes of player profile
     */
    selectedBannerId: any;
    selectedBadgeId: any;
    selectedTitleLocKey: any;
    selectedPortraitBorder: any;
    selectedBackgroundColor: any;
    get didChangeUserProfile(): boolean;
    getIndexByEventName(eventName: string): number;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    setPanelOptions(options: object): void;
    private generalNavTrayUpdate;
    private setupProgressUI;
    private focusLeaderHandler;
    private selectLeaderHandler;
    private selectLeader;
    private onClickedProgressLeaderButton;
    private refreshProgressRewards;
    private generateRewardsList;
    private waitRewardsReady;
    private populateRewards;
    private setupCustomizeUI;
    private onClickedMarkAllAsSeen;
    private onClickedBadge;
    private updateBadgeDisplay;
    private onClickedBanner;
    private updateBannerDisplay;
    private onClickedTitle;
    private updateTitleDisplay;
    private onClickedBorder;
    private updateBorderDisplay;
    private onClickedColor;
    private updateColorDisplay;
    private changeSelectionHighlight;
    private updateLockEquipStatus;
    private setupChallengeUI;
    private challengeSortLeft;
    private challengeSortRight;
    private setChallengeSortType;
    private onChallengeTabSelected;
    private onChallengeCategorySelected;
    private createContents;
    private getLastSaveLeaderID;
    private addChallenge;
    private getFoundationLevel;
    private updateProfile;
    private onEngineInput;
    protected onNavigateInput(navEvent: NavigateInputEvent): void;
    private buildChallengesRightScrollableContainer;
    private buildCategoryChallengesList;
    /**
     * Builds the current selected challenge UI cards for the currently selected challenge tab.
     * If sortChallenges is set to true, it will only rebuild the challenge container with the challenges
     * in the current category (useful for refreshing the challenges when sorting)
     */
    private buildChallengesContainer;
    private updateChallengesTab;
    private sortChallengeList;
    private sortChallengeCategories;
}
interface ScreenProfileLeaderData {
    leaderID: string;
    name: string;
    icon: string;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    prevLevelXp: number;
    index: number;
}
declare class ScreenProfileLeaderButton extends LeaderButton {
    private _screenProfileLeaderData?;
    set screenProfileLeaderData(leaderData: ScreenProfileLeaderData);
    get screenProfileLeaderData(): ScreenProfileLeaderData | undefined;
    protected updateLeaderData(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-profile-leader-button": ComponentRoot<ScreenProfileLeaderButton>;
    }
}
export {};
