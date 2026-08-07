declare class RewardsNotificationsManagerSingleton {
    private static singletonInstance;
    private rewardsNotificationIndicator;
    private rewardsIndicatorIsSet;
    private rewardReceivedListener;
    static getInstance(): RewardsNotificationsManagerSingleton;
    constructor();
    setNotificationItem(indicator: HTMLElement): void;
    setNotificationVisibility(isVisible: boolean): void;
    isNotificationVisible(): any;
    allNewRewardsAreHidden(): boolean;
    private onRewardReceived;
}
declare const RewardsNotificationsManager: RewardsNotificationsManagerSingleton;
export { RewardsNotificationsManager as default };
