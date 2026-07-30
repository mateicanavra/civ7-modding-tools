import type {
  Civ7AdvisorWarningViewedCheckResult,
  Civ7AdvisorWarningViewedInput,
  Civ7AdvisorWarningViewedSendInput,
  Civ7AdvisorWarningViewedSendResult,
  Civ7AdvisorWarningViewedSnapshot,
  Civ7AttributeNodeSnapshot,
  Civ7AttributePurchaseAtomInput,
  Civ7AttributePurchaseAtomSendInput,
  Civ7AttributePurchaseCheckResult,
  Civ7AttributePurchaseSendResult,
  Civ7AttributeReviewAtomInput,
  Civ7AttributeReviewCheckResult,
  Civ7AttributeReviewSendInput,
  Civ7AttributeReviewSendResult,
  Civ7BattlefieldScanInput,
  Civ7BattlefieldScanResultSchema,
  Civ7CameraFocusInput,
  Civ7CameraFocusResult,
  Civ7CelebrationChoiceCheckResult,
  Civ7CelebrationChoiceInput,
  Civ7CelebrationChoiceSendInput,
  Civ7CelebrationChoiceSendResult,
  Civ7CelebrationChoiceSnapshot,
  Civ7CityExpansionCheckResult,
  Civ7CityExpansionInput,
  Civ7CityExpansionSendResult,
  Civ7CityExpansionSnapshot,
  Civ7CleanFrameEnterInput,
  Civ7CleanFrameEnterResult,
  Civ7CleanFrameExitResult,
  Civ7CloseDisplaysInput,
  Civ7CloseDisplaysResult,
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResultSchema,
  Civ7DiplomacyResponseCheckResult,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseSendInput,
  Civ7DiplomacyResponseSendResult,
  Civ7DiplomacyResponseSnapshot,
  Civ7DiplomacyResponseValidationResult,
  Civ7DirectControlOptions,
  Civ7DisplayQueueHoldResult,
  Civ7DisplayQueueSnapshot,
  Civ7ExploreGrantInput,
  Civ7ExploreGrantResult,
  Civ7ExploreReleaseInput,
  Civ7ExploreReleaseResult,
  Civ7FirstMeetResponseCheckResult,
  Civ7FirstMeetResponseInput,
  Civ7FirstMeetResponseSendInput,
  Civ7FirstMeetResponseSendResult,
  Civ7FirstMeetResponseSnapshot,
  Civ7FirstMeetResponseValidationResult,
  Civ7GovernmentChoiceCheckResult,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceSendInput,
  Civ7GovernmentChoiceSendResult,
  Civ7GovernmentChoiceSnapshot,
  Civ7MapGridInput,
  Civ7MapGridResult,
  Civ7NarrativeChoiceCheckResult,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceSendInput,
  Civ7NarrativeChoiceSendResult,
  Civ7NarrativeChoiceSnapshot,
  Civ7NarrativeChoiceValidationResult,
  Civ7NotificationDismissalCheckResult,
  Civ7NotificationDismissalSendInput,
  Civ7NotificationDismissalSendResult,
  Civ7NotificationDismissalSnapshot,
  Civ7NotificationDismissInput,
  Civ7PlayableStatusResult,
  Civ7PlayNotificationViewResult,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
  Civ7ProductionChoiceCheckResult,
  Civ7ProductionChoiceInput,
  Civ7ProductionChoiceSendResult,
  Civ7ProductionChoiceSnapshot,
  Civ7ProductionChoiceValidationResult,
  Civ7ProgressDashboardInput,
  Civ7ProgressDashboardResult,
  Civ7ProgressionTreeCheckResult,
  Civ7ProgressionTreeClearTargetInput,
  Civ7ProgressionTreeClearTargetResult,
  Civ7ProgressionTreeNodeInput,
  Civ7ProgressionTreeNodeSendInput,
  Civ7ProgressionTreeSendResult,
  Civ7ProgressionTreeSnapshot,
  Civ7ReadyCityViewInput,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewInput,
  Civ7ReadyUnitViewResultSchema,
  Civ7RuntimeProbe,
  Civ7SettlementRecommendationInput,
  Civ7SettlementRecommendationResultSchema,
  Civ7TargetCandidatesInput,
  Civ7TargetCandidatesResultSchema,
  Civ7TownFocusChangeCheckResult,
  Civ7TownFocusChangeInput,
  Civ7TownFocusChangeSendResult,
  Civ7TownFocusReviewCheckResult,
  Civ7TownFocusReviewInput,
  Civ7TownFocusReviewSendResult,
  Civ7TownFocusSnapshot,
  Civ7TraditionAssignmentsSnapshot,
  Civ7TraditionChangeAtomInput,
  Civ7TraditionChangeAtomSendInput,
  Civ7TraditionChangeCheckResult,
  Civ7TraditionChangeSendResult,
  Civ7TraditionReviewAtomInput,
  Civ7TraditionReviewCheckResult,
  Civ7TraditionReviewSendInput,
  Civ7TraditionReviewSendResult,
  Civ7TraditionsViewInput,
  Civ7TraditionsViewResult,
  Civ7TurnCompletionCheckResult,
  Civ7TurnCompletionInput,
  Civ7TurnCompletionSendInput,
  Civ7TurnCompletionSendResult,
  Civ7TurnCompletionSnapshot,
  Civ7UnitCommandCheckResult,
  Civ7UnitCommandSendResult,
  Civ7UnitCommandSnapshot,
  Civ7UnitResettleInput,
  Civ7UnitTargetActionCheckInput,
  Civ7UnitTargetActionCheckResult,
  Civ7UnitTargetActionSendInput,
  Civ7UnitTargetActionSendResult,
  Civ7UnitTargetObservationInput,
  Civ7UnitTargetSnapshot,
  Civ7UnitUpgradeInput,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
  Civ7WindowShotCaptureInput,
  Civ7WindowShotCaptureResult,
  Civ7WorkerAssignmentCheckResult,
  Civ7WorkerAssignmentInput,
  Civ7WorkerAssignmentSendResult,
  Civ7WorkerAssignmentSnapshot,
  PlayNotificationViewOptions,
} from "@civ7/direct-control";
import type { Civ7CommandDispatchStatus } from "@civ7/direct-control/error";
import type { Static } from "typebox";

