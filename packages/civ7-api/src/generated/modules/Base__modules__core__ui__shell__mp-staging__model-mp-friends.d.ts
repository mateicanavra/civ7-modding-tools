/**
 * @file model-mp-friends.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Handles all of the data for the Multiplayer Friends and Blocked Players lists.
 */
type isSearchingChangeCallback = (isSearching: boolean) => void;
export declare enum MPRefreshDataFlags {
    None = 0,
    Friends = 1,
    RecentlyMet = 2,
    SearchResult = 4,
    Notifications = 8,
    UserProfiles = 16,
    Blocked = 32,
    All = 63
}
export declare class MPFriendsPlayerData {
    friendID1P: string;
    gamertag1P: string;
    statusIcon1P: string;
    statusDetails1P: string;
    friendIDT2gp: string;
    gamertagT2gp: string;
    statusIconT2gp: string;
    statusDetailsT2gp: string;
    isGameInvite: boolean;
    actionButtonLabel: string;
    disabledActionButton: boolean;
    isFilteredOut: boolean;
    platform: any;
    dateLastSeen: string;
    leaderId: string;
}
declare class MPFriendsDataModel {
    private static instance;
    private onUpdate?;
    private _friendsData;
    private _blockedPlayersData;
    private _recentlyMetPlayersData;
    private _searchResultsData;
    private _notificationsData;
    private _playerFilter;
    private _hasSearched;
    private _isSearching;
    private _eventNotificationUpdate;
    private isSearchingChangeCallbacks;
    private _dataUpdated;
    /**
     * Singleton accessor
     */
    static getInstance(): MPFriendsDataModel;
    set updateCallback(callback: (model: MPFriendsDataModel) => void);
    get eventNotificationUpdate(): any;
    get friendsData(): MPFriendsPlayerData[];
    get blockedPlayersData(): MPFriendsPlayerData[];
    get recentlyMetPlayersData(): MPFriendsPlayerData[];
    get searchResultsData(): MPFriendsPlayerData[];
    get notificationsData(): MPFriendsPlayerData[];
    set playerFilter(value: string);
    hasSearched(): boolean;
    searched(value: boolean): void;
    searching(value: boolean): void;
    getUpdatedDataFlag(): MPRefreshDataFlags;
    isSearching(): boolean;
    onIsSearchingChange(callback: isSearchingChangeCallback): void;
    offIsSearchingChange(callback: isSearchingChangeCallback): void;
    private notifyIsSearchingChange;
    private constructor();
    private setupListeners;
    private updateFriends;
    private updateRecentlyMet;
    private updateNotifications;
    private updateSearchResult;
    private updateUserProfiles;
    private updateBlocked;
    updateAll(): void;
    private update;
    private getStatusIconPath;
    private getActionStateButtonLabel;
    private isActionButtonDisabled;
    invite(friendID: string, _friendData: MPFriendsPlayerData): void;
    unblock(friendID: string): void;
    addFriend(friendID: string, _friendData: MPFriendsPlayerData): void;
    getFriendDataFromID(friendID?: string): MPFriendsPlayerData | undefined;
    getRecentlyMetPlayerdDataFromID(friendID?: string): MPFriendsPlayerData | undefined;
    refreshFriendList(): void;
    private pushDummyData;
    private filterOut;
    postAttachTabNotification(notificationTabIndex: number): void;
}
declare const MPFriendsModel: MPFriendsDataModel;
export { MPFriendsModel as default };
