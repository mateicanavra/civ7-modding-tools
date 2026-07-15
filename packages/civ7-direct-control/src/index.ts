import { Civ7DirectControlError } from "./direct-control-error.js";
import { jsLiteral } from "./runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "./session/command-result.js";
import { executeCiv7TunerCommand } from "./session/execute.js";
import type { Civ7DirectControlOptions, Civ7TunerState } from "./session/types.js";
import { boundedInteger } from "./validation.js";

export type {
  Civ7ProcedureConsumerClass,
  Civ7ProcedureContextRequirement,
  Civ7ProcedureCoreCallContext,
  Civ7ProcedureCoreCallDiagnostics,
  Civ7ProcedureCoreCallEnvelope,
  Civ7ProcedureCoreCallOptions,
  Civ7ProcedureCoreCallResult,
  Civ7ProcedureCoreDescriptor,
  Civ7ProcedureCoreDescriptorErrorReason,
  Civ7ProcedureCoreErrorSummary,
  Civ7ProcedureCoreHandler,
  Civ7ProcedureCoreSummary,
  Civ7ProcedureCorrelationPolicy,
  Civ7ProcedureFamily,
  Civ7ProcedurePlayerScope,
  Civ7ProcedureProjection,
  Civ7ProcedureProofBoundary,
  Civ7ProcedureRisk,
  Civ7ProcedureSchemaArtifactMap,
  Civ7ProcedureSchemaReference,
  Civ7ProcedureSchemaResolution,
  Civ7ProcedureSchemaTechnology,
} from "./procedure-core.js";
export {
  assertCiv7ProcedureCoreDescriptor,
  Civ7ProcedureConsumerClassSchema,
  Civ7ProcedureContextRequirementSchema,
  Civ7ProcedureCoreCallContextSchema,
  Civ7ProcedureCoreCallDiagnosticsSchema,
  Civ7ProcedureCoreCallEnvelopeSchema,
  Civ7ProcedureCoreCallErrorEnvelopeSchema,
  Civ7ProcedureCoreCallResultSchema,
  Civ7ProcedureCoreCallSuccessEnvelopeSchema,
  Civ7ProcedureCoreDescriptorSchema,
  Civ7ProcedureCoreErrorReasonSchema,
  Civ7ProcedureCoreErrorSummarySchema,
  Civ7ProcedureCorrelationPolicySchema,
  Civ7ProcedureFamilySchema,
  Civ7ProcedurePlayerScopeSchema,
  Civ7ProcedureProjectionSchema,
  Civ7ProcedureProofBoundarySchema,
  Civ7ProcedureRiskSchema,
  Civ7ProcedureSchemaReferenceSchema,
  Civ7ProcedureSchemaTechnologySchema,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  isCiv7ProcedureCoreDescriptor,
  resolveCiv7ProcedureCoreSchemas,
  settleCiv7ProcedureCoreCall,
  summarizeCiv7ProcedureCoreDescriptor,
  summarizeCiv7ProcedureCoreError,
  validateCiv7ProcedureCoreInput,
  validateCiv7ProcedureCoreOutput,
} from "./procedure-core.js";

import { HARD_CIV7_MAP_GRID_MAX_PLOTS } from "./play/map/constants.js";
import { getCiv7GameInfoRows } from "./play/map/gameinfo.js";
import {
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7NativeRiverObjects,
  getCiv7PlotSnapshot,
} from "./play/map/reads.js";
import type {
  Civ7FullMapGridIdentityCheck,
  Civ7FullMapGridInput,
  Civ7FullMapGridResult,
  Civ7HiddenInfoPolicy,
  Civ7MapBounds,
  Civ7MapGridReadChunk,
  Civ7MapGridResult,
  Civ7MapLocation,
  Civ7MapSummaryResult,
  Civ7PlotSnapshot,
  Civ7PlotSnapshotField,
} from "./play/map/types.js";
import { validateMapBounds, validateMapLocation } from "./play/map/validation.js";
import { getCiv7CitySummary, getCiv7PlayerSummary, getCiv7UnitSummary } from "./play/summaries.js";
import { type Civ7RuntimeProbe, probeHelperSource } from "./runtime/probe.js";
import {
  type Civ7SavedGameConfigurationListInput,
  type Civ7SavedGameConfigurationListResult,
  listCiv7SavedGameConfigurations as listCiv7SavedGameConfigurationsFromModule,
} from "./setup/prepare.js";
import { getCiv7SetupMapRows, getCiv7SetupSnapshot } from "./setup/reads.js";