export type Civ7ControlOrpcNotificationDismissalSnapshot = Civ7NotificationDismissalSnapshot;
export type Civ7ControlOrpcNotificationDismissalCheckResult = Civ7NotificationDismissalCheckResult;
export type Civ7ControlOrpcNotificationDismissalSendResult = Civ7NotificationDismissalSendResult;
export type Civ7ControlOrpcAdvisorWarningViewedSnapshot = Civ7AdvisorWarningViewedSnapshot;
export type Civ7ControlOrpcAdvisorWarningViewedCheckResult = Civ7AdvisorWarningViewedCheckResult;
export type Civ7ControlOrpcAdvisorWarningViewedSendResult = Civ7AdvisorWarningViewedSendResult;
export type Civ7ControlOrpcDiplomacyResponseSnapshot = Civ7DiplomacyResponseSnapshot;
export type Civ7ControlOrpcDiplomacyResponseValidationResult =
  Civ7DiplomacyResponseValidationResult;
export type Civ7ControlOrpcDiplomacyResponseCheckResult = Civ7DiplomacyResponseCheckResult;
export type Civ7ControlOrpcDiplomacyResponseSendResult = Civ7DiplomacyResponseSendResult;
export type Civ7ControlOrpcFirstMeetResponseSnapshot = Civ7FirstMeetResponseSnapshot;
export type Civ7ControlOrpcFirstMeetResponseValidationResult =
  Civ7FirstMeetResponseValidationResult;
