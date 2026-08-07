/**
 * @file mp-friends.ts
 * @copyright 2023-2024, Firaxis Games
 * @description Multiplayer Friends and Blocked Players lists
 */
export declare enum TabNameTypes {
    LobbyTab = 0,
    SearchResutsTab = 1,
    FriendsListTab = 2,
    NotificationsTab = 3,
    RecentlyMetTab = 4,
    BlockTab = 5
}
export declare const TabNames: readonly [
    "lobby-list-tab",
    "search-results-list-tab",
    "friends-list-tab",
    "notifications-list-tab",
    "recently-met-players-list-tab",
    "blocked-players-list-tab"
];
export declare const SocialPanelOpenEventName: "social-panel-open";
