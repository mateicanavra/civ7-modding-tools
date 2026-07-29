import type {
  Civ7AdvisorWarningViewedInput,
  Civ7AdvisorWarningViewedResult,
  Civ7AttributePurchaseInput,
  Civ7AttributeReviewInput,
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
  Civ7CultureChoiceCloseoutInput,
  Civ7CultureChoiceCloseoutResult,
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResultSchema,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
  Civ7DirectControlOptions,
  Civ7DisplayQueueHoldResult,
  Civ7DisplayQueueSnapshot,
  Civ7ExploreGrantInput,
  Civ7ExploreGrantResult,
  Civ7ExploreReleaseInput,
  Civ7ExploreReleaseResult,
  Civ7FirstMeetResponseInput,
  Civ7FirstMeetResponseResult,
  Civ7GovernmentChoiceCheckResult,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceSendInput,
  Civ7GovernmentChoiceSendResult,
  Civ7GovernmentChoiceSnapshot,
  Civ7MapGridInput,
  Civ7MapGridResult,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissInput,
  Civ7PlayableStatusResultSchema,
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
  Civ7ProgressionPlayerChoiceResult,
  Civ7ProgressionTargetInput,
  Civ7ProgressionTargetResult,
  Civ7ReadyCityViewInput,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewInput,
  Civ7ReadyUnitViewResultSchema,
  Civ7RuntimeProbe,
  Civ7SettlementRecommendationInput,
  Civ7SettlementRecommendationResultSchema,
  Civ7TargetCandidatesInput,
  Civ7TargetCandidatesResultSchema,
  Civ7TechnologyChoiceCloseoutInput,
  Civ7TechnologyChoiceCloseoutResult,
  Civ7TownFocusChangeCheckResult,
  Civ7TownFocusChangeInput,
  Civ7TownFocusChangeSendResult,
  Civ7TownFocusReviewCheckResult,
  Civ7TownFocusReviewInput,
  Civ7TownFocusReviewSendResult,
  Civ7TownFocusSnapshot,
  Civ7TraditionChangeInput,
  Civ7TraditionReviewInput,
  Civ7TraditionsViewInput,
  Civ7TraditionsViewResult,
  Civ7TurnCompletionRequestResult,
  Civ7TurnCompletionStatusResultSchema,
  Civ7UnitCommandCheckResult,
  Civ7UnitCommandSendResult,
  Civ7UnitCommandSnapshot,
  Civ7UnitResettleInput,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResultSchema,
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

export type Civ7ControlOrpcNotificationDismissalResult = Civ7NotificationDismissalResult;
export type Civ7ControlOrpcAdvisorWarningViewedResult = Civ7AdvisorWarningViewedResult;
export type Civ7ControlOrpcDiplomacyResponseResult = Civ7DiplomacyResponseResult;
export type Civ7ControlOrpcFirstMeetResponseResult = Civ7FirstMeetResponseResult;
export type Civ7ControlOrpcGovernmentChoiceSnapshot = Civ7GovernmentChoiceSnapshot;
export type Civ7ControlOrpcGovernmentChoiceCheckResult = Civ7GovernmentChoiceCheckResult;
export type Civ7ControlOrpcGovernmentChoiceSendResult = Civ7GovernmentChoiceSendResult;
export type Civ7ControlOrpcCelebrationChoiceSnapshot = Civ7CelebrationChoiceSnapshot;
export type Civ7ControlOrpcCelebrationChoiceCheckResult = Civ7CelebrationChoiceCheckResult;
export type Civ7ControlOrpcCelebrationChoiceSendResult = Civ7CelebrationChoiceSendResult;
export type Civ7ControlOrpcCultureChoiceCloseoutResult = Civ7CultureChoiceCloseoutResult;
export type Civ7ControlOrpcNarrativeChoiceResult = Civ7NarrativeChoiceResult;
export type Civ7ControlOrpcTechnologyChoiceCloseoutResult = Civ7TechnologyChoiceCloseoutResult;
export type Civ7ControlOrpcProgressionTargetResult = Civ7ProgressionTargetResult;
export type Civ7ControlOrpcProgressionPlayerChoiceResult = Civ7ProgressionPlayerChoiceResult;
export type Civ7ControlOrpcProgressDashboardResult = Civ7ProgressDashboardResult;
export type Civ7ControlOrpcTraditionsViewResult = Civ7TraditionsViewResult;
export type Civ7ControlOrpcTurnCompletionRequestResult = Civ7TurnCompletionRequestResult;
export type Civ7ControlOrpcPlayableStatusResult = Static<typeof Civ7PlayableStatusResultSchema>;
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
export type Civ7ControlOrpcTurnCompletionStatusResult = Static<
  typeof Civ7TurnCompletionStatusResultSchema
>;
export type Civ7ControlOrpcUnitTargetActionResult = Static<typeof Civ7UnitTargetActionResultSchema>;
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
  requestCiv7NotificationDismissal(
    input: Civ7NotificationDismissInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNotificationDismissalResult>;
  requestCiv7AdvisorWarningViewed(
    input: Civ7AdvisorWarningViewedInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcAdvisorWarningViewedResult>;
  requestCiv7NarrativeChoice(
    input: Civ7NarrativeChoiceInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcNarrativeChoiceResult>;
  requestCiv7DiplomacyResponse(
    input: Civ7DiplomacyResponseInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcDiplomacyResponseResult>;
  requestCiv7FirstMeetResponse(
    input: Civ7FirstMeetResponseInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcFirstMeetResponseResult>;
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
  requestCiv7TechnologyChoiceCloseout(
    input: Civ7TechnologyChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTechnologyChoiceCloseoutResult>;
  requestCiv7CultureChoiceCloseout(
    input: Civ7CultureChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcCultureChoiceCloseoutResult>;
  requestCiv7TechnologyTarget(
    input: Omit<Civ7ProgressionTargetInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTargetResult>;
  requestCiv7CultureTarget(
    input: Omit<Civ7ProgressionTargetInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionTargetResult>;
  requestCiv7AttributePurchase(
    input: Omit<Civ7AttributePurchaseInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7AttributeReviewCloseout(
    input: Omit<Civ7AttributeReviewInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7TraditionChange(
    input: Omit<Civ7TraditionChangeInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7TraditionReviewCloseout(
    input: Omit<Civ7TraditionReviewInput, "kind">,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
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
  requestCiv7UnitTargetAction(
    input: Civ7UnitTargetActionInput,
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcUnitTargetActionResult>;
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
  requestCiv7TurnComplete(
    options: Civ7DirectControlOptions | undefined
  ): Promise<Civ7ControlOrpcTurnCompletionRequestResult>;
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
  getCiv7TurnCompletionStatus(
    options?: Civ7DirectControlOptions
  ): Promise<Civ7ControlOrpcTurnCompletionStatusResult>;
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