export type Civ7ControlOrpcFirstMeetResponseCheckResult = Civ7FirstMeetResponseCheckResult;
export type Civ7ControlOrpcFirstMeetResponseSendResult = Civ7FirstMeetResponseSendResult;
export type Civ7ControlOrpcGovernmentChoiceSnapshot = Civ7GovernmentChoiceSnapshot;
export type Civ7ControlOrpcGovernmentChoiceCheckResult = Civ7GovernmentChoiceCheckResult;
export type Civ7ControlOrpcGovernmentChoiceSendResult = Civ7GovernmentChoiceSendResult;
export type Civ7ControlOrpcCelebrationChoiceSnapshot = Civ7CelebrationChoiceSnapshot;
export type Civ7ControlOrpcCelebrationChoiceCheckResult = Civ7CelebrationChoiceCheckResult;
export type Civ7ControlOrpcCelebrationChoiceSendResult = Civ7CelebrationChoiceSendResult;
export type Civ7ControlOrpcNarrativeChoiceSnapshot = Civ7NarrativeChoiceSnapshot;
export type Civ7ControlOrpcNarrativeChoiceValidationResult = Civ7NarrativeChoiceValidationResult;
export type Civ7ControlOrpcNarrativeChoiceCheckResult = Civ7NarrativeChoiceCheckResult;
export type Civ7ControlOrpcNarrativeChoiceSendResult = Civ7NarrativeChoiceSendResult;
export type Civ7ControlOrpcProgressionTreeCheckResult = Civ7ProgressionTreeCheckResult;
export type Civ7ControlOrpcProgressionTreeSnapshot = Civ7ProgressionTreeSnapshot;
export type Civ7ControlOrpcProgressionTreeSendResult = Civ7ProgressionTreeSendResult;
export type Civ7ControlOrpcProgressionTreeClearTargetResult = Civ7ProgressionTreeClearTargetResult;
export type Civ7ControlOrpcAttributeNodeSnapshot = Civ7AttributeNodeSnapshot;
export type Civ7ControlOrpcAttributePurchaseCheckResult = Civ7AttributePurchaseCheckResult;
export type Civ7ControlOrpcAttributePurchaseSendResult = Civ7AttributePurchaseSendResult;
export type Civ7ControlOrpcAttributeReviewCheckResult = Civ7AttributeReviewCheckResult;
type Civ7ControlOrpcAttributeReviewSendResult = Civ7AttributeReviewSendResult;
export type Civ7ControlOrpcTraditionAssignmentsSnapshot = Civ7TraditionAssignmentsSnapshot;
export type Civ7ControlOrpcTraditionChangeCheckResult = Civ7TraditionChangeCheckResult;
export type Civ7ControlOrpcTraditionChangeSendResult = Civ7TraditionChangeSendResult;
export type Civ7ControlOrpcTraditionReviewCheckResult = Civ7TraditionReviewCheckResult;
type Civ7ControlOrpcTraditionReviewSendResult = Civ7TraditionReviewSendResult;
export type Civ7ControlOrpcProgressDashboardResult = Civ7ProgressDashboardResult;
export type Civ7ControlOrpcTraditionsViewResult = Civ7TraditionsViewResult;
export type Civ7ControlOrpcTurnCompletionSnapshot = Civ7TurnCompletionSnapshot;
export type Civ7ControlOrpcTurnCompletionCheckResult = Civ7TurnCompletionCheckResult;
export type Civ7ControlOrpcTurnCompletionSendResult = Civ7TurnCompletionSendResult;
export type Civ7ControlOrpcPlayableStatusResult = Civ7PlayableStatusResult;
export type Civ7ControlOrpcProductionChoiceValidationResult = Civ7ProductionChoiceValidationResult;
export type Civ7ControlOrpcProductionChoiceSnapshot = Civ7ProductionChoiceSnapshot;
export type Civ7ControlOrpcProductionChoiceCheckResult = Civ7ProductionChoiceCheckResult;
export type Civ7ControlOrpcProductionChoiceSendResult = Civ7ProductionChoiceSendResult;
export type Civ7ControlOrpcTownFocusSnapshot = Civ7TownFocusSnapshot;
export type Civ7ControlOrpcTownFocusChangeCheckResult = Civ7TownFocusChangeCheckResult;
export type Civ7ControlOrpcTownFocusChangeSendResult = Civ7TownFocusChangeSendResult;
export type Civ7ControlOrpcTownFocusReviewCheckResult = Civ7TownFocusReviewCheckResult;
export type Civ7ControlOrpcTownFocusReviewSendResult = Civ7TownFocusReviewSendResult;
export type Civ7ControlOrpcWorkerAssignmentSnapshot = Civ7WorkerAssignmentSnapshot;
export type Civ7ControlOrpcWorkerAssignmentCheckResult = Civ7WorkerAssignmentCheckResult;
export type Civ7ControlOrpcWorkerAssignmentSendResult = Civ7WorkerAssignmentSendResult;
export type Civ7ControlOrpcCityExpansionSnapshot = Civ7CityExpansionSnapshot;
export type Civ7ControlOrpcCityExpansionCheckResult = Civ7CityExpansionCheckResult;
export type Civ7ControlOrpcCityExpansionSendResult = Civ7CityExpansionSendResult;
export type Civ7ControlOrpcPlayNotificationViewResult = Civ7PlayNotificationViewResult;
export type Civ7ControlOrpcBattlefieldScanResult = Static<typeof Civ7BattlefieldScanResultSchema>;
export type Civ7ControlOrpcDestinationAnalysisResult = Static<
  typeof Civ7DestinationAnalysisResultSchema