export type {
  Civ7CapabilityCatalog,
  Civ7CapabilityCatalogEntry,
  Civ7CapabilityCatalogOptions,
} from "./catalog/capabilities.js";
export {
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  createStaticCiv7CapabilityCatalog,
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
  generateCiv7CapabilityCatalog,
  loadCiv7OfficialResourceCapabilities,
} from "./catalog/capabilities.js";
export type { Civ7ComponentId } from "./civ7-component-id.js";
export {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
export type { Civ7DirectControlErrorCode } from "./direct-control-error.js";
export { Civ7DirectControlError } from "./direct-control-error.js";
export type {
  Civ7AutoplayActionResult,
  Civ7AutoplayOptions,
  Civ7AutoplayPollOptions,
  Civ7AutoplayStatusResult,
} from "./play/autoplay.js";
export {
  configureCiv7Autoplay,
  DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
  DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
  DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
  getCiv7AutoplayStatus,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "./play/autoplay.js";
export type {
  Civ7TownFocusChangeInput,
  Civ7TownFocusPostcondition,
  Civ7TownFocusPostconditionClassification,
  Civ7TownFocusRequestInput,
  Civ7TownFocusRequestKind,
  Civ7TownFocusRequestResult,
  Civ7TownFocusReviewInput,
} from "./play/city/town-focus-request.js";
export {
  requestCiv7TownFocus,
  requestCiv7TownFocusChange,
  requestCiv7TownFocusReviewCloseout,
} from "./play/city/town-focus-request.js";
export type { Civ7CitySummaryProcedureCallOptions } from "./play/city-summary-procedure";
export {
  Civ7CitySummaryProcedureDescriptor,
  Civ7CitySummaryProcedureSchemaArtifacts,
  callCiv7CitySummaryProcedure,
} from "./play/city-summary-procedure";
export type {
  Civ7CelebrationChoiceInput,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceKind,
  Civ7GovernmentChoicePostcondition,
  Civ7GovernmentChoicePostconditionClassification,
  Civ7GovernmentDomainChoiceInput,
  Civ7GovernmentDomainChoiceResult,
} from "./play/government/choice-request";
export {
  CIV7_GOVERNMENT_ACTIVATE_ACTION,
  requestCiv7CelebrationChoice,
  requestCiv7GovernmentChoice,
  requestCiv7GovernmentDomainChoice,
} from "./play/government/choice-request";
export {
  DEFAULT_CIV7_GAMEINFO_LIMIT,
  DEFAULT_CIV7_GAMEINFO_TABLES,
  DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  HARD_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
} from "./play/map/constants.js";
export type {
  Civ7GameInfoRowsInput,
  Civ7GameInfoRowsResult,
  GameInfoReadDependencies,
} from "./play/map/gameinfo.js";
export {
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
} from "./play/map/gameinfo.js";
export type { Civ7GameInfoRowsProcedureCallOptions } from "./play/map/gameinfo-procedure.js";
export {
  Civ7GameInfoRowsProcedureDescriptor,
  Civ7GameInfoRowsProcedureSchemaArtifacts,
  callCiv7GameInfoRowsProcedure,
} from "./play/map/gameinfo-procedure.js";
export type { Civ7MapGridProcedureCallOptions } from "./play/map/grid-procedure.js";
export {
  Civ7MapGridProcedureDescriptor,
  Civ7MapGridProcedureSchemaArtifacts,
  callCiv7MapGridProcedure,
} from "./play/map/grid-procedure.js";
export type { Civ7PlotSnapshotProcedureCallOptions } from "./play/map/plot-snapshot-procedure.js";
export {
  Civ7PlotSnapshotProcedureDescriptor,
  Civ7PlotSnapshotProcedureSchemaArtifacts,
  callCiv7PlotSnapshotProcedure,
} from "./play/map/plot-snapshot-procedure.js";
export type {
  MapGridReadDependencies,
  MapSummaryReadDependencies,
  PlotSnapshotReadDependencies,
} from "./play/map/reads.js";
export type { Civ7MapSummaryProcedureCallOptions } from "./play/map/summary-procedure.js";
export {
  Civ7MapSummaryProcedureDescriptor,
  Civ7MapSummaryProcedureSchemaArtifacts,
  callCiv7MapSummaryProcedure,
} from "./play/map/summary-procedure.js";
export type {
  Civ7FullMapGridIdentityCheck,
  Civ7FullMapGridInput,
  Civ7FullMapGridResult,
  Civ7HiddenInfoPolicy,
  Civ7MapBounds,
  Civ7MapGridInput,
  Civ7MapGridReadChunk,
  Civ7MapGridResult,
  Civ7MapLocation,
  Civ7MapSummaryOptions,
  Civ7MapSummaryResult,
  Civ7NativeRiverObjectSample,
  Civ7NativeRiverObjectsInput,
  Civ7NativeRiverObjectsResult,
  Civ7PlotSnapshot,
  Civ7PlotSnapshotField,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
} from "./play/map/types.js";
export {
  Civ7HiddenInfoPolicySchema,
  Civ7MapBoundsSchema,
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapLocationSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7NativeRiverObjectSampleSchema,
  Civ7NativeRiverObjectsInputSchema,
  Civ7NativeRiverObjectsResultSchema,
  Civ7PlotSnapshotFieldSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7PlotSnapshotSchema,
} from "./play/map/types.js";
export type {
  Civ7ExploreGrantInput,
  Civ7ExploreGrantResult,
  Civ7ExploreReleaseInput,
  Civ7ExploreReleaseResult,
  Civ7RevealMapResult,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
  VisibilityGrantDependencies,
  VisibilityReadDependencies,
} from "./play/map/visibility.js";
export {
  applyCiv7ExploreGrant,
  Civ7VisibilityGridStateSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  defaultExploreSettleMs,
  getCiv7VisibilitySummary,
  releaseCiv7ExploreGrant,
  revealCiv7MapForPlayer,
} from "./play/map/visibility.js";
export type { Civ7VisibilitySummaryProcedureCallOptions } from "./play/map/visibility-procedure.js";
export {
  Civ7VisibilitySummaryProcedureDescriptor,
  Civ7VisibilitySummaryProcedureSchemaArtifacts,
  callCiv7VisibilitySummaryProcedure,
} from "./play/map/visibility-procedure.js";
export type {
  Civ7AdvisorWarningViewedInput,
  Civ7AdvisorWarningViewedPostcondition,
  Civ7AdvisorWarningViewedPostconditionClassification,
  Civ7AdvisorWarningViewedResult,
} from "./play/notifications/advisor-warning-request.js";
export { requestCiv7AdvisorWarningViewed } from "./play/notifications/advisor-warning-request.js";
export type { Civ7NotificationDismissRequestProcedureCallOptions } from "./play/notifications/dismissal-procedure.js";
export {
  Civ7NotificationDismissRequestProcedureDescriptor,
  Civ7NotificationDismissRequestProcedureSchemaArtifacts,
  callCiv7NotificationDismissRequestProcedure,
} from "./play/notifications/dismissal-procedure.js";
export type {
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
  Civ7NotificationDismissInput,
  Civ7NotificationDismissRequestInput,
} from "./play/notifications/dismissal-request.js";
export {
  Civ7NotificationDismissalResultSchema,
  Civ7NotificationDismissInputSchema,
  Civ7NotificationDismissRequestInputSchema,
  getCiv7NotificationDismissal,
  requestCiv7NotificationDismissal,
} from "./play/notifications/dismissal-request.js";
export type {
  Civ7NotificationDismissalPostcondition,
  Civ7NotificationDismissalPostconditionClassification,
} from "./play/notifications/postconditions.js";
export {
  Civ7NotificationDismissalPostconditionClassificationSchema,
  Civ7NotificationDismissalPostconditionSchema,
  Civ7NotificationDismissalSummarySchema,
} from "./play/notifications/postconditions.js";
export type {
  Civ7PlayDecisionAction,
  Civ7PlayDecisionActionContract,
  Civ7PlayDecisionHint,
  Civ7PlayDecisionHintContract,
  Civ7PlayDecisionInput,
  Civ7PlayDecisionInputContract,
  Civ7PlayDecisionQueueItem,
  Civ7PlayDecisionQueueItemContract,
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationSummaryContract,
  Civ7PlayNotificationViewInput,
  Civ7PlayNotificationViewResult,
  Civ7PlayNotificationViewResultContract,
  PlayNotificationViewDependencies,
  PlayNotificationViewOptions,
} from "./play/notifications/view.js";
export {
  Civ7PlayDecisionActionSchema,
  Civ7PlayDecisionHintSchema,
  Civ7PlayDecisionInputSchema,
  Civ7PlayDecisionQueueItemSchema,
  Civ7PlayNotificationSummarySchema,
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewResultSchema,
  getCiv7PlayNotificationView,
} from "./play/notifications/view.js";
export type { Civ7PlayNotificationViewProcedureCallOptions } from "./play/notifications/view-procedure.js";
export {
  Civ7PlayNotificationViewProcedureDescriptor,
  Civ7PlayNotificationViewProcedureSchemaArtifacts,
  callCiv7PlayNotificationViewProcedure,
} from "./play/notifications/view-procedure.js";
export type {
  Civ7DiplomacyResponsePostcondition,
  Civ7DiplomacyResponsePostconditionClassification,
} from "./play/operations/diplomacy-postconditions.js";
export type {
  Civ7DiplomacyResponseCommandPayload,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "./play/operations/diplomacy-request.js";
export { requestCiv7DiplomacyResponse } from "./play/operations/diplomacy-request.js";
export type {
  Civ7CloseDisplaysInput,
  Civ7CloseDisplaysResult,
  Civ7ClosedDisplaysRow,
  Civ7DisplayQueueHoldResult,
  Civ7DisplayQueueSnapshot,
  Civ7DisplayRequest,
  DisplayQueueDependencies,
} from "./play/operations/display-queue.js";
export {
  CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL,
  CIV7_KNOWN_DISPLAY_CATEGORIES,
  Civ7CloseDisplaysResultSchema,
  Civ7ClosedDisplaysRowSchema,
  Civ7DisplayQueueSnapshotSchema,
  Civ7DisplayRequestSchema,
  closeCiv7Displays,
  ensureCiv7DisplayQueueBridge,
  readCiv7DisplayQueue,
  resumeCiv7DisplayQueue,
  suspendCiv7DisplayQueue,
} from "./play/operations/display-queue.js";
export type {
  Civ7FirstMeetResponsePostcondition,
  Civ7FirstMeetResponsePostconditionClassification,
} from "./play/operations/first-meet-postconditions";
export type {
  Civ7FirstMeetResponseInput,
  Civ7FirstMeetResponseResult,
} from "./play/operations/first-meet-request";
export { requestCiv7FirstMeetResponse } from "./play/operations/first-meet-request";
export type {
  Civ7NarrativeChoicePostcondition,
  Civ7NarrativeChoicePostconditionClassification,
} from "./play/operations/narrative-postconditions.js";
export type {
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "./play/operations/narrative-request.js";
export { requestCiv7NarrativeChoice } from "./play/operations/narrative-request.js";
export type {
  Civ7PopulationPlacementPostcondition,
  Civ7PopulationPlacementPostconditionClassification,
  Civ7PopulationPlacementPostconditionSnapshot,
} from "./play/operations/population-postconditions.js";
export type {
  Civ7ProductionChoiceCommandPayload,
  Civ7ProductionChoiceInput,
  Civ7ProductionChoiceRequestInput,
  Civ7ProductionChoiceResult,
} from "./play/operations/production-choice.js";
export {
  Civ7ProductionChoiceCommandPayloadSchema,
  Civ7ProductionChoiceInputSchema,
  Civ7ProductionChoiceRequestInputSchema,
  Civ7ProductionChoiceResultSchema,
  requestCiv7ProductionChoice,
} from "./play/operations/production-choice.js";
export type { Civ7ProductionChoiceRequestProcedureCallOptions } from "./play/operations/production-choice-procedure.js";
export {
  Civ7ProductionChoiceRequestProcedureDescriptor,
  Civ7ProductionChoiceRequestProcedureSchemaArtifacts,
  callCiv7ProductionChoiceRequestProcedure,
} from "./play/operations/production-choice-procedure.js";
export type { Civ7ProductionChoicePostconditionOutcome } from "./play/operations/production-choice-proof";
export {
  productionChoicePostconditionConfirmed,
  productionChoicePostconditionOutcome,
  productionChoiceRequestVerified,
} from "./play/operations/production-choice-proof";
export type {
  Civ7ProductionPostcondition,
  Civ7ProductionPostconditionClassification,
  Civ7ProductionPostconditionSnapshot,
} from "./play/operations/production-postconditions.js";
export {
  Civ7ProductionPostconditionClassificationSchema,
  Civ7ProductionPostconditionSchema,
  Civ7ProductionPostconditionSnapshotSchema,
} from "./play/operations/production-postconditions.js";
export type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationTarget,
  Civ7OperationValidationResult,
} from "./play/operations/types.js";
export type {
  Civ7UnitOperationPostcondition,
  Civ7UnitOperationPostconditionClassification,
  Civ7UnitOperationPostconditionSnapshot,
} from "./play/operations/unit-postconditions.js";
export type {
  Civ7UnitTargetActionCandidate,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionRequestInput,
  Civ7UnitTargetActionResult,
} from "./play/operations/unit-target-action.js";
export {
  Civ7UnitTargetActionCandidateSchema,
  Civ7UnitTargetActionInputSchema,
  Civ7UnitTargetActionRequestInputSchema,
  Civ7UnitTargetActionResultSchema,
  Civ7UnitTargetActionVerificationSchema,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  getCiv7UnitTargetAction,
  requestCiv7UnitTargetAction,
} from "./play/operations/unit-target-action.js";
export type { Civ7UnitTargetActionRequestProcedureCallOptions } from "./play/operations/unit-target-action-procedure.js";
export {
  Civ7UnitTargetActionRequestProcedureDescriptor,
  Civ7UnitTargetActionRequestProcedureSchemaArtifacts,
  callCiv7UnitTargetActionRequestProcedure,
} from "./play/operations/unit-target-action-procedure.js";
export type { Civ7OperationRequestResult } from "./play/operations/validate-request.js";
export {
  canStartCiv7CityCommand,
  canStartCiv7CityOperation,
  canStartCiv7PlayerOperation,
  canStartCiv7UnitCommand,
  canStartCiv7UnitOperation,
  requestCiv7CityCommand,
  requestCiv7CityOperation,
  requestCiv7PlayerOperation,
  requestCiv7UnitCommand,
  requestCiv7UnitOperation,
} from "./play/operations/validate-request.js";
export type { Civ7PlayerSummaryProcedureCallOptions } from "./play/player-summary-procedure";
export {
  Civ7PlayerSummaryProcedureDescriptor,
  Civ7PlayerSummaryProcedureSchemaArtifacts,
  callCiv7PlayerSummaryProcedure,
} from "./play/player-summary-procedure";
export type {
  Civ7CultureChoicePostconditionClassification,
  Civ7ProgressionChoiceNotification,
  Civ7ProgressionChoiceNotificationView,
  Civ7ProgressionChoicePostcondition,
  Civ7TechnologyChoicePostconditionClassification,
} from "./play/progression/choice-postconditions.js";
export {
  cultureChoicePostcondition,
  findCultureChoiceNotification,
  findTechnologyChoiceNotification,
  technologyChoicePostcondition,
} from "./play/progression/choice-postconditions.js";
export type {
  Civ7CultureChoiceCloseoutInput,
  Civ7CultureChoiceCloseoutResult,
} from "./play/progression/culture.js";
export { requestCiv7CultureChoiceCloseout } from "./play/progression/culture.js";
export type {
  Civ7AttributePurchaseInput,
  Civ7AttributeReviewInput,
  Civ7ProgressionPlayerChoiceInput,
  Civ7ProgressionPlayerChoiceKind,
  Civ7ProgressionPlayerChoicePostcondition,
  Civ7ProgressionPlayerChoicePostconditionClassification,
  Civ7ProgressionPlayerChoiceResult,
  Civ7TraditionChangeInput,
  Civ7TraditionReviewInput,
} from "./play/progression/player-choice-request";
export {
  requestCiv7AttributePurchase,
  requestCiv7AttributeReviewCloseout,
  requestCiv7ProgressionPlayerChoice,
  requestCiv7TraditionChange,
  requestCiv7TraditionReviewCloseout,
} from "./play/progression/player-choice-request";
export type { Civ7ProgressDashboardProcedureCallOptions } from "./play/progression/progress-dashboard-procedure.js";
export {
  Civ7ProgressDashboardProcedureDescriptor,
  Civ7ProgressDashboardProcedureSchemaArtifacts,
  callCiv7ProgressDashboardProcedure,
} from "./play/progression/progress-dashboard-procedure.js";
export type {
  Civ7ProgressDashboardInput,
  Civ7ProgressDashboardLegacyPath,
  Civ7ProgressDashboardResult,
  Civ7TraditionAction,
  Civ7TraditionActionKind,
  Civ7TraditionSummary,
  Civ7TraditionsViewInput,
  Civ7TraditionsViewResult,
  ProgressDashboardDependencies,
  TraditionsViewDependencies,
} from "./play/progression/reads.js";
export {
  Civ7ProgressDashboardInputSchema,
  Civ7ProgressDashboardLegacyPathSchema,
  Civ7ProgressDashboardMilestoneSchema,
  Civ7ProgressDashboardResultSchema,
  Civ7TraditionActionKindSchema,
  Civ7TraditionActionSchema,
  Civ7TraditionSummarySchema,
  Civ7TraditionsViewInputSchema,
  Civ7TraditionsViewResultSchema,
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
} from "./play/progression/reads.js";
export type {
  Civ7ProgressionTargetInput,
  Civ7ProgressionTargetKind,
  Civ7ProgressionTargetPostcondition,
  Civ7ProgressionTargetPostconditionClassification,
  Civ7ProgressionTargetResult,
} from "./play/progression/target-request.js";
export {
  requestCiv7CultureTarget,
  requestCiv7ProgressionTarget,
  requestCiv7TechnologyTarget,
} from "./play/progression/target-request.js";
export type {
  Civ7TechnologyChoiceCloseoutInput,
  Civ7TechnologyChoiceCloseoutResult,
} from "./play/progression/technology.js";
export { requestCiv7TechnologyChoiceCloseout } from "./play/progression/technology.js";
export type { Civ7TraditionsViewProcedureCallOptions } from "./play/progression/traditions-procedure.js";
export {
  Civ7TraditionsViewProcedureDescriptor,
  Civ7TraditionsViewProcedureSchemaArtifacts,
  callCiv7TraditionsViewProcedure,
} from "./play/progression/traditions-procedure.js";
export type {
  Civ7ReadyCityOperationCandidate,
  Civ7ReadyCityPopulationPlacement,
  Civ7ReadyCityProductionCandidate,
  Civ7ReadyCityTownFocusOption,
  Civ7ReadyCityViewInput,
  Civ7ReadyCityViewResult,
  ReadyCityViewDependencies,
} from "./play/ready/city.js";
export {
  Civ7ReadyCityOperationCandidateSchema,
  Civ7ReadyCityPopulationPlacementSchema,
  Civ7ReadyCityProductionCandidateSchema,
  Civ7ReadyCityTownFocusOptionSchema,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  getCiv7ReadyCityView,
} from "./play/ready/city.js";
export type { Civ7ReadyCityViewProcedureCallOptions } from "./play/ready/city-procedure.js";
export {
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
  callCiv7ReadyCityViewProcedure,
} from "./play/ready/city-procedure.js";
export type {
  Civ7UnitMovePreviewInput,
  Civ7UnitMovePreviewRelationshipPolicy,
  Civ7UnitMovePreviewResult,
  UnitMovePreviewDependencies,
} from "./play/ready/move-preview.js";
export {
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewRelationshipPolicySchema,
  Civ7UnitMovePreviewResultSchema,
  getCiv7UnitMovePreview,
} from "./play/ready/move-preview.js";
export type { Civ7UnitMovePreviewProcedureCallOptions } from "./play/ready/move-preview-procedure.js";
export {
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  callCiv7UnitMovePreviewProcedure,
} from "./play/ready/move-preview-procedure.js";
export type {
  Civ7ReadyUnitNearbyPlot,
  Civ7ReadyUnitOperationCandidate,
  Civ7ReadyUnitPromotionReadiness,
  Civ7ReadyUnitViewInput,
  Civ7ReadyUnitViewResult,
  ReadyUnitViewDependencies,
} from "./play/ready/unit.js";
export {
  Civ7ReadyUnitNearbyPlotSchema,
  Civ7ReadyUnitOperationCandidateSchema,
  Civ7ReadyUnitPromotionReadinessSchema,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  getCiv7ReadyUnitView,
} from "./play/ready/unit.js";
export type { Civ7ReadyUnitViewProcedureCallOptions } from "./play/ready/unit-procedure.js";
export {
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  callCiv7ReadyUnitViewProcedure,
} from "./play/ready/unit-procedure.js";
export type {
  Civ7StartPositionPlayer,
  Civ7StartPositionsResult,
} from "./play/start-positions.js";
export {
  CIV7_START_POSITIONS_METHOD,
  Civ7StartPositionPlayerSchema,
  Civ7StartPositionsResultSchema,
  readCiv7StartPositions,
} from "./play/start-positions.js";
export type {
  Civ7CitySummary,
  Civ7CitySummaryDependencies,
  Civ7CitySummaryInput,
  Civ7CitySummaryResult,
  Civ7PlayerSummary,
  Civ7PlayerSummaryDependencies,
  Civ7PlayerSummaryInput,
  Civ7PlayerSummaryResult,
  Civ7UnitSummary,
  Civ7UnitSummaryDependencies,
  Civ7UnitSummaryInput,
  Civ7UnitSummaryResult,
} from "./play/summaries.js";
export {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  Civ7CitySummarySchema,
  Civ7PlayerSummaryInputSchema,
  Civ7PlayerSummaryResultSchema,
  Civ7PlayerSummarySchema,
  Civ7UnitSummaryInputSchema,
  Civ7UnitSummaryResultSchema,
  Civ7UnitSummarySchema,
} from "./play/summaries.js";
export type {
  BattlefieldScanDependencies,
  Civ7BattlefieldScanInput,
  Civ7BattlefieldScanResult,
} from "./play/tactical/battlefield.js";
export {
  Civ7BattlefieldRelationshipLabelPolicySchema,
  Civ7BattlefieldScanCitySchema,
  Civ7BattlefieldScanInputSchema,
  Civ7BattlefieldScanOwnerSchema,
  Civ7BattlefieldScanPointOfInterestSchema,
  Civ7BattlefieldScanResultSchema,
  Civ7BattlefieldScanUnitSchema,
  getCiv7BattlefieldScan,
} from "./play/tactical/battlefield.js";
export type { Civ7BattlefieldScanProcedureCallOptions } from "./play/tactical/battlefield-procedure.js";
export {
  Civ7BattlefieldScanProcedureDescriptor,
  Civ7BattlefieldScanProcedureSchemaArtifacts,
  callCiv7BattlefieldScanProcedure,
} from "./play/tactical/battlefield-procedure.js";
export type {
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResult,
  DestinationAnalysisDependencies,
} from "./play/tactical/destination.js";
export {
  Civ7DestinationAnalysisCitySchema,
  Civ7DestinationAnalysisCorridorSchema,
  Civ7DestinationAnalysisCorridorUnitSchema,
  Civ7DestinationAnalysisDestinationUnitSchema,
  Civ7DestinationAnalysisInputSchema,
  Civ7DestinationAnalysisPointOfInterestSchema,
  Civ7DestinationAnalysisPressureSchema,
  Civ7DestinationAnalysisRelationshipLabelPolicySchema,
  Civ7DestinationAnalysisResultSchema,
  getCiv7DestinationAnalysis,
} from "./play/tactical/destination.js";
export type { Civ7DestinationAnalysisProcedureCallOptions } from "./play/tactical/destination-procedure.js";
export {
  Civ7DestinationAnalysisProcedureDescriptor,
  Civ7DestinationAnalysisProcedureSchemaArtifacts,
  callCiv7DestinationAnalysisProcedure,
} from "./play/tactical/destination-procedure.js";
export type {
  Civ7SettlementRecommendation,
  Civ7SettlementRecommendationFactor,
  Civ7SettlementRecommendationInput,
  Civ7SettlementRecommendationOrigin,
  Civ7SettlementRecommendationResult,
  SettlementRecommendationDependencies,
} from "./play/tactical/settlement.js";
export {
  Civ7SettlementRecommendationFactorSchema,
  Civ7SettlementRecommendationInputSchema,
  Civ7SettlementRecommendationOriginSchema,
  Civ7SettlementRecommendationResultSchema,
  Civ7SettlementRecommendationSchema,
  Civ7SettlementSuggestionSchema,
  getCiv7SettlementRecommendations,
} from "./play/tactical/settlement.js";
export type { Civ7SettlementRecommendationsProcedureCallOptions } from "./play/tactical/settlement-procedure.js";
export {
  Civ7SettlementRecommendationsProcedureDescriptor,
  Civ7SettlementRecommendationsProcedureSchemaArtifacts,
  callCiv7SettlementRecommendationsProcedure,
} from "./play/tactical/settlement-procedure.js";
export type {
  Civ7TargetCandidate,
  Civ7TargetCandidatesInput,
  Civ7TargetCandidatesResult,
  TargetCandidatesDependencies,
} from "./play/tactical/target-candidates.js";
export {
  Civ7TargetCandidateApproachSchema,
  Civ7TargetCandidateSchema,
  Civ7TargetCandidatesInputSchema,
  Civ7TargetCandidatesRelationshipLabelPolicySchema,
  Civ7TargetCandidatesResultSchema,
  getCiv7TargetCandidates,
} from "./play/tactical/target-candidates.js";
export type { Civ7TargetCandidatesProcedureCallOptions } from "./play/tactical/target-candidates-procedure.js";
export {
  Civ7TargetCandidatesProcedureDescriptor,
  Civ7TargetCandidatesProcedureSchemaArtifacts,
  callCiv7TargetCandidatesProcedure,
} from "./play/tactical/target-candidates-procedure.js";
export type {
  Civ7TurnCompletionActionResult,
  Civ7TurnCompletionBlockedResult,
  Civ7TurnCompletionRequestResult,
  Civ7TurnCompletionStatusDependencies,
  Civ7TurnCompletionStatusInput,
  Civ7TurnCompletionStatusResult,
} from "./play/turn-completion.js";
export {
  Civ7TurnCompletionStatusInputSchema,
  Civ7TurnCompletionStatusResultSchema,
  getCiv7TurnCompletionStatus,
  requestCiv7TurnComplete,
  sendCiv7TurnComplete,
  sendCiv7TurnUnready,
} from "./play/turn-completion.js";
export type { Civ7TurnCompletionStatusProcedureCallOptions } from "./play/turn-completion-procedure.js";
export {
  Civ7TurnCompletionStatusProcedureDescriptor,
  Civ7TurnCompletionStatusProcedureSchemaArtifacts,
  callCiv7TurnCompletionStatusProcedure,
} from "./play/turn-completion-procedure.js";
export type { Civ7UnitSummaryProcedureCallOptions } from "./play/unit-summary-procedure.js";
export {
  Civ7UnitSummaryProcedureDescriptor,
  Civ7UnitSummaryProcedureSchemaArtifacts,
  callCiv7UnitSummaryProcedure,
} from "./play/unit-summary-procedure.js";
export type {
  CameraFocusDependencies,
  Civ7CameraFocusInput,
  Civ7CameraFocusResult,
  Civ7CameraStateSnapshot,
} from "./play/view/camera.js";
export {
  Civ7CameraFocusInputSchema,
  Civ7CameraFocusOptionsSchema,
  Civ7CameraFocusResultSchema,
  Civ7CameraStateSnapshotSchema,
  focusCiv7CameraOnPlot,
} from "./play/view/camera.js";
export type {
  Civ7CleanFrameEnterInput,
  Civ7CleanFrameEnterResult,
  Civ7CleanFrameExitResult,
  CleanFrameDependencies,
} from "./play/view/clean-frame.js";
export {
  CIV7_CLEAN_FRAME_HIDDEN_WORLD_RULES,
  CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL,
  CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL,
  CIV7_CLEAN_FRAME_VIEW_NAME,
  CIV7_VIEW_MANAGER_BRIDGE_GLOBAL,
  Civ7CleanFrameEnterResultSchema,
  Civ7CleanFrameExitResultSchema,
  ensureCiv7ViewManagerBridge,
  enterCiv7CleanFrame,
  exitCiv7CleanFrame,
} from "./play/view/clean-frame.js";
export type {
  Civ7CaptureWindowRow,
  Civ7WindowShotCaptureInput,
  Civ7WindowShotCaptureResult,
  WindowShotDependencies,
} from "./play/view/window-shot.js";
export {
  CIV7_WINDOW_SHOT_SWIFT_SOURCE,
  Civ7CaptureWindowRowSchema,
  Civ7WindowShotCaptureResultSchema,
  Civ7WindowShotFileSchema,
  captureCiv7WindowShot,
  DEFAULT_CIV7_WINDOW_MATCH,
  ensureCiv7WindowShotHelper,
} from "./play/view/window-shot.js";
export {
  assessCiv7SignedIntSeed,
  CIV7_SIGNED_INT_SEED_MAX,
  CIV7_SIGNED_INT_SEED_MIN,
} from "./policy/setup.js";
export type {
  Civ7AdvisorWarningProofOutcome,
  Civ7AdvisorWarningProofPostcondition,
} from "./proof/advisor-warning-proof-policy.js";
export { advisorWarningProofPostcondition } from "./proof/advisor-warning-proof-policy.js";
export {
  diplomacyResponseProofOutcome,
  diplomacyResponseProofPostcondition,
} from "./proof/diplomacy-response-proof-policy.js";
export {
  firstMeetResponseProofOutcome,
  firstMeetResponseProofPostcondition,
} from "./proof/first-meet-response-proof-policy";
export {
  governmentChoiceProofOutcome,
  governmentChoiceProofPostcondition,
} from "./proof/government-choice-proof-policy";
export type {
  FileSnapshot,
  FreshLogMarkerProof,
} from "./proof/log-markers.js";
export {
  DEFAULT_CIV7_SCRIPTING_LOG,
  logTextFromSnapshot,
  snapshotFile,
  waitForFreshLogMarkers,
} from "./proof/log-markers.js";
export {
  narrativeChoiceProofOutcome,
  narrativeChoiceProofPostcondition,
} from "./proof/narrative-choice-proof-policy.js";
export {
  notificationDismissalProofOutcome,
  notificationDismissalProofPostcondition,
} from "./proof/notification-dismissal-proof-policy.js";
export type { Civ7PopulationPlacementProofSource } from "./proof/population-placement-proof-policy.js";
export {
  populationPlacementProofOutcome,
  populationPlacementProofPostcondition,
} from "./proof/population-placement-proof-policy.js";
export {
  progressionPlayerChoiceProofOutcome,
  progressionPlayerChoiceProofPostcondition,
} from "./proof/progression-player-choice-proof-policy";
export {
  progressionTargetProofOutcome,
  progressionTargetProofPostcondition,
} from "./proof/progression-target-proof-policy.js";
export type {
  Civ7TownFocusProofOutcome,
  Civ7TownFocusProofPostcondition,
} from "./proof/town-focus-proof-policy.js";
export {
  townFocusProofOutcome,
  townFocusProofPostcondition,
} from "./proof/town-focus-proof-policy.js";
export type { Civ7TurnCompletionPostconditionClassification } from "./proof/turn-completion-proof-policy";
export {
  turnCompletionPostconditionConfirmed,
  turnCompletionProofOutcome,
  turnCompletionProofPostcondition,
} from "./proof/turn-completion-proof-policy";
export type { Civ7UnitTargetActionVerification } from "./proof/unit-target-proof-policy";
export {
  unitTargetProofOutcome,
  unitTargetProofPostcondition,
} from "./proof/unit-target-proof-policy";
export type {
  AppUiSnapshotDependencies,
  Civ7AppUiSnapshot,
  Civ7AppUiSnapshotInput,
  Civ7AppUiSnapshotResult,
} from "./runtime/app-ui-snapshot.js";
export {
  Civ7AppUiSnapshotInputSchema,
  Civ7AppUiSnapshotResultSchema,
  Civ7AppUiSnapshotSchema,
  getCiv7AppUiSnapshot,
} from "./runtime/app-ui-snapshot.js";
export type { Civ7AppUiSnapshotProcedureCallOptions } from "./runtime/app-ui-snapshot-procedure.js";
export {
  Civ7AppUiSnapshotProcedureDescriptor,
  Civ7AppUiSnapshotProcedureSchemaArtifacts,
  callCiv7AppUiSnapshotProcedure,
} from "./runtime/app-ui-snapshot-procedure.js";
export type {
  Civ7RuntimeApiInspection,
  Civ7RuntimeApiMethod,
  Civ7RuntimeApiRoot,
} from "./runtime/inspection.js";
export { inspectCiv7RuntimeApi } from "./runtime/inspection.js";
export {
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_ROOT_MAX_KEYS,
  DEFAULT_CIV7_ROOT_MAX_METHODS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
} from "./runtime/inspection-constants.js";
export type {
  Civ7PlayableStatusInput,
  Civ7PlayableStatusResult,
  PlayableStatusDependencies,
} from "./runtime/playable-status.js";
export {
  Civ7PlayableReadinessSchema,
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusResultSchema,
  getCiv7PlayableStatus,
} from "./runtime/playable-status.js";
export type { Civ7PlayableStatusProcedureCallOptions } from "./runtime/playable-status-procedure.js";
export {
  Civ7PlayableStatusProcedureDescriptor,
  Civ7PlayableStatusProcedureSchemaArtifacts,
  callCiv7PlayableStatusProcedure,
} from "./runtime/playable-status-procedure.js";
export type { Civ7RuntimeProbe } from "./runtime/probe.js";
export type {
  Civ7RootInspectionInput,
  Civ7RootInspectionResult,
} from "./runtime/root-inspection.js";
export { inspectCiv7Root } from "./runtime/root-inspection.js";
export type {
  Civ7TunerHealthInput,
  Civ7TunerHealthResult,
  Civ7TunerHealthSnapshot,
  TunerHealthDependencies,
  TunerHealthSessionDependencies,
} from "./runtime/tuner-health.js";
export {
  Civ7TunerHealthInputSchema,
  Civ7TunerHealthResultSchema,
  Civ7TunerHealthSnapshotSchema,
  checkCiv7TunerHealth,
  waitForCiv7TunerReady,
} from "./runtime/tuner-health.js";
export type { Civ7TunerHealthProcedureCallOptions } from "./runtime/tuner-health-procedure.js";
export {
  Civ7TunerHealthProcedureDescriptor,
  Civ7TunerHealthProcedureSchemaArtifacts,
  callCiv7TunerHealthProcedure,
} from "./runtime/tuner-health-procedure.js";
export { resolveCiv7DirectControlConfig } from "./session/config.js";
export {
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
} from "./session/constants.js";
export { discoverCiv7DirectControlEndpoint } from "./session/discovery.js";
export {
  executeCiv7AppUiCommand,
  executeCiv7Command,
  executeCiv7TunerCommand,
  queryCiv7TunerStates,
} from "./session/execute.js";
export type { Civ7TunerFrame } from "./session/framing.js";
export {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
} from "./session/framing.js";
export {
  checkCiv7DirectControlHealth,
  waitForCiv7DirectControl,
} from "./session/health.js";
export { createCiv7ControlRequestId } from "./session/request-id.js";
export { Civ7DirectControlSession } from "./session/session.js";
export { selectCiv7TunerState } from "./session/state.js";
export type {
  Civ7CommandResult,
  Civ7DirectControlEndpoint,
  Civ7DirectControlHealth,
  Civ7DirectControlOptions,
  Civ7DirectControlSessionStats,
  Civ7TunerState,
  Civ7TunerStateRole,
  Civ7TunerStateSelection,
} from "./session/types.js";
export type { Civ7UiLoadingStateName } from "./setup/constants.js";
export {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
  DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
} from "./setup/constants.js";
export type {
  Civ7PlayerSetupOptions,
  Civ7SavedGameConfiguration,
  Civ7SavedGameConfigurationListInput,
  Civ7SavedGameConfigurationListResult,
  Civ7SavedGameConfigurationLoadRequestResult,
  Civ7SavedGameConfigurationRef,
  Civ7SavedGameConfigurationSummary,
  Civ7SetupApplicationResult,
  Civ7SetupOptionValue,
  Civ7SinglePlayerSetupValues,
  Civ7TargetModReconciliationResult,
} from "./setup/prepare.js";
export {
  applyCiv7SinglePlayerSetup,
  assertPreparedSetupMatches,
  DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR,
  reconcileCiv7RequiredTargetMod,
  requestCiv7SavedGameConfigurationLoad,
} from "./setup/prepare.js";
export type {
  Civ7PlayerSetupParameterSnapshot,
  Civ7SetupMapRow,
  Civ7SetupMapRowsInput,
  Civ7SetupMapRowsResult,
  Civ7SetupParameterSnapshot,
  Civ7SetupParameterValue,
  Civ7SetupPhase,
  Civ7SetupShellAdmissionPolicy,
  Civ7SetupShellAdmissionResult,
  Civ7SetupSnapshot,
  Civ7SetupSnapshotResult,
  Civ7SetupUiReloadResult,
} from "./setup/reads.js";
export {
  admitCiv7SetupShell,
  reloadCiv7SetupUiInShell,
} from "./setup/reads.js";
export type { Civ7BeginGameResult, Civ7RestartAndBeginResult } from "./setup/restart.js";
export {
  beginCiv7Game,
  restartCiv7Game,
  restartCiv7GameAndBegin,
} from "./setup/restart.js";
export type { Civ7SinglePlayerHostResult } from "./setup/start.js";
export { hostPreparedCiv7SinglePlayerGame } from "./setup/start.js";
export {
  getCiv7CitySummary,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7NativeRiverObjects,
  getCiv7PlayerSummary,
  getCiv7PlotSnapshot,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  getCiv7UnitSummary,
};
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;

export type Civ7ResourcePlacementFeasibilityCellInput = Readonly<
  Civ7MapLocation & {
    resourceTypes: ReadonlyArray<number>;
  }
>;

export type Civ7ResourcePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxResourceTypesPerCell?: number;
  ignoreWeight?: boolean;
}>;

export type Civ7ResourcePlacementFeasibilityCell = Readonly<{
  location: Readonly<
    Civ7MapLocation & {
      index: Civ7RuntimeProbe<number>;
    }
  >;
  resourceTypes: ReadonlyArray<number>;
  omittedResourceTypes: number;
  feasibility: Readonly<Record<string, Civ7RuntimeProbe<boolean>>>;
}>;

export type Civ7ResourcePlacementFeasibilityResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  ignoreWeight: boolean;
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCell>;
}>;

export type Civ7FeaturePlacementFeasibilityCellInput = Readonly<
  Civ7MapLocation & {
    featureTypes: ReadonlyArray<number>;
  }
>;

export type Civ7FeaturePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxFeatureTypesPerCell?: number;
}>;

