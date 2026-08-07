export interface PauseMenuAddonInfoSectionProps {
    activeDLC: ModInfo[];
    activeMods: ModInfo[];
    leaderName: string;
    level: string;
    civName: string;
    hasActiveDLC: boolean;
    hasActiveMods: boolean;
    progressionBadgeProps: PauseMenuProgressionBadgeProps;
}
export interface PauseMenuProgressionBadgeProps {
    twoKName: string;
    firstPartyName: string;
    firstPartyIcon: string;
    playerTitle: string;
    foundationLevel: string;
    backgroundImage: string;
    badgeIcon: string;
}
export interface LeaderPortraitAreaProps {
    leaderImage: string;
    progressionBadgeProps: PauseMenuProgressionBadgeProps;
}
export interface GameInfoProps {
    gameInfoString: string;
    mapSeed: string;
    gameSeed: string;
    buildInfo: string;
}
export interface PauseMenuData {
    addonInfoSectionProps: PauseMenuAddonInfoSectionProps;
    leaderInfo: LeaderPortraitAreaProps;
    gameInfo: GameInfoProps;
    canExitToDesktop: boolean;
    retireButtonString: string;
    canRestart: boolean;
    restartButtonDisabledReason: string | null;
}
export interface PauseMenuContextModel {
    data: PauseMenuData;
    onClickProgression: () => void;
    onClickResume: () => void;
    onClickQuickSave: () => void;
    onClickSave: () => void;
    onClickLoad: () => void;
    onClickRestart: () => void;
    onClickRetire: () => void;
    onClickOptions: () => void;
    onClickExitToMain: () => void;
    onClickExitToDesktop: () => void;
    onClickAdvancedOptions: () => void;
    onClickMapSeed: () => void;
    onClickGameSeed: () => void;
    onClickSocialPanel: () => void;
    onClickCollapseAddons: () => void;
    onClickCollapseMods: () => void;
    onClickJoinCode: () => void;
    isAddonCollapsed: boolean;
    isModsCollapsed: boolean;
    isMultiplayer: boolean;
    supportsSSO: boolean;
    shouldShowJoinCode: boolean;
    joinCodeString: string;
    isClipboardSupported: boolean;
}
export declare function createPauseMenuModel(): any;