>;
export type Civ7ControlOrpcPlotSnapshotResult = Civ7PlotSnapshotResult;
export type Civ7ControlOrpcMapGridResult = Civ7MapGridResult;
export type Civ7ControlOrpcDisplayQueueSnapshotResult = Civ7DisplayQueueSnapshot;
export type Civ7ControlOrpcCloseDisplaysResult = Civ7CloseDisplaysResult;
type Civ7ControlOrpcDisplayQueueHoldResult = Civ7DisplayQueueHoldResult;
type Civ7ControlOrpcExploreGrantResult = Civ7ExploreGrantResult;
type Civ7ControlOrpcExploreReleaseResult = Civ7ExploreReleaseResult;
export type Civ7ControlOrpcCameraFocusResult = Civ7CameraFocusResult;
export type Civ7ControlOrpcCleanFrameEnterResult = Civ7CleanFrameEnterResult;
type Civ7ControlOrpcCleanFrameExitResult = Civ7CleanFrameExitResult;
export type Civ7ControlOrpcWindowShotCaptureResult = Civ7WindowShotCaptureResult;
export type Civ7ControlOrpcVisibilitySummaryResult = Civ7VisibilitySummaryResult;
export type Civ7ControlOrpcReadyUnitViewResult = Static<typeof Civ7ReadyUnitViewResultSchema>;
export type Civ7ControlOrpcReadyCityViewResult = Static<typeof Civ7ReadyCityViewResultSchema>;
export type Civ7ControlOrpcSettlementRecommendationsResult = Static<
  typeof Civ7SettlementRecommendationResultSchema
