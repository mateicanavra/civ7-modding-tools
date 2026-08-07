export declare enum SocialNotificationIndicatorType {
    MAINMENU_BADGE = 0,
    SOCIALTAB_BADGE = 1,
    ALL_INDICATORS = 2
}
declare class SocialNotificationsManagerSingleton {
    private static signletonInstance;
    private mainMenuNotificationBadge;
    private socialPanelNotificationBadge;
    private remindVisibility;
    private socialOnFriendRequestReceivedListener;
    private socialOnFriendRequestSentListener;
    private socialOnOnlineSaveDataLoadedListener;
    /**
     * Singleton accessor
     */
    static getInstance(): SocialNotificationsManagerSingleton;
    constructor();
    setNotificationItem(indicatorType: SocialNotificationIndicatorType, indicator: HTMLElement): void;
    setTabNotificationVisibilityBasedOnReminder(): void;
    setNotificationVisibility(indicatorType: SocialNotificationIndicatorType, visibile: boolean): void;
    private setNotificationTypeAll;
    isNotificationVisible(indicatorType: SocialNotificationIndicatorType): boolean;
    private socialOnFriendRequestReceived;
    private socialOnFriendRequestSent;
    private socialOnOnlineSaveDataLoaded;
}
declare const SocialNotificationsManager: SocialNotificationsManagerSingleton;
export { SocialNotificationsManager as default };
