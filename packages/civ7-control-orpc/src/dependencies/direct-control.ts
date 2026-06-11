import {
  applyCiv7ExploreGrant,
  closeCiv7Displays,
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7VisibilitySummary,
  readCiv7DisplayQueue,
  releaseCiv7ExploreGrant,
  resumeCiv7DisplayQueue,
  suspendCiv7DisplayQueue,
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7MapGrid,
  getCiv7PlotSnapshot,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
  getCiv7SettlementRecommendations,
  getCiv7TargetCandidates,
  getCiv7TurnCompletionStatus,
  requestCiv7AttributePurchase,
  requestCiv7AttributeReviewCloseout,
  requestCiv7AdvisorWarningViewed,
  requestCiv7TurnComplete,
  requestCiv7DiplomacyResponse,
  requestCiv7FirstMeetResponse,
  requestCiv7CelebrationChoice,
  requestCiv7CultureChoiceCloseout,
  requestCiv7GovernmentChoice,
  requestCiv7NarrativeChoice,
  requestCiv7NotificationDismissal,
  requestCiv7CityCommand,
  requestCiv7PlayerOperation,
  requestCiv7ProductionChoice,
  requestCiv7TechnologyChoiceCloseout,
  requestCiv7TechnologyTarget,
  requestCiv7TownFocusChange,
  requestCiv7TownFocusReviewCloseout,
  requestCiv7TraditionChange,
  requestCiv7TraditionReviewCloseout,
  requestCiv7UnitCommand,
  requestCiv7UnitTargetAction,
  requestCiv7CultureTarget,
  type Civ7DirectControlOptions,
  Civ7BattlefieldScanResultSchema,
  Civ7DestinationAnalysisResultSchema,
  type Civ7AttributePurchaseInput,
  type Civ7AttributeReviewInput,
  type Civ7AdvisorWarningViewedInput,
  type Civ7AdvisorWarningViewedResult,
  type Civ7CloseDisplaysInput,
  type Civ7CloseDisplaysResult,
  type Civ7DisplayQueueHoldResult,
  type Civ7DisplayQueueSnapshot,
  type Civ7ExploreGrantInput,
  type Civ7ExploreGrantResult,
  type Civ7ExploreReleaseInput,
  type Civ7ExploreReleaseResult,
  type Civ7VisibilitySummaryInput,
  type Civ7VisibilitySummaryResult,
  type Civ7DiplomacyResponseInput,
  type Civ7DiplomacyResponseResult,
  type Civ7FirstMeetResponseInput,
  type Civ7FirstMeetResponseResult,
  type Civ7CelebrationChoiceInput,
  type Civ7CultureChoiceCloseoutInput,
  type Civ7CultureChoiceCloseoutResult,
  type Civ7GovernmentChoiceInput,
  type Civ7GovernmentDomainChoiceResult,
  type Civ7MapGridInput,
  type Civ7MapGridResult,
  type Civ7NarrativeChoiceInput,
  type Civ7NarrativeChoiceResult,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlayableStatusResultSchema,
  Civ7ProductionChoiceResultSchema,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewResultSchema,
  Civ7TargetCandidatesResultSchema,
  Civ7TurnCompletionStatusResultSchema,
  Civ7UnitTargetActionResultSchema,
  type Civ7BattlefieldScanInput,
  type Civ7DestinationAnalysisInput,
  type Civ7NotificationDismissInput,
  type Civ7NotificationDismissalResult,
  type Civ7OperationRequestResult,
  type Civ7PlayNotificationViewResult,
  type Civ7PlotSnapshotInput,
  type Civ7PlotSnapshotResult,
  type Civ7PopulationPlacementProofSource,
  type Civ7ProductionChoiceInput,
  type Civ7ReadyCityViewInput,
  type Civ7ReadyUnitViewInput,
  type Civ7SettlementRecommendationInput,
  Civ7SettlementRecommendationResultSchema,
  type Civ7TargetCandidatesInput,
  type Civ7TechnologyChoiceCloseoutInput,
  type Civ7TechnologyChoiceCloseoutResult,
  type Civ7TownFocusChangeInput,
  type Civ7TownFocusRequestResult,
  type Civ7TownFocusReviewInput,
  type Civ7ProgressionTargetInput,
  type Civ7ProgressionTargetResult,
  type Civ7ProgressionPlayerChoiceResult,
  type Civ7ProgressDashboardInput,
  type Civ7ProgressDashboardResult,
  type Civ7TraditionsViewInput,
  type Civ7TraditionsViewResult,
  type Civ7TraditionChangeInput,
  type Civ7TraditionReviewInput,
  type Civ7TurnCompletionRequestResult,
  type Civ7UnitTargetActionInput,
  type PlayNotificationViewOptions,
} from "@civ7/direct-control";
import type { Static } from "typebox";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcMapLocation,
} from "../model/primitives";

