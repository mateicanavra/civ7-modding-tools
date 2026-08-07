/**
 * @file model-diplo-ribbon.ts
 * @copyright 2021-2025, Firaxis Games
 * @description All of the data for the diplomacy ribbon
 */
export declare enum RibbonStatsToggleStatus {
    RibbonStatsHidden = 0,
    RibbonStatsShowing = 1
}
export declare enum RibbonDisplayType {
    Yields = 1,
    Size = 2,
    Scores = 3
}
export declare enum RibbonYieldType {
    Default = "default",
    Gold = "gold",
    Culture = "culture",
    Science = "science",
    Happiness = "happiness",
    Diplomacy = "diplomacy",
    Trade = "trade",
    Settlements = "settlements",
    Property = "property",
    Victory = "victory"
}
interface PlayerDataYields {
    type?: RibbonYieldType;
    label: string;
    value: string;
    img: string;
    details: string;
    rawValue: number;
    warningThreshold: number;
}
export interface PlayerDataObject {
    id: PlayerId;
    shortName: string;
    name: string;
    alwaysShow: boolean;
    leaderType: string;
    portraitContext: string;
    civName: string;
    civSymbol: string;
    civLine: string;
    primaryColor: string;
    secondaryColor: string;
    displayItems: PlayerDataYields[];
    yields: PlayerDataYields[];
    size: PlayerDataYields[];
    scores: PlayerDataYields[];
    canClick: boolean;
    selected: boolean;
    isTurnActive: boolean;
    dealIds: DiplomacyDealId[];
    relationshipIcon: string;
    relationshipLevel: number;
    relationshipTooltip: string;
    warSupport: number;
    isAtWar: boolean;
    religionIdeology?: PlayerDataReligionIdeology;
}
interface PlayerDataReligionIdeology {
    type: string;
    name: string;
    icon: string;
    isIdeology: boolean;
    iconTint?: string;
}
interface RelationshipData {
    relationshipType: DiplomacyPlayerRelationships;
    relationshipLevel: number;
    relationshipTooltip: string;
}
interface DiploSectionSelected {
    playerId: PlayerId;
    section: "relationship" | "unset";
}
export declare const UpdateDiploRibbonEventName: "update-diplo-ribbon";
export declare class UpdateDiploRibbonEvent extends CustomEvent<never> {
    constructor();
}
declare class DiploRibbonModel {
    private static _Instance;
    private onUpdate?;
    private updateQueued;
    private _playerData;
    private _localPlayerStats;
    private _diploStatementPlayerData;
    private refDataModelChangedQueue;
    private playerYieldUpdateQueue;
    private playerScoreUpdateQueue;
    private playerSizeUpdateQueue;
    private playerGlobalTokensUpdateQueue;
    private playerSanctionUpdateQueue;
    private playerWarUpdateQueue;
    private selected;
    private canClick;
    private _sectionSelected;
    private _ribbonDisplayTypes;
    private previousDisplayTypes;
    private RIBBON_DISPLAY_OPTION_SET;
    private RIBBON_DISPLAY_OPTION_TYPE;
    private _alwaysShowYields;
    private _userDiploRibbonsToggled;
    private _eventNotificationRefresh;
    private updateDiploRibbonListener;
    private interfaceModeChangedListener;
    private diplomacyDialogNextListener;
    private constructor();
    static getInstance(): DiploRibbonModel;
    get playerData(): readonly PlayerDataObject[];
    get diploStatementPlayerData(): readonly PlayerDataObject[];
    get localPlayerStats(): readonly PlayerDataYields[];
    set sectionSelected(value: DiploSectionSelected);
    get sectionSelected(): DiploSectionSelected;
    get ribbonDisplayTypes(): readonly RibbonDisplayType[];
    get eventNotificationRefresh(): any;
    get alwaysShowYields(): RibbonStatsToggleStatus;
    get areRibbonYieldsStuckOnScreen(): boolean;
    set userDiploRibbonsToggled(newStatus: RibbonStatsToggleStatus);
    get userDiploRibbonsToggled(): RibbonStatsToggleStatus;
    setRibbonDisplayOption(type: RibbonDisplayType, value: number): void;
    set updateCallback(callback: (model: DiploRibbonModel) => void);
    private updateAll;
    private getRibbonDisplayTypesFromUserOptions;
    private updateDiploStatementPlayerData;
    private get isExplorationAge();
    private get isModernAge();
    createPlayerData(player: PlayerLibrary, playerDiplomacy: PlayerDiplomacy, isKnownPlayer: boolean, relationshipData?: RelationshipData): PlayerDataObject;
    private getPlayerTradeOpportunities;
    private createPlayerYieldsData;
    private createPlayerSizeData;
    private createPlayerScoreData;
    private getImg;
    private queueUpdate;
    private queueDataModelChanged;
    private queueScoreUpdate;
    private queueYieldUpdate;
    private queueSizeUpdate;
    private queueGlobalTokensUpdate;
    private shouldShowYieldType;
    private onInterfaceModeChanged;
    private onPolicyChanged;
    private onPlayerYieldChanged;
    private onNarrativeChoiceMade;
    private onCultureYieldChanged;
    private onResearchYieldChanged;
    private onTreasuryChanged;
    private onDiplomacyTreasuryChanged;
    private onCityYieldChanged;
    private onPlayerSettlementCapChanged;
    private onGlobalTokensChanged;
    private onRelationshipStatusChanged;
    private onWonderCompleted;
    private onPlayerAgeTransitionComplete;
    private onDiplomacyWarUpdate;
    private onDiplomacyDeclareWar;
    private onDiplomacyMakePeace;
    private onDiplomacyMeet;
    private onAttributeNodeCompleted;
    private updatePlayerScores;
    private updatePlayerYields;
    private updatePlayerSize;
    private updateGlobalTokens;
    private onCityPopulationChanged;
    private onLocalPlayerChanged;
    private onPlayerPostDisconnected;
    private onPlayerInfoChanged;
    /**
     * In MP game it means someone left and rejoined in a new slot.
     */
    private onPlayersSwapped;
    private onPlayerTurnActivated;
    private onPlayerTurnDeactivated;
    private onAutoplayEnd;
    private onAutoplayStarted;
    private onSupportChanged;
    private onActionCanceled;
    private checkForSanctionAndWarUpdate;
    private queueWarUpdate;
    private queueSanctionUpdate;
    private updatePlayerWarSupport;
    private effectUsedListener;
    private getDiploReligionIdeologyIconTint;
}
export declare const DiploRibbonData: DiploRibbonModel;
export {};
