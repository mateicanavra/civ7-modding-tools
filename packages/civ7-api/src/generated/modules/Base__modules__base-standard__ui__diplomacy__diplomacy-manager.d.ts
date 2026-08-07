/**
 * @file diplomacy-manager.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Intermediary data organization/retrieval for diplomacy dialog/hub
 */
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
import { RaiseDiplomacyEvent } from "/base-standard/ui/diplomacy/diplomacy-events.js";
export interface ReactionButtonData {
    operationType: string;
    description: string;
    cost: number;
}
export interface ReactionItemData {
    reactionTitle: string;
    reactionDescription: string;
    reactionButtonData: ReactionButtonData;
}
export interface PendingStartActionData {
    operationType: PlayerOperationType;
    operationArguments: DiplomacyActionOperationArgs;
}
export type OperationSuccess = Pick<OperationResult, "Success">;
export interface DiplomacyActionOperationArgs {
    ID?: number;
    ID2?: number;
    City?: number;
    Unit?: number;
    Player1: PlayerId;
    Player2?: PlayerId;
    Player3?: PlayerId;
    Amount: number;
    Amount2?: number;
    Type: DiplomacyActionType;
}
export interface DiplomacyActionSupportArgs {
    ID: DiplomacyActionEventId;
    Type: DiplomacyTokenTypes;
    Amount: number;
    SubType: boolean;
}
export interface EspionageNotificationData {
    Header: DiplomaticEventHeader;
    DetailsString: string;
}
export interface DiplomacyDialogChoice {
    ChoiceString: string;
    ChoiceType: string;
    Callback(): void;
}
export interface DiplomacyDialogData {
    SessionID: DiplomacySessionId;
    Message: string;
    Choices: DiplomacyDialogChoice[];
    OtherPlayerID: PlayerId;
    InitiatingPlayerID: PlayerId;
    StatementTypeDef: DiplomacyStatementDefinition | null;
    StatementFrameDef: DiplomacyStatementFrameDefinition | undefined;
    FocusID: ComponentID;
    DealAction?: DiplomacyDealProposalActions;
}
export interface DiplomacyDealData {
    SessionID: DiplomacySessionId;
    WorkingDealID: DiplomacyWorkingDealId;
    OtherPlayer: PlayerId;
    DealAction: DiplomacyDealProposalActions;
    blockClose?: boolean;
}
export interface TempDiplomacyAction {
    actionString: string;
    audioString?: string;
    available: boolean;
    Callback(): void;
    disabledTooltip: string;
    bigButton?: boolean;
    action: TempDiplomacyActionType;
}
export declare enum TempDiplomacyActionType {
    DECLARE_WAR = 0,
    DECLARE_PEACE = 1,
    FORM_ALLIANCE = 2
}
interface DiplomacyDialogRequest extends DiplomacyDialogData, IDisplayRequestBase {
}
interface DiplomacyDealRequest extends DiplomacyDealData, IDisplayRequestBase {
}
interface DiplomacyProjectRequest extends DiplomaticResponseUIData, IDisplayRequestBase {
}
/**
 * Some diplomacy panels need to handle input in special ways. Extending panel allows us to pass input events down without add additional listeners to the window which would pick up duplicate events
 */