export type Civ7FeaturePlacementFeasibilityCell = Readonly<{
  location: Readonly<
    Civ7MapLocation & {
      index: Civ7RuntimeProbe<number>;
    }
  >;
  featureTypes: ReadonlyArray<number>;
  omittedFeatureTypes: number;
  feasibility: Readonly<Record<string, Civ7RuntimeProbe<boolean>>>;
}>;

export type Civ7FeaturePlacementFeasibilityResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCell>;
}>;

export type Civ7ResourceBuilderCutResource = Readonly<{
  hash: number;
  resourceType?: number;
  resourceTypeName?: string;
  row?: unknown;
}>;

export type Civ7ResourceBuilderDiagnosticsResource = Readonly<{
  resourceType: number;
  row: Civ7RuntimeProbe<unknown>;
  hash: Civ7RuntimeProbe<number>;
  count: Civ7RuntimeProbe<number>;
  landmass: Civ7RuntimeProbe<number>;
  validForAge: Civ7RuntimeProbe<boolean>;
  requiredForAge: Civ7RuntimeProbe<boolean>;
  ignoringWeightForRiverPlacement: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7ResourceBuilderDiagnosticsCellResource = Readonly<{
  canHaveResource: Readonly<{
    strict: Civ7RuntimeProbe<boolean>;
    ignoreWeight: Civ7RuntimeProbe<boolean>;
  }>;
  resourceLandmassAtCell: Civ7RuntimeProbe<number>;
  bestMapResourceCutHashes: Civ7RuntimeProbe<ReadonlyArray<number>>;
  bestMapResourceCuts: Civ7RuntimeProbe<ReadonlyArray<Civ7ResourceBuilderCutResource>>;
}>;

export type Civ7ResourceBuilderDiagnosticsCell = Readonly<{
  location: Readonly<
    Civ7MapLocation & {
      index: Civ7RuntimeProbe<number>;
    }
  >;
  resourceTypes: ReadonlyArray<number>;
  omittedResourceTypes: number;
  resources: Readonly<Record<string, Civ7ResourceBuilderDiagnosticsCellResource>>;
}>;

export type Civ7ResourceBuilderDiagnosticsInput = Readonly<{
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
  resourceTypes?: ReadonlyArray<number>;
  maxCells?: number;
  maxResourceTypesPerCell?: number;
}>;

export type Civ7ResourceBuilderDiagnosticsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  resources: ReadonlyArray<Civ7ResourceBuilderDiagnosticsResource>;
  cells: ReadonlyArray<Civ7ResourceBuilderDiagnosticsCell>;
}>;

