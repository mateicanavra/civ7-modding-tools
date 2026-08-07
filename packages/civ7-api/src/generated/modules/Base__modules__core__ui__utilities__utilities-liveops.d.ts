/**
 * @file utilities-liveops.ts
 * @copyright 2024, Firaxis Games
 * @description Helpers for Live Operations.
 */
export declare enum UnlockableRewardType {
    Badge = 3801327255,
    Banner = 2340454002,
    Border = 602451426,
    Title = 928356065,
    Memento = 4287908646,
    StrategyCard = 456188808,
    AtrributeNode = 2269616578,
    Color = 2050336355,
    Slot = 2901129264
}
declare class AuthUpdateListener {
    constructor();
    updatePerms(): void;
    activeLiveEventListener(): void;
}
export declare const authListener: AuthUpdateListener;
declare class RewardItems {
    bannerRewardItems: BannerItem[];
    badgeRewardItems: BadgeItem[];
    titleRewardItems: TitleItem[];
    colorRewardItems: ColorItem[];
    borderRewardItems: BorderItem[];
    constructor();
    getBadge(id: string): BadgeItem;
    getBanner(id: string): BannerItem;
    getTitle(id: string): TitleItem;
    getColor(id: string): ColorItem;
    getBorder(id: string): BorderItem;
    updatePermissions(): void;
    /**
     * Populates the reward list with badge, banner, and title items.
     * This function is called in constructor and should not be called multiple times as it will fetch from remote server.
     */
    populateRewardList(): void;
}
export declare var UnlockableRewardItems: RewardItems;
/**
 * Accessor for default player info. This is used mainly for showing the player info when user is in offline/ logout state.
 * @returns The default player card information.
 */
export declare function getDefaultPlayerInfo(): DNAUserCardInfo;
/**
 * Retrieves the player card information for a given account ID.
 * If no friend ID is provided, it retrieves the player card information for the current player.
 * @param friendId - The friend ID (can be platform account id) of the player. (Optional = undefined or empty will return local player's card info)
 * @param platformUsername - The username of the player. (Optional = undefined or empty will return local player's card info)
 * @param updateCache - Indicates whether to update the cache. Default is false.
 * @returns The player card information.
 */
export declare function getPlayerCardInfo(friendId?: string, platformUsername?: string, updateCache?: boolean): DNAUserCardInfo;
/**
 * Updates the player profile with the provided fields.
 * TwoKName is updated automatically and will be overridden if provided in the updatedFields.
 * @param updatedFields - The fields to update in the player profile.
 * @param updateCache - If true, refetech the cached player profile from the backend.
 */
export declare function updatePlayerProfile(updatedFields: Partial<DNAUserProfile>, updateCache?: boolean): void;
export declare function forceCacheUpdate(): void;
export declare function getRewardType(gameItemID: string): number | undefined;
/**
 * Retrieve all possible Live Event Rewards
 */
export declare function getAllLiveEventRewardGameIDs(): any[];
/**
 * Converts 2K legal text into HTML.
 */
export declare function parseLegalDocument(textField: HTMLElement, inputString: string): void;
export {};