export type Civ7ControlOrpcNotificationDismissalResult =
  Civ7NotificationDismissalResult;
export type Civ7ControlOrpcAdvisorWarningViewedResult =
  Civ7AdvisorWarningViewedResult;
export type Civ7ControlOrpcDiplomacyResponseResult =
  Civ7DiplomacyResponseResult;
export type Civ7ControlOrpcFirstMeetResponseResult =
  Civ7FirstMeetResponseResult;
export type Civ7ControlOrpcGovernmentChoiceResult =
  Civ7GovernmentDomainChoiceResult;
export type Civ7ControlOrpcCultureChoiceCloseoutResult =
  Civ7CultureChoiceCloseoutResult;
export type Civ7ControlOrpcNarrativeChoiceResult = Civ7NarrativeChoiceResult;
export type Civ7ControlOrpcTechnologyChoiceCloseoutResult =
  Civ7TechnologyChoiceCloseoutResult;
export type Civ7ControlOrpcProgressionTargetResult =
  Civ7ProgressionTargetResult;
export type Civ7ControlOrpcProgressionPlayerChoiceResult =
  Civ7ProgressionPlayerChoiceResult;
export type Civ7ControlOrpcProgressDashboardResult =
  Civ7ProgressDashboardResult;
export type Civ7ControlOrpcTraditionsViewResult = Civ7TraditionsViewResult;
export type Civ7ControlOrpcTurnCompletionRequestResult =
  Civ7TurnCompletionRequestResult;
type Civ7ControlOrpcPopulationPlacementRuntimeResult =
  Civ7PopulationPlacementProofSource & Readonly<{
    before: Readonly<{ valid: boolean }>;
    after: Readonly<{ valid: boolean }>;
  }>;
export type Civ7ControlOrpcAssignWorkerPlacementInput = Readonly<{
  playerId: number;
  location: number;
}>;
export type Civ7ControlOrpcExpandCityPlacementInput = Readonly<{
  cityId: Civ7ControlOrpcComponentId;
  destination: Civ7ControlOrpcMapLocation;
}>;
export type Civ7ControlOrpcPlayableStatusResult = Static<
  typeof Civ7PlayableStatusResultSchema
>;
export type Civ7ControlOrpcProductionChoiceResult = Static<
  typeof Civ7ProductionChoiceResultSchema
>;
export type Civ7ControlOrpcPlayNotificationViewResult =
  Civ7PlayNotificationViewResult;
export type Civ7ControlOrpcBattlefieldScanResult = Static<
  typeof Civ7BattlefieldScanResultSchema
>;
export type Civ7ControlOrpcDestinationAnalysisResult = Static<
  typeof Civ7DestinationAnalysisResultSchema
>;
export type Civ7ControlOrpcPlotSnapshotResult = Civ7PlotSnapshotResult;
export type Civ7ControlOrpcMapGridResult = Civ7MapGridResult;
export type Civ7ControlOrpcDisplayQueueSnapshotResult = Civ7DisplayQueueSnapshot;
export type Civ7ControlOrpcCloseDisplaysResult = Civ7CloseDisplaysResult;
export type Civ7ControlOrpcDisplayQueueHoldResult = Civ7DisplayQueueHoldResult;
export type Civ7ControlOrpcExploreGrantResult = Civ7ExploreGrantResult;
export type Civ7ControlOrpcExploreReleaseResult = Civ7ExploreReleaseResult;
export type Civ7ControlOrpcVisibilitySummaryResult = Civ7VisibilitySummaryResult;
export type Civ7ControlOrpcReadyUnitViewResult = Static<
  typeof Civ7ReadyUnitViewResultSchema