export async function getCiv7ResourcePlacementFeasibility(
  input: Civ7ResourcePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ResourcePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells"
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell"
  );
  validateResourcePlacementFeasibilityInput(input, maxCells, maxResourceTypesPerCell);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildResourcePlacementFeasibilityCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        resourceTypes: cell.resourceTypes.slice(0, maxResourceTypesPerCell),
        requestedResourceTypeCount: cell.resourceTypes.length,
      })),
      requestedCellCount: input.cells.length,
      maxResourceTypesPerCell,
      ignoreWeight: input.ignoreWeight === true,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ResourcePlacementFeasibilityResult>(
    result,
    "Civ7 resource placement feasibility"
  );
}

export async function getCiv7FeaturePlacementFeasibility(
  input: Civ7FeaturePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7FeaturePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    "maxCells"
  );
  const maxFeatureTypesPerCell = boundedInteger(
    input.maxFeatureTypesPerCell ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxFeatureTypesPerCell"
  );
  validateFeaturePlacementFeasibilityInput(input, maxCells, maxFeatureTypesPerCell);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildFeaturePlacementFeasibilityCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        featureTypes: cell.featureTypes.slice(0, maxFeatureTypesPerCell),
        requestedFeatureTypeCount: cell.featureTypes.length,
      })),
      requestedCellCount: input.cells.length,
      maxFeatureTypesPerCell,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7FeaturePlacementFeasibilityResult>(
    result,
    "Civ7 feature placement feasibility"
  );
}

