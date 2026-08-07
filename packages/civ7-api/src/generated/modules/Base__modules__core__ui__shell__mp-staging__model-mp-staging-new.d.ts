/**
 * @file model-mp-staging-new.ts
 * @copyright 2023-2026, Firaxis Games
 * @description Multiplayer lobby screen data mdoel.
 */
import { DropdownSelectionChangeEvent } from "/core/ui/components/fxs-dropdown.js";
import { IconDropdownItem } from "/core/ui/shell/shell-components/icon-dropdown.js";
export declare enum MPLobbyReadyStatus {
    INIT = "INIT",
    NOT_READY = "NOT_READY",
    WAITING_FOR_OTHERS = "WAITING_FOR_OTHERS",
    STARTING_GAME = "STARTING_GAME",
    WAITING_FOR_HOST = "WAITING_FOR_HOST"
}
export declare enum PlayerParamDropdownTypes {
    PLAYER_SLOT_ACTION = "PLAYER_SLOT_ACTION",
    PLAYER_TEAM = "PLAYER_TEAM",
    PLAYER_CIV = "PLAYER_CIV",
    PLAYER_LEADER = "PLAYER_LEADER",
    PLAYER_MEMENTO = "PLAYER_MEMENTO"
}
export interface MPLobbyPlayerData {
    playerID: string;
    isHost: boolean;
    isLocal: boolean;
    statusIcon: string;
    statusIconTooltip: string;
    isReady: boolean;
    platformIcon: string;
    platformIconTooltip: string;
    leaderPortrait: string;
    leaderName: string;
    foundationLevel: number;
    badgeURL: string;
    backgroundURL: string;
    playerTitle: string;
    civName: string;
    gamertag: string;
    firstPartyName: string;
    twoKName: string;
    samePlatformAsLocalPlayer: boolean;
    playerInfoDropdown: MPLobbyDropdownOptionData | null;
    civilizationDropdown: MPLobbyDropdownOptionData | null;
    teamDropdown: MPLobbyDropdownOptionData | null;
    leaderDropdown: MPLobbyDropdownOptionData | null;
    mementos: string[];
    isParticipant: boolean;
    isHuman: boolean;
    isDistantHuman: boolean;
    isConnected: boolean;
    canEverBeKicked: boolean;
    canBeKickedNow: boolean;
    /** TODO Since canBeKickedNow is a sub part of canEverBeKicked (<-> it is impossible to have canBeKickedNow true if canEverBeKicked is false),
     *  this should be an enum { canEverBeKicked ; canBeKickedNow ; canNotBeKickedNow }
     */
    kickTooltip: string;
    isKickVoteTarget: boolean;
    isMuted: boolean;
    muteTooltip: string;
}
export declare class MPLobbyDropdownOptionData {
    id: string;
    type: PlayerParamDropdownTypes;
    label: string;
    description?: string;
    isDisabled?: boolean;
    iconURL?: string;
    showLabelOnSelectedItem?: boolean;
    selectedItemIndex?: number;
    selectedItemTooltip?: string;
    itemList?: IconDropdownItem[];
    dropdownType?: string;
    playerParamName?: string;
    tooltip?: string;
    get serializedItemList(): string;
}
export declare const LobbyUpdateEventName: "model-mp-staging-update";
export declare class LobbyUpdateEvent extends CustomEvent<never> {
    constructor();
}
export declare const SMALL_SCREEN_MODE_MAX_HEIGHT = 900;
export declare const SMALL_SCREEN_MODE_MAX_WIDTH = 1700;
export declare class MPLobbyDataModel {
    private onUpdate?;
    private playersData;
    localPlayerData?: MPLobbyPlayerData;
    allReadyCountdownRemainingSeconds: number;
    allReadyCountdownRemainingPercentage: number;
    readyButtonCaption: string;
    private static ALL_READY_COUNTDOWN;
    private static ALL_READY_COUNTDOWN_STEP;
    private readyStatus;
    private allReadyCountdownIntervalHandle;
    private startGameRemainingTime;
    private onUserProfileUpdatedEventListener;
    private participatingCount;
    private kickTimerListener;
    private kickTimerReference;
    private kickVoteLockout;
    private static GLOBAL_COUNTDOWN;
    private static GLOBAL_COUNTDOWN_STEP;
    private static KICK_VOTE_COOLDOWN;
    private globalCountdownRemainingSeconds;
    private globalCountdownIntervalHandle;
    private PlayerLeaderStringHandle;
    private PlayerCivilizationStringHandle;
    private PlayerTeamStringHandle;
    private MapSizeStringHandle;
    private GameSpeedsStringHandle;
    private RulesetStringHandle;
    private AgeStringHandle;
    private PlayerMementoMajorSlotStringHandle;
    private PlayerMementoMinorSlot1StringHandle;
    private cacheLeaderCivilizationBias;
    private playerParameterCache;
    private gameParameterCache;
    private cachedCivilizationTooltipFragments;
    private cachedLeaderTooltips;
    private dropdownCallbacks;
    private voteDialogBoxIDPerKickPlayerID;
    private checkHotseatHumanShowCheckCallback;
    private changeSlotStatusShowCheckCallback;
    private swapShowCheckCallback;
    private viewProfileCheckCallback;
    slotActionsData: any;
    private isActive;
    /**
     * Returns whether or not the model is active.
     */
    get active(): boolean;
    /**
     * Startup the model, putting it in an active state.
     */
    startup(): void;
    /**
     * Shutdown the model, putting it in an inactive state.
     */
    shutdown(): void;
    get gameName(): string;
    get joinCode(): string;
    get timeRemainingTimer(): string;
    get canToggleReady(): boolean;
    get isLocalPlayerReady(): boolean;
    get canEditMementos(): boolean;
    get summaryMapSize(): string;
    get summarySpeed(): string;
    get summaryMapType(): string;
    get summaryMapRuleSet(): string;
    get ageBannerSrc(): string;
    get difficulty(): string;
    get playerCounters(): string;
    get isUsingGlobalCountdown(): boolean;
    /**
     * Should the column header that shows players are "Ready" be hidden?
     */
    get isReadyOptionHidden(): boolean;
    /**
     * Should the column header that gives the ability to "Kick" players from the match be hidden?
     */
    get isKickOptionHidden(): boolean;
    get lobbyPlayersData(): MPLobbyPlayerData[];
    private addVoteDialogBox;
    private removeVoteDialogBox;
    kick(kickPlayerID: number): void;
    mute(mutePlayerID: number, mute: boolean): void;
    set updateCallback(callback: (model: MPLobbyDataModel) => void);
    /**
     * isHostPlayer
     * @param playerId
     * @returns if a given player is the host
     */
    static isHostPlayer(playerId: number): boolean;
    /**
     * isLocalPlayer
     * @param playerId
     * @returns if a given player is local
     */
    static isLocalPlayer(playerId: number): boolean;
    /**
     * isLocalHostPlayer
     * @returns if our own player is the (local) host
     */
    static isLocalHostPlayer(): boolean;
    private static get isNewGame();
    private civIconURLGetter;
    private leaderIconURLGetter;
    private findPlayerParameter;
    private findGameParameter;
    private update;
    stringify(player: MPLobbyPlayerData): string;
    private GetMPLobbyPlayerConnectionStatus;
    private formatDateToMinutes;
    private getTooltip;
    private getCivilizationTooltip;
    private getLeaderTooltip;
    private updateStartingGameReadyButtonData;
    private updateGlobalCountdownRemainingSecondsData;
    private getRemainingGlobalCountdown;
    cancelGlobalCountdown(): void;
    updateGlobalCountdownData(): void;
    private areAllPlayersReady;
    private getReadyStatus;
    private updateReadyButtonData;
    private createPlayerParamDropdown;
    private createTeamParamDropdown;
    private createSlotActionsDropdown;
    onGameReady(): void;
    private onKickVoteStarted;
    private onMultiplayerHostMigrated;
    private onKickVoteComplete;
    private kickTimerExpired;
    private pushDummyPlayersData;
    onLobbyDropdown(event: DropdownSelectionChangeEvent): void;
    private onTeamDropdown;
    private onPlayerParamDropdown;
    private onSlotActionDropdown;
    private canChangeSlotStatus;
    private canSwap;
}
declare const instance: MPLobbyDataModel;
export { instance as default };
export declare class MPLobbyDataModelProxy {
    static instanceRefCount: number;
    static instanceRefHandle: number;
    private handle;
    disconnect(): void;
    connect(): void;
    access(): MPLobbyDataModel;
}
declare global {
    interface HTMLElementEventMap {
        [LobbyUpdateEventName]: LobbyUpdateEvent;
    }
}
