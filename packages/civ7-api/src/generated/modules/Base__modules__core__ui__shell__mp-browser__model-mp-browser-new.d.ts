/**
 * @file model-mp-browser-new.ts
 * @copyright 2023, Firaxis Games
 * @description Multiplayer browser screen data mdoel.
 */
export declare const MultiplayerGameListQueryCompleteEventName: "mp-game-list-query-complete";
export declare class MultiplayerGameListQueryCompleteEvent extends CustomEvent<MultiplayerGameListCompleteData> {
    constructor(detail: MultiplayerGameListCompleteData);
}
export declare const MultiplayerGameListQueryDoneEventName: "mp-game-list-query-done";
export declare class MultiplayerGameListQueryDoneEvent extends CustomEvent<MultiplayerGameListCompleteData> {
    constructor(detail: MultiplayerGameListCompleteData);
}
export declare const MultiplayerGameListQueryErrorEventName: "mp-game-list-query-error";
export declare class MultiplayerGameListQueryErrorEvent extends CustomEvent<GenericDataInt32> {
    constructor(detail: GenericDataInt32);
}
export interface MPGameListInfo {
    roomID: number;
    serverNameOriginal: string;
    serverNameDisplay: string;
    numPlayers: number;
    maxPlayers: number;
    gameSpeedName: string;
    gameSpeed: number;
    mapDisplayName: string;
    mapSizeName: string;
    mapSizeType: number;
    ruleSetName: string;
    savedGame: boolean;
    liveEvent: string;
    disabledContent: ModInfo[];
    mods: ModConfiguration[];
    hostingPlatform: HostingType;
    hostFriendID_Native: string;
    hostFriendID_T2GP: string;
    hostName_1P: string;
    hostName_2K: string;
}
type MPBrowserDataModelPartial = {
    [P in keyof MPBrowserDataModel]?: MPBrowserDataModel[P];
};
declare class MPBrowserDataModel {
    private static instance;
    GameList: MPGameListInfo[];
    installedMods: any;
    modulesToExclude: any;
    constructor();
    /**
     * Using an update gate for the model so it isn't set to be updated on the same
     * frame as when a possible update just occurred, as this can cause lock up from
     * an infinitiely dirty model.
     */
    updateGate: any;
    update(props: MPBrowserDataModelPartial): void;
    /**
     * Singleton accessor
     */
    static getInstance(): MPBrowserDataModel;
    pushDummyGameList(): void;
    initGameList(serverType: ServerType): any;
    refreshGameList(): any;
    onMultiplayerGameListClear(_data: MultiplayerGameListClearData): void;
    onMultiplayerGameListUpdated(data: MultiplayerGameListUpdatedData): void;
    onMultiplayerGameListComplete(data: MultiplayerGameListCompleteData): void;
    onMultiplayerGameListError(data: GenericDataInt32): void;
}
declare const MPBrowserModel: MPBrowserDataModel;
export { MPBrowserModel as default };
declare global {
    interface HTMLElementEventMap {
        [MultiplayerGameListQueryCompleteEventName]: MultiplayerGameListQueryCompleteEvent;
        [MultiplayerGameListQueryDoneEventName]: MultiplayerGameListQueryDoneEvent;
        [MultiplayerGameListQueryErrorEventName]: MultiplayerGameListQueryErrorEvent;
    }
}