export async function getCiv7ResourceBuilderDiagnostics(
  input: Civ7ResourceBuilderDiagnosticsInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ResourceBuilderDiagnosticsResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells"
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell"
  );
  validateResourcePlacementFeasibilityInput(input, maxCells, maxResourceTypesPerCell);
  const requestedResourceTypes = uniqueBoundedResourceTypes(input.resourceTypes ?? []);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildResourceBuilderDiagnosticsCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        resourceTypes: cell.resourceTypes.slice(0, maxResourceTypesPerCell),
        requestedResourceTypeCount: cell.resourceTypes.length,
      })),
      resourceTypes: requestedResourceTypes,
      requestedCellCount: input.cells.length,
      maxResourceTypesPerCell,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ResourceBuilderDiagnosticsResult>(
    result,
    "Civ7 ResourceBuilder diagnostics"
  );
}

export async function getCiv7FullMapGrid(
  input: Civ7FullMapGridInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7FullMapGridResult> {
  const summary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  const mapWidth = requiredProbeNumber(summary.map.width, "GameplayMap.getGridWidth");
  const mapHeight = requiredProbeNumber(summary.map.height, "GameplayMap.getGridHeight");
  const bounds = input.bounds ?? { x: 0, y: 0, width: mapWidth, height: mapHeight };
  validateMapBounds(bounds);
  const maxPlotsPerRead = boundedInteger(
    input.maxPlotsPerRead ?? HARD_CIV7_MAP_GRID_MAX_PLOTS,
    1,
    HARD_CIV7_MAP_GRID_MAX_PLOTS,
    "maxPlotsPerRead"
  );
  const readBounds = planCiv7MapGridReadBounds(bounds, maxPlotsPerRead);
  const fields = normalizePlotFields(input.fields);
  const plots: Civ7PlotSnapshot[] = [];
  const chunks: Civ7MapGridReadChunk[] = [];
  let omitted = 0;
  let hiddenInfoPolicy: Civ7HiddenInfoPolicy =
    input.playerId === undefined
      ? "not-player-scoped"
      : input.includeHidden === true
        ? "include-hidden"
        : "visibility-filtered";
  let lastGrid: Civ7MapGridResult | undefined;

  for (const chunkBounds of readBounds) {
    const grid = await getCiv7MapGrid(
      {
        bounds: chunkBounds,
        fields,
        ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
        ...(input.includeHidden === undefined ? {} : { includeHidden: input.includeHidden }),
        maxPlots: maxPlotsPerRead,
      },
      options
    );
    lastGrid = grid;
    hiddenInfoPolicy = grid.hiddenInfoPolicy;
    omitted += grid.omitted;
    chunks.push({
      bounds: chunkBounds,
      plotCount: grid.plotCount,
      omitted: grid.omitted,
    });
    plots.push(...grid.plots);
  }

  plots.sort((a, b) => {
    const ai = probeNumberOr(a.location.index, Number.MAX_SAFE_INTEGER);
    const bi = probeNumberOr(b.location.index, Number.MAX_SAFE_INTEGER);
    return ai - bi;
  });
  const postReadSummary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  const identityCheck = assertFullMapGridSummaryIdentityStable(summary, postReadSummary);

  return {
    host: lastGrid?.host ?? summary.host,
    port: lastGrid?.port ?? summary.port,
    state: lastGrid?.state ?? summary.state,
    bounds,
    fields,
    plotCount: bounds.width * bounds.height,
    omitted,
    hiddenInfoPolicy,
    map: { width: mapWidth, height: mapHeight },
    summary,
    postReadSummary,
    identityCheck,
    chunks,
    plots,
  };
}

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {}
): Promise<Civ7SavedGameConfigurationListResult> {
  return await listCiv7SavedGameConfigurationsFromModule(input, { boundedInteger });
}