export declare class DiplomacyInputPanel extends Panel {
    handleInput(_inputEvent: InputEngineEvent): boolean;
    handleNavigation(_navigationEvent: NavigateInputEvent): boolean;
}
export declare class DiplomacyDialogManagerImpl extends DisplayHandlerBase<DiplomacyDialogRequest> {
    constructor();
    show(request: DiplomacyDialogRequest): void;
    hide(_request: DiplomacyDialogRequest, options: DisplayHideOptions): void;
    isEmpty(): boolean;
}
export declare class DiplomacyDealManagerImpl extends DisplayHandlerBase<DiplomacyDealRequest> {
    constructor();
    show(request: DiplomacyDealRequest): void;
    hide(request: DiplomacyDealRequest, options: DisplayHideOptions): void;
    isEmpty(): boolean;
}
export declare const DiplomacyDealProposalResponseEventName: "diplomacy-deal-proposal-response";
export declare class DiplomacyDealProposalResponseEvent extends CustomEvent<DiplomacyStatement_EventData> {
    constructor(detail: DiplomacyStatement_EventData);
}
declare class DiplomacyManagerImpl {
    private beforeUnloadListener;
    private diplomacyStatementListener;
    private diplomacySessionClosedListener;
    private actionDetailsClosedListener;
    private firstMeetReactionClosedListener;
    private onRaiseDiplomacyHubListener;
    private _selectedPlayerID;
    private _diplomacyActions;
    private _availableProjects;
    private _availableEndeavors;
    private _availableSanctions;
    private _availableEsionage;
    private _availableTreaties;
    private _selectedProjectData;
    isClosingActionsPanel: boolean;
    private _isFirstMeetDiplomacyOpen;
    private _isDeclareWarDiplomacyOpen;
    currentDiplomacyDialogData: DiplomacyDialogRequest | null;
    selectedActionID: DiplomacyActionEventId;
    currentDiplomacyDealData: DiplomacyDealRequest | null;
    currentAllyWarData: DiplomaticEventHeader | null;
    currentProjectReactionData: DiplomaticResponseUIData | null;
    currentProjectReactionRequest: DiplomacyProjectRequest | null;
    showDiplomacyAfterFirstMeet: boolean;
    firstMeetPlayerID: PlayerId;
    currentEspionageData: EspionageNotificationData | null;
    selectedAttributeType: string;
    shouldQuickClose: boolean;
    constructor();
    isShowing(): boolean;
    isEmpty(): boolean;
    private addDealCloseBlocker;
    /**
     * @implements {IDisplayQueue}
     */
    hide(isSuspended: boolean): void;
    private initializeListeners;
    private cleanup;
    private onUnload;
    get selectedPlayerID(): PlayerId;
    get diplomacyActions(): TempDiplomacyAction[];
    get allAvailableActions(): DiplomaticProjectUIData[];
    get availableProjects(): DiplomaticProjectUIData[];
    get availableEndeavors(): DiplomaticProjectUIData[];
    get availableSanctions(): DiplomaticProjectUIData[];
    get availableEspionage(): DiplomaticProjectUIData[];
    get availableTreaties(): DiplomaticProjectUIData[];
    get selectedProjectData(): DiplomaticProjectUIData | null;
    get isFirstMeetDiplomacyOpen(): boolean;
    get isDeclareWarDiplomacyOpen(): boolean;
    queryAvailableProjectData(targetPlayer?: PlayerId): void;
    /**
     * Another system is requesting for the diplomacy system to be raised.
     * @param event
     */
    onRaiseDiplomacyHub(event: RaiseDiplomacyEvent): void;
    private raiseDiplomacyHub;
    lowerDiplomacyHub(): void;
    closeCurrentDiplomacyDeal(closeSession: boolean, ourDiplomacySession?: number): void;
    closeCurrentDiplomacyProject(closeToDiploHub: boolean): void;
    addCurrentDiplomacyProject(request: DiplomaticResponseUIData): void;
    private handleDealStatement;
    private onDiplomacyStatement;
    private onDiplomacySessionClosed;
    closeCurrentDiplomacyDialog(): void;
    private buildDialogData;
    private buildMessageString;
    private getResponseTypeName;
    private getStatementFrame;
    private getChoices;
    private onActionDetailsClosed;
    populateDiplomacyActions(): void;
    confirmDeclareWar(playerID: PlayerId, warType: DiplomacyActionType): void;
    /**
     * Starts the process of a war between to Civilizations (or a Civivilization and IP) from the world.
     * @param warDeclarationTarget target for declaring war
     * @param postDeclareWarAction callback for when war is declared.
     * @returns true if handled, false otherwise
     */
    startWarFromMap(warDeclarationTarget: WarDeclarationTarget, postDeclareWarAction: () => void): boolean;
    private raiseAlliancePopup;
    private raiseWarTypePopup;
    clickStartProject(projectData: DiplomaticProjectUIData): void;
    getRelationshipTypeString(relationship: DiplomacyPlayerRelationships): string;
    private onFirstMeetReactionClosed;
    getAudioIdForDiploAction(projectData: DiplomaticProjectUIData): [
        string,
        string
    ];
}
declare const DiplomacyManager: DiplomacyManagerImpl;
export { DiplomacyManager as default };
