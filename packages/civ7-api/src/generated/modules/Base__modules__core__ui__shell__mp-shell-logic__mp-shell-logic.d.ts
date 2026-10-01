/**
 * @file mp-logic.ts
 * @copyright 2021, Firaxis Games
 * @description An object to catch mp messages and orchestrate UI responses.
 */
import { IEngineInputHandler, InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { NetworkUtilities } from "/core/ui/utilities/utilities-network.js";
export declare const MultiplayerMatchMakeCompleteEventName: "mp-game-match-make-complete";
export declare class MultiplayerMatchMakeCompleteEvent extends CustomEvent<never> {
    constructor();
}
export declare const MultiplayerMatchMakeFailEventName: "mp-game-match-make-fail";
export declare class MultiplayerMatchMakeFailEvent extends CustomEvent<never> {
    constructor();
}
export declare const MultiplayerJoinCompleteEventName: "mp-game-join-complete";
export declare class MultiplayerJoinCompleteEvent extends CustomEvent<never> {
    constructor();
}
export declare const MultiplayerJoinFailEventName: "mp-game-join-fail";
export declare class MultiplayerJoinFailEvent extends CustomEvent<{
    error: string;
}> {
    constructor(error: string);
}
export declare const MultiplayerCreateCompleteEventName: "mp-game-create-complete";
export declare class MultiplayerCreateCompleteEvent extends CustomEvent<never> {
    constructor();
}
export declare const MultiplayerCreateFailEventName: "mp-game-create-fail";
export declare class MultiplayerCreateFailEvent extends CustomEvent<{
    result: NetworkResult;
}> {
    constructor(result: NetworkResult);
}
export declare const MultiplayerCreateAttemptEventName: "mp-game-create-attempt";
export declare class MultiplayerCreateAttemptEvent extends CustomEvent<never> {
    constructor();
}
export declare const MultiplayerGameAbandonedEventName: "mp-game-abandoned";
export declare class MultiplayerGameAbandonedEvent extends CustomEvent<{
    reason: NetworkUtilities.AbandonReasonPopup;
}> {
    constructor(reason: NetworkUtilities.AbandonReasonPopup);
}
declare class MultiplayerShellManagerSingleton implements IEngineInputHandler {
    private static _Instance;
    serverType: ServerType;
    skipToGameCreator: boolean;
    private waitingForParentalPermissions;
    private needToDisplayExitGameErrorDialog;
    private canMPDialogShow;
    private savedErrorTitle;
    private savedErrorBody;
    private hostCreatingGameDialogBoxID?;
    private clientJoiningGameDialogBoxID?;
    private clientMatchmakingGameDialogBoxId?;
    private premiumWaitDialogBoxID?;
    private accountNotLinkedDialogBoxID?;
    private noPremiumDialogBoxID?;
    private noChildPermissionDialogBoxID?;
    private searchTimeoutDialogBoxID?;
    private exitGameErrorDialogBoxID?;
    private exitBrowserDialogBoxID?;
    private multiplayerGameAbandonedListener;
    private childNoPermissionsDialogListener;
    private parentalPermissionListener;
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): MultiplayerShellManagerSingleton;
    /**
     * Example of a more complicated / customized dialog box.
     */
    onError_SearchIsTakingALongTime(): void;
    /**
     * Show a pop up while joining a game, with only a [Cancel] option available.
     */
    onJoiningInProgress(): void;
    onJoinSuccess(): void;
    onMultiplayerJoinRoomFailed(data: JoinRoomFailedData): void;
    onJoiningFail(errorMessage: string): void;
    private onChildNoPermissionsDialog;
    private onPremiumServiceCheckComplete;
    onMatchMakingInProgress(): void;
    hasSupportForLANLikeServerTypes(): boolean;
    onGameBrowse(serverType: ServerType, skipToGameCreator?: boolean): void;
    openLanding(): void;
    private tellMainMenuWereBack;
    private sendPremiumCheckRequest;
    private openChildMultiplayer;
    onGameMode(): void;
    ensureInternetConnection(isUserInput: boolean): boolean;
    onAutomatch(matchAgeID: string): void;
    onAgeTransition(): void;
    /**
     * Show a pop up when an MP game was abandoned
     */
    onMultiplayerGameAbandoned(data: MultiplayerGameAbandonedData): void;
    exitToMainMenu(): void;
    /**
     * We have left a multiplayer game and need to return to the games browser.
     * Display an error popup if errorTitle and errorBody are non-empty.
     */
    exitMPGame(errorTitle: string, errorBody: string): void;
    browserExitError(errorTitle: string, errorBody: string): void;
    hostMultiplayerGame(eServerType: ServerType): void;
    private onLobbyCreated;
    private onLobbyError;
    handleInput(inputEvent: InputEngineEvent): boolean;
    handleNavigation(navigationEvent: NavigateInputEvent): boolean;
    get unitTestMP(): boolean;
    /**
     * Delay executing a function for the given number of frames.
     * TODO: Remove function if Gameface is able to resolve earlier OR move to a global function for all places to call. Cf. also other existing delayByFrame() functions.
     * @param func The function to call
     * @param frames The number of frames to wait for
     */
    private delayExecute;
    /**
     * refresh Game Center account authentication status in case auth status changed during session
     */
    refreshGameCenterAuthentication(): void;
}
declare const MultiplayerShellManager: MultiplayerShellManagerSingleton;
export { MultiplayerShellManager as default };
declare global {
    interface HTMLElementEventMap {
        [MultiplayerMatchMakeCompleteEventName]: MultiplayerMatchMakeCompleteEvent;
        [MultiplayerMatchMakeFailEventName]: MultiplayerMatchMakeFailEvent;
        [MultiplayerJoinCompleteEventName]: MultiplayerJoinCompleteEvent;
        [MultiplayerJoinFailEventName]: MultiplayerJoinFailEvent;
        [MultiplayerCreateCompleteEventName]: MultiplayerCreateCompleteEvent;
        [MultiplayerCreateFailEventName]: MultiplayerCreateFailEvent;
        [MultiplayerGameAbandonedEventName]: MultiplayerGameAbandonedEvent;
    }
}