function buildResourcePlacementFeasibilityCommand(input: {
  cells: ReadonlyArray<
    Civ7ResourcePlacementFeasibilityCellInput & {
      requestedResourceTypeCount: number;
    }
  >;
  requestedCellCount: number;
  maxResourceTypesPerCell: number;
  ignoreWeight: boolean;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const rb = typeof ResourceBuilder !== "undefined" ? ResourceBuilder : undefined;
    const canHaveResource = (x, y, resourceType) => {
      if (!rb || typeof rb.canHaveResource !== "function") {
        throw new Error("ResourceBuilder.canHaveResource is unavailable");
      }
      return rb.canHaveResource(x, y, resourceType, input.ignoreWeight === true);
    };
    const readResourcePlacementFeasibility = (cell) => {
      const resourceTypes = cell.resourceTypes.slice(0, input.maxResourceTypesPerCell);
      const feasibility = {};
      for (const resourceType of resourceTypes) {
        feasibility[String(resourceType)] = probe(() => canHaveResource(cell.x, cell.y, resourceType));
      }
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        resourceTypes,
        omittedResourceTypes: Math.max(0, (cell.requestedResourceTypeCount ?? resourceTypes.length) - resourceTypes.length),
        feasibility,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      ignoreWeight: input.ignoreWeight === true,
      cells: input.cells.map((cell) => readResourcePlacementFeasibility(cell)),
    });
  })()`;
}

function buildFeaturePlacementFeasibilityCommand(input: {
  cells: ReadonlyArray<
    Civ7FeaturePlacementFeasibilityCellInput & {
      requestedFeatureTypeCount: number;
    }
  >;
  requestedCellCount: number;
  maxFeatureTypesPerCell: number;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const tb = typeof TerrainBuilder !== "undefined" ? TerrainBuilder : undefined;
    const canHaveFeature = (x, y, featureType) => {
      if (!tb || typeof tb.canHaveFeature !== "function") {
        throw new Error("TerrainBuilder.canHaveFeature is unavailable");
      }
      return tb.canHaveFeature(x, y, featureType);
    };
    const readFeaturePlacementFeasibility = (cell) => {
      const featureTypes = cell.featureTypes.slice(0, input.maxFeatureTypesPerCell);
      const feasibility = {};
      for (const featureType of featureTypes) {
        feasibility[String(featureType)] = probe(() => canHaveFeature(cell.x, cell.y, featureType));
      }
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        featureTypes,
        omittedFeatureTypes: Math.max(0, (cell.requestedFeatureTypeCount ?? featureTypes.length) - featureTypes.length),
        feasibility,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      cells: input.cells.map((cell) => readFeaturePlacementFeasibility(cell)),
    });
  })()`;
}