>;
export type Civ7ControlOrpcTargetCandidatesResult = Static<typeof Civ7TargetCandidatesResultSchema>;
export type Civ7ControlOrpcUnitTargetSnapshot = Civ7UnitTargetSnapshot;
export type Civ7ControlOrpcUnitTargetActionCheckResult = Civ7UnitTargetActionCheckResult;
export type Civ7ControlOrpcUnitTargetActionSendResult = Civ7UnitTargetActionSendResult;
export type Civ7ControlOrpcCommandDispatchStatus = Civ7CommandDispatchStatus;
export type Civ7ControlOrpcRuntimeProbe<T> = Civ7RuntimeProbe<T>;
export type Civ7ControlOrpcUnitCommandCheckResult = Civ7UnitCommandCheckResult;
export type Civ7ControlOrpcUnitCommandSnapshot = Civ7UnitCommandSnapshot;
export type Civ7ControlOrpcUnitCommandSendResult = Civ7UnitCommandSendResult;
type Civ7ControlOrpcUnitUpgradeInput = Civ7UnitUpgradeInput;
type Civ7ControlOrpcUnitResettleInput = Civ7UnitResettleInput;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
  checkCiv7ProductionChoice(
    input: Civ7ProductionChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProductionChoiceCheckResult>;
  sendCiv7ProductionChoice(
    input: Civ7ProductionChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProductionChoiceSendResult>;
  checkCiv7NotificationDismissal(
    input: Civ7NotificationDismissInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNotificationDismissalCheckResult>;
  sendCiv7NotificationDismissal(
    input: Civ7NotificationDismissalSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNotificationDismissalSendResult>;
  checkCiv7AdvisorWarningViewed(
    input: Civ7AdvisorWarningViewedInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAdvisorWarningViewedCheckResult>;
  sendCiv7AdvisorWarningViewed(
    input: Civ7AdvisorWarningViewedSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAdvisorWarningViewedSendResult>;
  checkCiv7NarrativeChoice(
    input: Civ7NarrativeChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNarrativeChoiceCheckResult>;
  sendCiv7NarrativeChoice(
    input: Civ7NarrativeChoiceSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNarrativeChoiceSendResult>;
  checkCiv7DiplomacyResponse(
    input: Civ7DiplomacyResponseInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcDiplomacyResponseCheckResult>;
  sendCiv7DiplomacyResponse(
    input: Civ7DiplomacyResponseSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcDiplomacyResponseSendResult>;
  checkCiv7FirstMeetResponse(
    input: Civ7FirstMeetResponseInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcFirstMeetResponseCheckResult>;
  sendCiv7FirstMeetResponse(
    input: Civ7FirstMeetResponseSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcFirstMeetResponseSendResult>;
  checkCiv7GovernmentChoice(
    input: Civ7GovernmentChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcGovernmentChoiceCheckResult>;
  sendCiv7GovernmentChoice(
    input: Civ7GovernmentChoiceSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcGovernmentChoiceSendResult>;
  checkCiv7CelebrationChoice(
    input: Civ7CelebrationChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcCelebrationChoiceCheckResult>;
  sendCiv7CelebrationChoice(
    input: Civ7CelebrationChoiceSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcCelebrationChoiceSendResult>;
  checkCiv7ProgressionTreeChoice(
    input: Civ7ProgressionTreeNodeInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTreeCheckResult>;
  sendCiv7ProgressionTreeChoice(
    input: Civ7ProgressionTreeNodeSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTreeSendResult>;
  checkCiv7ProgressionTreeTarget(
    input: Civ7ProgressionTreeNodeInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTreeCheckResult>;
  sendCiv7ProgressionTreeTarget(
    input: Civ7ProgressionTreeNodeSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTreeSendResult>;
  clearCiv7ProgressionTreeTarget(
    input: Civ7ProgressionTreeClearTargetInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTreeClearTargetResult>;
  observeCiv7AttributeNode(
    input: Civ7AttributePurchaseAtomInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAttributeNodeSnapshot>;
  checkCiv7AttributePurchase(
    input: Civ7AttributePurchaseAtomInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAttributePurchaseCheckResult>;
  sendCiv7AttributePurchase(
    input: Civ7AttributePurchaseAtomSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAttributePurchaseSendResult>;
  checkCiv7AttributeReview(
    input: Civ7AttributeReviewAtomInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAttributeReviewCheckResult>;
  sendCiv7AttributeReview(
    input: Civ7AttributeReviewSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAttributeReviewSendResult>;
  observeCiv7TraditionAssignments(
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTraditionAssignmentsSnapshot>;
  checkCiv7TraditionChange(
    input: Civ7TraditionChangeAtomInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTraditionChangeCheckResult>;
  sendCiv7TraditionChange(
    input: Civ7TraditionChangeAtomSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTraditionChangeSendResult>;
  checkCiv7TraditionReview(
    input: Civ7TraditionReviewAtomInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTraditionReviewCheckResult>;
  sendCiv7TraditionReview(
    input: Civ7TraditionReviewSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTraditionReviewSendResult>;
  checkCiv7TownFocusChange(
    input: Civ7TownFocusChangeInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTownFocusChangeCheckResult>;
  sendCiv7TownFocusChange(
    input: Civ7TownFocusChangeInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTownFocusChangeSendResult>;
  checkCiv7TownFocusReview(
    input: Civ7TownFocusReviewInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTownFocusReviewCheckResult>;
  sendCiv7TownFocusReview(
    input: Civ7TownFocusReviewInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTownFocusReviewSendResult>;
  checkCiv7WorkerAssignment(
    input: Civ7WorkerAssignmentInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7WorkerAssignmentCheckResult>;
  sendCiv7WorkerAssignment(
    input: Civ7WorkerAssignmentInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7WorkerAssignmentSendResult>;
  checkCiv7CityExpansion(
    input: Civ7CityExpansionInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7CityExpansionCheckResult>;
  sendCiv7CityExpansion(
    input: Civ7CityExpansionInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7CityExpansionSendResult>;
  observeCiv7UnitTarget(
    input: Civ7UnitTargetObservationInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcUnitTargetSnapshot>;
  checkCiv7UnitTargetAction(
    input: Civ7UnitTargetActionCheckInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcUnitTargetActionCheckResult>;
  sendCiv7UnitTargetAction(
    input: Civ7UnitTargetActionSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcUnitTargetActionSendResult>;
  checkCiv7UnitUpgrade(
    input: Civ7ControlOrpcUnitUpgradeInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcUnitCommandCheckResult>;
  sendCiv7UnitUpgrade(
    input: Civ7ControlOrpcUnitUpgradeInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcUnitCommandSendResult>;
  checkCiv7UnitResettle(
    input: Civ7ControlOrpcUnitResettleInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcUnitCommandCheckResult>;
  sendCiv7UnitResettle(
    input: Civ7ControlOrpcUnitResettleInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcUnitCommandSendResult>;
  checkCiv7TurnCompletion(
    input: Civ7TurnCompletionInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTurnCompletionCheckResult>;
  sendCiv7TurnCompletion(
    input: Civ7TurnCompletionSendInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTurnCompletionSendResult>;
  getCiv7PlayableStatus(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcPlayableStatusResult>;
  getCiv7PlayNotificationView(
    options?: PlayNotificationViewOptions
  ): Promise<Civ7ControlOrpcPlayNotificationViewResult>;
  getCiv7ProgressDashboard(
    input?: Civ7ProgressDashboardInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcProgressDashboardResult>;
  getCiv7TraditionsView(
    input?: Civ7TraditionsViewInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcTraditionsViewResult>;
  getCiv7BattlefieldScan(
    input?: Civ7BattlefieldScanInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcBattlefieldScanResult>;
  getCiv7DestinationAnalysis(
    input: Civ7DestinationAnalysisInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcDestinationAnalysisResult>;
  getCiv7PlotSnapshot(
    input: Civ7PlotSnapshotInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcPlotSnapshotResult>;
  getCiv7MapGrid(
    input: Civ7MapGridInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcMapGridResult>;
  getCiv7ReadyUnitView(
    input?: Civ7ReadyUnitViewInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcReadyUnitViewResult>;
  getCiv7ReadyCityView(
    input?: Civ7ReadyCityViewInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcReadyCityViewResult>;
  getCiv7SettlementRecommendations(
    input?: Civ7SettlementRecommendationInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcSettlementRecommendationsResult>;
  getCiv7TargetCandidates(
    input?: Civ7TargetCandidatesInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcTargetCandidatesResult>;
  getCiv7VisibilitySummary(
    input: Civ7VisibilitySummaryInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcVisibilitySummaryResult>;
  readCiv7DisplayQueue(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcDisplayQueueSnapshotResult>;
  closeCiv7Displays(
    input: Civ7CloseDisplaysInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcCloseDisplaysResult>;
  suspendCiv7DisplayQueue(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcDisplayQueueHoldResult>;
  resumeCiv7DisplayQueue(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcDisplayQueueHoldResult>;
  applyCiv7ExploreGrant(
    input: Civ7ExploreGrantInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcExploreGrantResult>;
  releaseCiv7ExploreGrant(
    input: Civ7ExploreReleaseInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcExploreReleaseResult>;
  focusCiv7Camera(
    input: Civ7CameraFocusInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcCameraFocusResult>;
  enterCiv7CleanFrame(
    input: Civ7CleanFrameEnterInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcCleanFrameEnterResult>;
  exitCiv7CleanFrame(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcCleanFrameExitResult>;
  /** OS-local ScreenCaptureKit window capture — no Tuner endpoint involved. */
  captureCiv7WindowShot(
    input: Civ7WindowShotCaptureInput
  ): Promise<Civ7ControlOrpcWindowShotCaptureResult>;
}>;