>;
export type Civ7ControlOrpcReadyCityViewResult = Static<
  typeof Civ7ReadyCityViewResultSchema
>;
export type Civ7ControlOrpcSettlementRecommendationsResult = Static<
  typeof Civ7SettlementRecommendationResultSchema
>;
export type Civ7ControlOrpcTargetCandidatesResult = Static<
  typeof Civ7TargetCandidatesResultSchema
>;
export type Civ7ControlOrpcTurnCompletionStatusResult = Static<
  typeof Civ7TurnCompletionStatusResultSchema
>;
export type Civ7ControlOrpcUnitTargetActionResult = Static<
  typeof Civ7UnitTargetActionResultSchema
>;
type Civ7ControlOrpcUnitCommandRuntimeResult = Civ7OperationRequestResult;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
  requestCiv7ProductionChoice(
    input: Civ7ProductionChoiceInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProductionChoiceResult>;
  requestCiv7NotificationDismissal(
    input: Civ7NotificationDismissInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcNotificationDismissalResult>;
  requestCiv7AdvisorWarningViewed(
    input: Civ7AdvisorWarningViewedInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcAdvisorWarningViewedResult>;
  requestCiv7NarrativeChoice(
    input: Civ7NarrativeChoiceInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcNarrativeChoiceResult>;
  requestCiv7DiplomacyResponse(
    input: Civ7DiplomacyResponseInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcDiplomacyResponseResult>;
  requestCiv7FirstMeetResponse(
    input: Civ7FirstMeetResponseInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcFirstMeetResponseResult>;
  requestCiv7GovernmentChoice(
    input: Omit<Civ7GovernmentChoiceInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcGovernmentChoiceResult>;
  requestCiv7CelebrationChoice(
    input: Omit<Civ7CelebrationChoiceInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcGovernmentChoiceResult>;
  requestCiv7TechnologyChoiceCloseout(
    input: Civ7TechnologyChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcTechnologyChoiceCloseoutResult>;
  requestCiv7CultureChoiceCloseout(
    input: Civ7CultureChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcCultureChoiceCloseoutResult>;
  requestCiv7TechnologyTarget(
    input: Omit<Civ7ProgressionTargetInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionTargetResult>;
  requestCiv7CultureTarget(
    input: Omit<Civ7ProgressionTargetInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionTargetResult>;
  requestCiv7AttributePurchase(
    input: Omit<Civ7AttributePurchaseInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7AttributeReviewCloseout(
    input: Omit<Civ7AttributeReviewInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7TraditionChange(
    input: Omit<Civ7TraditionChangeInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7TraditionReviewCloseout(
    input: Omit<Civ7TraditionReviewInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult>;
  requestCiv7TownFocusChange(
    input: Omit<Civ7TownFocusChangeInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7TownFocusRequestResult>;
  requestCiv7TownFocusReviewCloseout(
    input: Omit<Civ7TownFocusReviewInput, "kind">,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7TownFocusRequestResult>;
  requestCiv7AssignWorkerPlacement(
    input: Civ7ControlOrpcAssignWorkerPlacementInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcPopulationPlacementRuntimeResult>;
  requestCiv7ExpandCityPlacement(
    input: Civ7ControlOrpcExpandCityPlacementInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcPopulationPlacementRuntimeResult>;
  requestCiv7UnitTargetAction(
    input: Civ7UnitTargetActionInput,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcUnitTargetActionResult>;
  requestCiv7UnitCommand(
    input: Readonly<{
      unitId: Civ7ControlOrpcComponentId;
      operationType: string;
      args?: Readonly<Record<string, number>>;
    }>,
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcUnitCommandRuntimeResult>;
  requestCiv7TurnComplete(
    options: Civ7DirectControlOptions | undefined,
  ): Promise<Civ7ControlOrpcTurnCompletionRequestResult>;
  getCiv7PlayableStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlayableStatusResult>;
  getCiv7PlayNotificationView(
    options?: PlayNotificationViewOptions,
  ): Promise<Civ7ControlOrpcPlayNotificationViewResult>;
  getCiv7ProgressDashboard(
    input?: Civ7ProgressDashboardInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcProgressDashboardResult>;
  getCiv7TraditionsView(
    input?: Civ7TraditionsViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcTraditionsViewResult>;
  getCiv7BattlefieldScan(
    input?: Civ7BattlefieldScanInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcBattlefieldScanResult>;
  getCiv7DestinationAnalysis(
    input: Civ7DestinationAnalysisInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcDestinationAnalysisResult>;
  getCiv7PlotSnapshot(
    input: Civ7PlotSnapshotInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlotSnapshotResult>;
  getCiv7MapGrid(
    input: Civ7MapGridInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcMapGridResult>;
  getCiv7ReadyUnitView(
    input?: Civ7ReadyUnitViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcReadyUnitViewResult>;
  getCiv7ReadyCityView(
    input?: Civ7ReadyCityViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcReadyCityViewResult>;
  getCiv7SettlementRecommendations(
    input?: Civ7SettlementRecommendationInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcSettlementRecommendationsResult>;
  getCiv7TargetCandidates(
    input?: Civ7TargetCandidatesInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcTargetCandidatesResult>;
  getCiv7TurnCompletionStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcTurnCompletionStatusResult>;
  getCiv7VisibilitySummary(
    input: Civ7VisibilitySummaryInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcVisibilitySummaryResult>;
  readCiv7DisplayQueue(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcDisplayQueueSnapshotResult>;
  closeCiv7Displays(
    input: Civ7CloseDisplaysInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcCloseDisplaysResult>;
  suspendCiv7DisplayQueue(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcDisplayQueueHoldResult>;
  resumeCiv7DisplayQueue(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcDisplayQueueHoldResult>;
  applyCiv7ExploreGrant(
    input: Civ7ExploreGrantInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcExploreGrantResult>;
  releaseCiv7ExploreGrant(
    input: Civ7ExploreReleaseInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcExploreReleaseResult>;
}>;

export const liveCiv7ControlOrpcDirectControlFacade:
  Civ7ControlOrpcDirectControlFacade = {
  requestCiv7ProductionChoice: async (input, options) =>
    requestCiv7ProductionChoice(input, options) as Promise<
      Civ7ControlOrpcProductionChoiceResult
    >,
  requestCiv7NotificationDismissal: async (input, options) =>
    requestCiv7NotificationDismissal(input, options) as Promise<
      Civ7ControlOrpcNotificationDismissalResult
    >,
  requestCiv7AdvisorWarningViewed: async (input, options) =>
    requestCiv7AdvisorWarningViewed(input, options),
  requestCiv7NarrativeChoice: async (input, options) =>
    requestCiv7NarrativeChoice(input, options),
  requestCiv7DiplomacyResponse: async (input, options) =>
    requestCiv7DiplomacyResponse(input, options),
  requestCiv7FirstMeetResponse: async (input, options) =>
    requestCiv7FirstMeetResponse(input, options),
  requestCiv7GovernmentChoice: async (input, options) =>
    requestCiv7GovernmentChoice(input, options),
  requestCiv7CelebrationChoice: async (input, options) =>
    requestCiv7CelebrationChoice(input, options),
  requestCiv7TechnologyChoiceCloseout: async (input, options) =>
    requestCiv7TechnologyChoiceCloseout(input, options),
  requestCiv7CultureChoiceCloseout: async (input, options) =>
    requestCiv7CultureChoiceCloseout(input, options),
  requestCiv7TechnologyTarget: async (input, options) =>
    requestCiv7TechnologyTarget(input, options),
  requestCiv7CultureTarget: async (input, options) =>
    requestCiv7CultureTarget(input, options),
  requestCiv7AttributePurchase: async (input, options) =>
    requestCiv7AttributePurchase(input, options),
  requestCiv7AttributeReviewCloseout: async (input, options) =>
    requestCiv7AttributeReviewCloseout(input, options),
  requestCiv7TraditionChange: async (input, options) =>
    requestCiv7TraditionChange(input, options),
  requestCiv7TraditionReviewCloseout: async (input, options) =>
    requestCiv7TraditionReviewCloseout(input, options),
  requestCiv7TownFocusChange: async (input, options) =>
    requestCiv7TownFocusChange(input, options),
  requestCiv7TownFocusReviewCloseout: async (input, options) =>
    requestCiv7TownFocusReviewCloseout(input, options),
  requestCiv7AssignWorkerPlacement: async (input, options) =>
    requestCiv7PlayerOperation({
      playerId: input.playerId,
      operationType: "ASSIGN_WORKER",
      args: {
        Location: input.location,
        Amount: 1,
      },
    }, options) as Promise<
      Civ7ControlOrpcPopulationPlacementRuntimeResult
    >,
  requestCiv7ExpandCityPlacement: async (input, options) =>
    requestCiv7CityCommand({
      cityId: input.cityId,
      operationType: "EXPAND",
      args: {
        X: input.destination.x,
        Y: input.destination.y,
      },
    }, options) as Promise<
      Civ7ControlOrpcPopulationPlacementRuntimeResult
    >,
  requestCiv7UnitTargetAction: async (input, options) =>
    requestCiv7UnitTargetAction(input, options) as Promise<
      Civ7ControlOrpcUnitTargetActionResult
    >,
  requestCiv7UnitCommand: async (input, options) =>
    requestCiv7UnitCommand(input, options) as Promise<
      Civ7ControlOrpcUnitCommandRuntimeResult
    >,
  requestCiv7TurnComplete: async (options) =>
    requestCiv7TurnComplete(options),
  getCiv7PlayableStatus: async (options) =>
    getCiv7PlayableStatus(options) as Promise<
      Civ7ControlOrpcPlayableStatusResult
    >,
  getCiv7PlayNotificationView: async (options) =>
    getCiv7PlayNotificationView(options) as Promise<
      Civ7ControlOrpcPlayNotificationViewResult
    >,
  getCiv7ProgressDashboard: async (input, options) =>
    getCiv7ProgressDashboard(input, options),
  getCiv7TraditionsView: async (input, options) =>
    getCiv7TraditionsView(input, options),
  getCiv7BattlefieldScan: async (input, options) =>
    getCiv7BattlefieldScan(input, options) as Promise<
      Civ7ControlOrpcBattlefieldScanResult
    >,
  getCiv7DestinationAnalysis: async (input, options) =>
    getCiv7DestinationAnalysis(input, options) as Promise<
      Civ7ControlOrpcDestinationAnalysisResult
    >,
  getCiv7PlotSnapshot: async (input, options) =>
    getCiv7PlotSnapshot(input, options),
  getCiv7MapGrid: async (input, options) =>
    getCiv7MapGrid(input, options),
  getCiv7ReadyUnitView: async (input, options) =>
    getCiv7ReadyUnitView(input, options) as Promise<
      Civ7ControlOrpcReadyUnitViewResult
    >,
  getCiv7ReadyCityView: async (input, options) =>
    getCiv7ReadyCityView(input, options) as Promise<
      Civ7ControlOrpcReadyCityViewResult
    >,
  getCiv7SettlementRecommendations: async (input, options) =>
    getCiv7SettlementRecommendations(input, options) as Promise<
      Civ7ControlOrpcSettlementRecommendationsResult
    >,
  getCiv7TargetCandidates: async (input, options) =>
    getCiv7TargetCandidates(input, options) as Promise<
      Civ7ControlOrpcTargetCandidatesResult
    >,
  getCiv7TurnCompletionStatus: async (options) =>
    getCiv7TurnCompletionStatus(options) as Promise<
      Civ7ControlOrpcTurnCompletionStatusResult
    >,
  getCiv7VisibilitySummary: async (input, options) =>
    getCiv7VisibilitySummary(input, options),
  readCiv7DisplayQueue: async (options) =>
    readCiv7DisplayQueue(options),
  closeCiv7Displays: async (input, options) =>
    closeCiv7Displays(input, options),
  suspendCiv7DisplayQueue: async (options) =>
    suspendCiv7DisplayQueue(options),
  resumeCiv7DisplayQueue: async (options) =>
    resumeCiv7DisplayQueue(options),
  applyCiv7ExploreGrant: async (input, options) =>
    applyCiv7ExploreGrant(input, options),
  releaseCiv7ExploreGrant: async (input, options) =>
    releaseCiv7ExploreGrant(input, options),
};