function buildResourceBuilderDiagnosticsCommand(input: {
  cells: ReadonlyArray<
    Civ7ResourcePlacementFeasibilityCellInput & {
      requestedResourceTypeCount: number;
    }
  >;
  resourceTypes: ReadonlyArray<number>;
  requestedCellCount: number;
  maxResourceTypesPerCell: number;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const rb = typeof ResourceBuilder !== "undefined" ? ResourceBuilder : undefined;
    if (!rb) throw new Error("ResourceBuilder is unavailable");
    const toPlain = (row) => {
      if (row == null || typeof row !== "object") return row;
      try {
        return JSON.parse(JSON.stringify(row));
      } catch {
        const out = {};
        for (const key of Object.getOwnPropertyNames(row)) {
          try {
            const value = row[key];
            if (typeof value !== "function") out[key] = value;
          } catch {}
        }
        return out;
      }
    };
    const resourceRows = (() => {
      const table = typeof GameInfo !== "undefined" ? GameInfo.Resources : undefined;
      if (!table) return [];
      try {
        return Array.from(table).map((row) => toPlain(row));
      } catch {
        return [];
      }
    })();
    const resourceRowsByType = new Map();
    const resourceRowsByHash = new Map();
    for (const row of resourceRows) {
      const type = row?.$index ?? row?.Index ?? row?.ResourceType;
      if (Number.isInteger(type)) resourceRowsByType.set(type, row);
      const hash = row?.$hash ?? row?.Hash;
      if (Number.isInteger(hash)) resourceRowsByHash.set(hash, row);
    }
    const resourceTypes = [...new Set([...input.resourceTypes, ...input.cells.flatMap((cell) => cell.resourceTypes)])].sort((left, right) => left - right);
    const counts = probe(() => rb.getResourceCounts());
    const readCount = (resourceType) => {
      if (!counts.ok || !Array.isArray(counts.value)) return counts.ok ? { ok: false, error: "ResourceBuilder.getResourceCounts did not return an array" } : counts;
      return { ok: true, value: counts.value[resourceType] };
    };
    const readResource = (resourceType) => {
      const row = resourceRowsByType.get(resourceType);
      const hash = row?.$hash ?? row?.Hash;
      return {
        resourceType,
        row: row === undefined ? { ok: false, error: "GameInfo.Resources row not found" } : { ok: true, value: row },
        hash: Number.isInteger(hash) ? { ok: true, value: hash } : { ok: false, error: "GameInfo.Resources hash not found" },
        count: readCount(resourceType),
        landmass: probe(() => rb.getResourceLandmass(resourceType)),
        validForAge: probe(() => rb.isResourceValidForAge(resourceType)),
        requiredForAge: probe(() => rb.isResourceRequiredForAge(resourceType)),
        ignoringWeightForRiverPlacement: probe(() => rb.isResourceIgnoringWeightForRiverPlacement(resourceType)),
      };
    };
    const decodeCuts = (cutHashes) => cutHashes.map((hash) => {
      const row = resourceRowsByHash.get(hash);
      const type = row?.$index ?? row?.Index ?? row?.ResourceType;
      return {
        hash,
        ...(Number.isInteger(type) ? { resourceType: type } : {}),
        ...(typeof row?.ResourceType === "string" ? { resourceTypeName: row.ResourceType } : {}),
        ...(typeof row?.ResourceType === "string" ? {} : typeof row?.ResourceTypeName === "string" ? { resourceTypeName: row.ResourceTypeName } : {}),
        ...(row !== undefined ? { row } : {}),
      };
    });
    const readCellResource = (cell, resourceType) => {
      const cutHashes = probe(() => rb.getBestMapResourceCuts(cell.x, cell.y, resourceType));
      return {
        canHaveResource: {
          strict: probe(() => rb.canHaveResource(cell.x, cell.y, resourceType, false)),
          ignoreWeight: probe(() => rb.canHaveResource(cell.x, cell.y, resourceType, true)),
        },
        resourceLandmassAtCell: probe(() => rb.getResourceLandmass(cell.x, cell.y, resourceType)),
        bestMapResourceCutHashes: cutHashes,
        bestMapResourceCuts: cutHashes.ok && Array.isArray(cutHashes.value)
          ? { ok: true, value: decodeCuts(cutHashes.value) }
          : cutHashes.ok
            ? { ok: false, error: "ResourceBuilder.getBestMapResourceCuts did not return an array" }
            : cutHashes,
      };
    };
    const readCell = (cell) => {
      const resourceTypes = cell.resourceTypes.slice(0, input.maxResourceTypesPerCell);
      const resources = {};
      for (const resourceType of resourceTypes) resources[String(resourceType)] = readCellResource(cell, resourceType);
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        resourceTypes,
        omittedResourceTypes: Math.max(0, (cell.requestedResourceTypeCount ?? resourceTypes.length) - resourceTypes.length),
        resources,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      resources: resourceTypes.map((resourceType) => readResource(resourceType)),
      cells: input.cells.map((cell) => readCell(cell)),
    });
  })()`;
}

function normalizePlotFields(
  fields: ReadonlyArray<Civ7PlotSnapshotField> | undefined
): ReadonlyArray<Civ7PlotSnapshotField> {
  const selected: ReadonlyArray<Civ7PlotSnapshotField> = fields?.length
    ? fields
    : ["terrain", "biome", "feature", "resource", "owner", "visibility", "areaRegion"];
  for (const field of selected) {
    if (!ALL_CIV7_PLOT_FIELDS.includes(field)) {
      throw new Civ7DirectControlError("command-failed", `Unsupported Civ7 plot field: ${field}`);
    }
  }
  return Array.from(new Set(selected));
}

const ALL_CIV7_PLOT_FIELDS: ReadonlyArray<Civ7PlotSnapshotField> = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "climate",
  "hydrology",
  "yields",
  "owner",
  "visibility",
  "areaRegion",
  "tags",
  "city",
  "units",
];

function validateResourcePlacementFeasibilityInput(
  input: Civ7ResourcePlacementFeasibilityInput,
  maxCells: number,
  maxResourceTypesPerCell: number
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Resource placement feasibility reads require at least one cell"
    );
  }
  if (input.cells.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Resource placement feasibility cell lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS} entries`
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.resourceTypes) || cell.resourceTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Resource placement feasibility cells require at least one resource type"
      );
    }
    if (cell.resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Resource placement feasibility resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`
      );
    }
    for (const resourceType of cell.resourceTypes.slice(0, maxResourceTypesPerCell)) {
      boundedInteger(resourceType, 0, 1_000_000, "resourceType");
    }
  }
}

function validateFeaturePlacementFeasibilityInput(
  input: Civ7FeaturePlacementFeasibilityInput,
  maxCells: number,
  maxFeatureTypesPerCell: number
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Feature placement feasibility reads require at least one cell"
    );
  }
  if (input.cells.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Feature placement feasibility cell lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS} entries`
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.featureTypes) || cell.featureTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Feature placement feasibility cells require at least one feature type"
      );
    }
    if (cell.featureTypes.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Feature placement feasibility feature type lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`
      );
    }
    for (const featureType of cell.featureTypes.slice(0, maxFeatureTypesPerCell)) {
      if (!Number.isInteger(featureType) || featureType < 0) {
        throw new Civ7DirectControlError(
          "command-failed",
          `Feature placement feasibility feature types must be non-negative integers: ${featureType}`
        );
      }
    }
  }
}

function uniqueBoundedResourceTypes(resourceTypes: ReadonlyArray<number>): number[] {
  if (resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
    throw new Civ7DirectControlError(
      "command-failed",
      `ResourceBuilder diagnostic resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`
    );
  }
  return [
    ...new Set(
      resourceTypes.map((resourceType) =>
        boundedInteger(resourceType, 0, 1_000_000, "resourceType")
      )
    ),
  ].sort((left, right) => left - right);
}

export function planCiv7MapGridReadBounds(
  bounds: Civ7MapBounds,
  maxPlotsPerRead = HARD_CIV7_MAP_GRID_MAX_PLOTS
): Civ7MapBounds[] {
  validateMapBounds(bounds);
  const maxPlots = boundedInteger(
    maxPlotsPerRead,
    1,
    HARD_CIV7_MAP_GRID_MAX_PLOTS,
    "maxPlotsPerRead"
  );
  const chunks: Civ7MapBounds[] = [];
  const chunkWidth = Math.min(bounds.width, maxPlots);
  const chunkHeight = Math.max(1, Math.floor(maxPlots / chunkWidth));

  for (let y = bounds.y; y < bounds.y + bounds.height; y += chunkHeight) {
    const height = Math.min(chunkHeight, bounds.y + bounds.height - y);
    for (let x = bounds.x; x < bounds.x + bounds.width; x += chunkWidth) {
      const width = Math.min(chunkWidth, bounds.x + bounds.width - x);
      chunks.push({ x, y, width, height });
    }
  }

  return chunks;
}

function requiredProbeNumber(probe: Civ7RuntimeProbe<number>, label: string): number {
  if (!probe.ok || !Number.isFinite(probe.value)) {
    throw new Civ7DirectControlError("command-failed", `${label} did not return a bounded number`);
  }
  return probe.value;
}

function assertFullMapGridSummaryIdentityStable(
  before: Civ7MapSummaryResult,
  after: Civ7MapSummaryResult
): Civ7FullMapGridIdentityCheck {
  const fields: ReadonlyArray<
    Readonly<{ label: string; before: Civ7RuntimeProbe<unknown>; after: Civ7RuntimeProbe<unknown> }>
  > = [
    { label: "map.width", before: before.map.width, after: after.map.width },
    { label: "map.height", before: before.map.height, after: after.map.height },
    { label: "map.plotCount", before: before.map.plotCount, after: after.map.plotCount },
    { label: "map.randomSeed", before: before.map.randomSeed, after: after.map.randomSeed },
    { label: "game.turn", before: before.game.turn, after: after.game.turn },
    { label: "game.hash", before: before.game.hash, after: after.game.hash },
  ];
  const checked: string[] = [];
  for (const field of fields) {
    if (!field.before.ok || !field.after.ok) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity could not verify ${field.label}`
      );
    }
    checked.push(field.label);
    if (field.before.value !== field.after.value) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity changed during read: ${field.label} ${String(field.before.value)} -> ${String(field.after.value)}`
      );
    }
  }
  return { stable: true, checked };
}

function probeNumberOr(probe: Civ7RuntimeProbe<unknown>, fallback: number): number {
  if (!probe.ok) return fallback;
  const value = Number(probe.value);
  return Number.isFinite(value) ? value : fallback;
}
