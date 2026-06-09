import {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  type Civ7ComponentId,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
import { assertApproved, type Civ7ActionApproval } from "./action-approval.js";
import { Civ7DirectControlError, type Civ7DirectControlErrorCode } from "./direct-control-error.js";
import { errorMessage } from "./error-message.js";
import { discoverCiv7DirectControlEndpoint } from "./session/discovery.js";
import {
  executeCiv7AppUiCommand,
  executeCiv7Command,
  executeCiv7TunerCommand,
  queryCiv7TunerStates,
} from "./session/execute.js";
import { jsonPayloadFromCommandResult } from "./session/command-result.js";
import { jsLiteral } from "./runtime/command-serialization.js";
import { sleep } from "./timing.js";
import { boundedInteger, validateIdentifier, validatePlayerId } from "./validation.js";
import {
  Civ7DirectControlSession,
  withCiv7DirectControlSession,
} from "./session/session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlEndpoint,
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateRole,
  Civ7TunerStateSelection,
} from "./session/types.js";
import {
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
} from "./session/constants.js";
import { executeSessionCommandWithReconnect } from "./session/reconnect.js";
import {
  DEFAULT_CIV7_SCRIPTING_LOG,
  snapshotFile,
  waitForFreshLogMarkers,
  type FileSnapshot,
  type FreshLogMarkerProof,
} from "./proof/log-markers.js";
import {
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
  generateCiv7CapabilityCatalog as generateCiv7CapabilityCatalogFromModule,
  loadCiv7OfficialResourceCapabilities,
  type Civ7CapabilityCatalog,
  type Civ7CapabilityCatalogEntry,
  type Civ7CapabilityCatalogOptions,
} from "./catalog/capabilities.js";
import {
  getCiv7AppUiSnapshot as getCiv7AppUiSnapshotFromModule,
  type Civ7AppUiSnapshot,
  type Civ7AppUiSnapshotResult,
} from "./runtime/app-ui-snapshot.js";
import {
  inspectCiv7RuntimeApi as inspectCiv7RuntimeApiFromModule,
  type Civ7RuntimeApiInspection,
  type Civ7RuntimeApiMethod,
  type Civ7RuntimeApiRoot,
} from "./runtime/inspection.js";
import {
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_ROOT_MAX_KEYS,
  DEFAULT_CIV7_ROOT_MAX_METHODS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
} from "./runtime/inspection-constants.js";
import {
  probeHelperSource,
  probeValue,
  type Civ7RuntimeProbe,
} from "./runtime/probe.js";
import {
  inspectCiv7Root as inspectCiv7RootFromModule,
  type Civ7RootInspectionInput,
  type Civ7RootInspectionResult,
} from "./runtime/root-inspection.js";
import {
  checkCiv7TunerHealth as checkCiv7TunerHealthFromModule,
  waitForCiv7TunerReady as waitForCiv7TunerReadyFromModule,
  type Civ7TunerHealthResult,
  type Civ7TunerHealthSnapshot,
} from "./runtime/tuner-health.js";
import {
  getCiv7PlayableStatus as getCiv7PlayableStatusFromModule,
  type Civ7PlayableStatusResult,
} from "./runtime/playable-status.js";
import {
  defaultSetupReadDependencies,
  ensureCiv7SetupMapRowVisible as ensureCiv7SetupMapRowVisibleFromModule,
  getCiv7SetupMapRows as getCiv7SetupMapRowsFromModule,
  getCiv7SetupSnapshot as getCiv7SetupSnapshotFromModule,
  type Civ7PlayerSetupParameterSnapshot,
  type Civ7SetupMapRow,
  type Civ7SetupMapRowsInput,
  type Civ7SetupMapRowsResult,
  type Civ7SetupMapRowVisibilityInput,
  type Civ7SetupMapRowVisibilityResult,
  type Civ7SetupParameterSnapshot,
  type Civ7SetupParameterValue,
  type Civ7SetupSnapshot,
  type Civ7SetupSnapshotResult,
} from "./setup/reads.js";
import {
  assertPreparedSetupMatches,
  listCiv7SavedGameConfigurations as listCiv7SavedGameConfigurationsFromModule,
  normalizeSavedGameConfigurationRef,
  normalizeSinglePlayerSetupInput as normalizeSinglePlayerSetupInputFromModule,
  prepareCiv7SinglePlayerSetup as prepareCiv7SinglePlayerSetupFromModule,
  type Civ7PreparedSetupResult,
  type Civ7SavedGameConfigurationListInput,
  type Civ7SavedGameConfigurationListResult,
  type Civ7SavedGameConfigurationLoadResult,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupOptionValue,
  type Civ7SinglePlayerSetupInput,
} from "./setup/prepare.js";
import {
  startPreparedCiv7SinglePlayerGame as startPreparedCiv7SinglePlayerGameFromModule,
  type Civ7PreparedStartInput,
  type Civ7SinglePlayerStartResult,
} from "./setup/start.js";
import {
  runCiv7SinglePlayerFromSetup as runCiv7SinglePlayerFromSetupFromModule,
  type Civ7SinglePlayerRunInput,
  type Civ7SinglePlayerRunResult,
} from "./setup/run.js";
import {
  beginCiv7Game as beginCiv7GameFromModule,
  restartCiv7Game as restartCiv7GameFromModule,
  restartCiv7GameAndBegin as restartCiv7GameAndBeginFromModule,
  type Civ7RestartAndBeginResult,
} from "./setup/restart.js";
import {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
} from "./setup/constants.js";
import {
  configureCiv7Autoplay as configureCiv7AutoplayFromModule,
  getCiv7AutoplayStatus as getCiv7AutoplayStatusFromModule,
  startCiv7Autoplay as startCiv7AutoplayFromModule,
  stopCiv7Autoplay as stopCiv7AutoplayFromModule,
  type Civ7AutoplayActionResult,
  type Civ7AutoplayOptions,
  type Civ7AutoplayPollOptions,
  type Civ7AutoplayStatusResult,
} from "./play/autoplay.js";
import {
  getCiv7TurnCompletionStatus as getCiv7TurnCompletionStatusFromModule,
  sendCiv7TurnComplete as sendCiv7TurnCompleteFromModule,
  sendCiv7TurnUnready as sendCiv7TurnUnreadyFromModule,
  type Civ7TurnCompletionActionResult,
  type Civ7TurnCompletionStatusResult,
} from "./play/turn-completion.js";
import {
  getCiv7NotificationDismissal as getCiv7NotificationDismissalFromModule,
  requestCiv7NotificationDismissal as requestCiv7NotificationDismissalFromModule,
  type Civ7NotificationDismissInput,
  type Civ7NotificationDismissalResult,
  type Civ7NotificationDismissalSummary,
} from "./play/notifications/dismissal-request.js";
import type {
  Civ7PlayDecisionAction,
  Civ7PlayDecisionHint,
  Civ7PlayDecisionInput,
  Civ7PlayDecisionQueueItem,
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "./play/notifications/view.js";
import {
  getCiv7MapGrid as getCiv7MapGridFromModule,
  getCiv7MapSummary as getCiv7MapSummaryFromModule,
  getCiv7PlotSnapshot as getCiv7PlotSnapshotFromModule,
} from "./play/map/reads.js";
import {
  getCiv7GameInfoRows as getCiv7GameInfoRowsFromModule,
  type Civ7GameInfoRowsInput,
  type Civ7GameInfoRowsResult,
} from "./play/map/gameinfo.js";
import {
  getCiv7VisibilitySummary as getCiv7VisibilitySummaryFromModule,
  revealCiv7MapForPlayer as revealCiv7MapForPlayerFromModule,
  type Civ7RevealMapResult,
  type Civ7VisibilitySummaryInput,
  type Civ7VisibilitySummaryResult,
} from "./play/map/visibility.js";
import {
  type Civ7CitySummary,
  type Civ7CitySummaryInput,
  type Civ7CitySummaryResult,
  getCiv7CitySummary as getCiv7CitySummaryFromModule,
  type Civ7PlayerSummary,
  type Civ7PlayerSummaryInput,
  type Civ7PlayerSummaryResult,
  getCiv7PlayerSummary as getCiv7PlayerSummaryFromModule,
  type Civ7UnitSummary,
  type Civ7UnitSummaryInput,
  type Civ7UnitSummaryResult,
  getCiv7UnitSummary as getCiv7UnitSummaryFromModule,
} from "./play/summaries.js";
import {
  requestCiv7DiplomacyResponse as requestCiv7DiplomacyResponseFromModule,
  type Civ7DiplomacyResponseInput,
  type Civ7DiplomacyResponseResult,
} from "./play/operations/diplomacy-request.js";
import { getCiv7PlayNotificationView as getCiv7PlayNotificationViewFromModule } from "./play/notifications/view.js";
import {
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  getCiv7UnitTargetAction as getCiv7UnitTargetActionFromModule,
  requestCiv7UnitTargetAction as requestCiv7UnitTargetActionFromModule,
  type Civ7UnitTargetActionInput,
  type Civ7UnitTargetActionResult,
} from "./play/operations/unit-target-action.js";
import {
  requestCiv7NarrativeChoice as requestCiv7NarrativeChoiceFromModule,
  type Civ7NarrativeChoiceInput,
  type Civ7NarrativeChoiceResult,
} from "./play/operations/narrative-request.js";
import {
  requestCiv7ProductionChoice as requestCiv7ProductionChoiceFromModule,
  type Civ7ProductionChoiceInput,
  type Civ7ProductionChoiceResult,
} from "./play/operations/production-choice.js";
import {
  canStartCiv7CityCommand as canStartCiv7CityCommandFromModule,
  canStartCiv7CityOperation as canStartCiv7CityOperationFromModule,
  canStartCiv7PlayerOperation as canStartCiv7PlayerOperationFromModule,
  canStartCiv7UnitCommand as canStartCiv7UnitCommandFromModule,
  canStartCiv7UnitOperation as canStartCiv7UnitOperationFromModule,
  requestCiv7CityCommand as requestCiv7CityCommandFromModule,
  requestCiv7CityOperation as requestCiv7CityOperationFromModule,
  requestCiv7PlayerOperation as requestCiv7PlayerOperationFromModule,
  requestCiv7UnitCommand as requestCiv7UnitCommandFromModule,
  requestCiv7UnitOperation as requestCiv7UnitOperationFromModule,
  type Civ7OperationRequestResult,
} from "./play/operations/validate-request.js";
import type {
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./play/operations/types.js";
import type { Civ7ProductionPostconditionSnapshot } from "./play/operations/production-postconditions.js";
import {
  DEFAULT_CIV7_GAMEINFO_LIMIT,
  DEFAULT_CIV7_GAMEINFO_TABLES,
  DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  HARD_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
} from "./play/map/constants.js";
import { validateMapBounds, validateMapLocation } from "./play/map/validation.js";
import type {
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
  Civ7PlotSnapshot,
  Civ7PlotSnapshotField,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
} from "./play/map/types.js";
import {
  getCiv7ProgressDashboard as getCiv7ProgressDashboardFromModule,
  getCiv7TraditionsView as getCiv7TraditionsViewFromModule,
  type Civ7ProgressDashboardInput,
  type Civ7ProgressDashboardResult,
  type Civ7TraditionsViewInput,
  type Civ7TraditionsViewResult,
} from "./play/progression/reads.js";
import {
  requestCiv7CultureChoiceCloseout as requestCiv7CultureChoiceCloseoutFromModule,
  type Civ7CultureChoiceCloseoutInput,
  type Civ7CultureChoiceCloseoutResult,
} from "./play/progression/culture.js";
import {
  requestCiv7TechnologyChoiceCloseout as requestCiv7TechnologyChoiceCloseoutFromModule,
  type Civ7TechnologyChoiceCloseoutInput,
  type Civ7TechnologyChoiceCloseoutResult,
} from "./play/progression/technology.js";
import {
  getCiv7ReadyCityView as getCiv7ReadyCityViewFromModule,
  type Civ7ReadyCityOperationCandidate,
  type Civ7ReadyCityPopulationPlacement,
  type Civ7ReadyCityProductionCandidate,
  type Civ7ReadyCityTownFocusOption,
  type Civ7ReadyCityViewInput,
  type Civ7ReadyCityViewResult,
} from "./play/ready/city.js";
import {
  getCiv7UnitMovePreview as getCiv7UnitMovePreviewFromModule,
  type Civ7UnitMovePreviewInput,
  type Civ7UnitMovePreviewResult,
} from "./play/ready/move-preview.js";
import {
  getCiv7ReadyUnitView as getCiv7ReadyUnitViewFromModule,
  type Civ7ReadyUnitNearbyPlot,
  type Civ7ReadyUnitOperationCandidate,
  type Civ7ReadyUnitPromotionReadiness,
  type Civ7ReadyUnitViewInput,
  type Civ7ReadyUnitViewResult,
} from "./play/ready/unit.js";
import {
  getCiv7BattlefieldScan as getCiv7BattlefieldScanFromModule,
  type Civ7BattlefieldScanInput,
  type Civ7BattlefieldScanResult,
} from "./play/tactical/battlefield.js";
import {
  getCiv7DestinationAnalysis as getCiv7DestinationAnalysisFromModule,
  type Civ7DestinationAnalysisInput,
  type Civ7DestinationAnalysisResult,
} from "./play/tactical/destination.js";
import {
  getCiv7SettlementRecommendations as getCiv7SettlementRecommendationsFromModule,
  type Civ7SettlementRecommendation,
  type Civ7SettlementRecommendationFactor,
  type Civ7SettlementRecommendationInput,
  type Civ7SettlementRecommendationOrigin,
  type Civ7SettlementRecommendationResult,
} from "./play/tactical/settlement.js";
import {
  getCiv7TargetCandidates as getCiv7TargetCandidatesFromModule,
  type Civ7TargetCandidate,
  type Civ7TargetCandidatesInput,
  type Civ7TargetCandidatesResult,
} from "./play/tactical/target-candidates.js";

export {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
export type { Civ7ComponentId } from "./civ7-component-id.js";
export { Civ7DirectControlError } from "./direct-control-error.js";
export type { Civ7DirectControlErrorCode } from "./direct-control-error.js";
export {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
} from "./session/framing.js";
export type { Civ7TunerFrame } from "./session/framing.js";
export { discoverCiv7DirectControlEndpoint } from "./session/discovery.js";
export {
  executeCiv7AppUiCommand,
  executeCiv7Command,
  executeCiv7TunerCommand,
  queryCiv7TunerStates,
} from "./session/execute.js";
export {
  checkCiv7DirectControlHealth,
  waitForCiv7DirectControl,
} from "./session/health.js";
export { Civ7DirectControlSession } from "./session/session.js";
export type {
  Civ7CommandResult,
  Civ7DirectControlEndpoint,
  Civ7DirectControlHealth,
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateRole,
  Civ7TunerStateSelection,
} from "./session/types.js";
export {
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
} from "./session/constants.js";
export { resolveCiv7DirectControlConfig } from "./session/config.js";
export { createCiv7ControlRequestId } from "./session/request-id.js";
export { selectCiv7TunerState } from "./session/state.js";
export {
  DEFAULT_CIV7_SCRIPTING_LOG,
  snapshotFile,
  waitForFreshLogMarkers,
} from "./proof/log-markers.js";
export type {
  FileSnapshot,
  FreshLogMarkerProof,
} from "./proof/log-markers.js";
export { loadCiv7OfficialResourceCapabilities } from "./catalog/capabilities.js";
export {
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  createStaticCiv7CapabilityCatalog,
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
} from "./catalog/capabilities.js";
export type {
  Civ7CapabilityCatalog,
  Civ7CapabilityCatalogEntry,
  Civ7CapabilityCatalogOptions,
} from "./catalog/capabilities.js";
export {
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_ROOT_MAX_KEYS,
  DEFAULT_CIV7_ROOT_MAX_METHODS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
} from "./runtime/inspection-constants.js";
export type {
  Civ7AppUiSnapshot,
  Civ7AppUiSnapshotResult,
} from "./runtime/app-ui-snapshot.js";
export type {
  Civ7RuntimeApiInspection,
  Civ7RuntimeApiMethod,
  Civ7RuntimeApiRoot,
} from "./runtime/inspection.js";
export type { Civ7RuntimeProbe } from "./runtime/probe.js";
export type {
  Civ7RootInspectionInput,
  Civ7RootInspectionResult,
} from "./runtime/root-inspection.js";
export type {
  Civ7TunerHealthResult,
  Civ7TunerHealthSnapshot,
} from "./runtime/tuner-health.js";
export type { Civ7PlayableStatusResult } from "./runtime/playable-status.js";
export {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
  DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
} from "./setup/constants.js";
export type { Civ7UiLoadingStateName } from "./setup/constants.js";
export type {
  Civ7PlayerSetupParameterSnapshot,
  Civ7SetupMapRow,
  Civ7SetupMapRowsInput,
  Civ7SetupMapRowsResult,
  Civ7SetupMapRowVisibilityInput,
  Civ7SetupMapRowVisibilityResult,
  Civ7SetupParameterSnapshot,
  Civ7SetupParameterValue,
  Civ7SetupPhase,
  Civ7SetupSnapshot,
  Civ7SetupSnapshotResult,
} from "./setup/reads.js";
export type {
  Civ7PlayerSetupOptions,
  Civ7PreparedSetupResult,
  Civ7SavedGameConfiguration,
  Civ7SavedGameConfigurationListInput,
  Civ7SavedGameConfigurationListResult,
  Civ7SavedGameConfigurationLoadResult,
  Civ7SavedGameConfigurationRef,
  Civ7SavedGameConfigurationSummary,
  Civ7SetupOptionValue,
  Civ7SinglePlayerSetupInput,
} from "./setup/prepare.js";
export type {
  Civ7PreparedStartInput,
  Civ7SinglePlayerStartResult,
} from "./setup/start.js";
export type {
  Civ7SinglePlayerRunInput,
  Civ7SinglePlayerRunResult,
} from "./setup/run.js";
export type { Civ7RestartAndBeginResult } from "./setup/restart.js";
export { DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR } from "./setup/prepare.js";
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
} from "./play/map/gameinfo.js";
export type {
  Civ7RevealMapResult,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
} from "./play/map/visibility.js";
export type {
  Civ7CitySummary,
  Civ7CitySummaryInput,
  Civ7CitySummaryResult,
  Civ7PlayerSummary,
  Civ7PlayerSummaryInput,
  Civ7PlayerSummaryResult,
  Civ7UnitSummary,
  Civ7UnitSummaryInput,
  Civ7UnitSummaryResult,
} from "./play/summaries.js";
export type {
  Civ7ProgressDashboardInput,
  Civ7ProgressDashboardLegacyPath,
  Civ7ProgressDashboardResult,
  Civ7TraditionAction,
  Civ7TraditionActionKind,
  Civ7TraditionSummary,
  Civ7TraditionsViewInput,
  Civ7TraditionsViewResult,
} from "./play/progression/reads.js";
export type {
  Civ7TechnologyChoiceCloseoutInput,
  Civ7TechnologyChoiceCloseoutResult,
} from "./play/progression/technology.js";
export type {
  Civ7CultureChoiceCloseoutInput,
  Civ7CultureChoiceCloseoutResult,
} from "./play/progression/culture.js";
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
  Civ7PlotSnapshot,
  Civ7PlotSnapshotField,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
} from "./play/map/types.js";
export {
  DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
  DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
  DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
} from "./play/autoplay.js";
export type {
  Civ7AutoplayActionResult,
  Civ7AutoplayOptions,
  Civ7AutoplayPollOptions,
  Civ7AutoplayStatusResult,
} from "./play/autoplay.js";
export type {
  Civ7TurnCompletionActionResult,
  Civ7TurnCompletionStatusResult,
} from "./play/turn-completion.js";
export type {
  Civ7ReadyUnitNearbyPlot,
  Civ7ReadyUnitOperationCandidate,
  Civ7ReadyUnitPromotionReadiness,
  Civ7ReadyUnitViewInput,
  Civ7ReadyUnitViewResult,
} from "./play/ready/unit.js";
export type {
  Civ7UnitMovePreviewInput,
  Civ7UnitMovePreviewResult,
} from "./play/ready/move-preview.js";
export type {
  Civ7ReadyCityOperationCandidate,
  Civ7ReadyCityPopulationPlacement,
  Civ7ReadyCityProductionCandidate,
  Civ7ReadyCityTownFocusOption,
  Civ7ReadyCityViewInput,
  Civ7ReadyCityViewResult,
} from "./play/ready/city.js";
export type {
  Civ7PlayDecisionAction,
  Civ7PlayDecisionHint,
  Civ7PlayDecisionInput,
  Civ7PlayDecisionQueueItem,
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "./play/notifications/view.js";
export type {
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
} from "./play/notifications/dismissal-request.js";
export type {
  Civ7BattlefieldScanInput,
  Civ7BattlefieldScanResult,
} from "./play/tactical/battlefield.js";
export type {
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResult,
} from "./play/tactical/destination.js";
export type {
  Civ7SettlementRecommendation,
  Civ7SettlementRecommendationFactor,
  Civ7SettlementRecommendationInput,
  Civ7SettlementRecommendationOrigin,
  Civ7SettlementRecommendationResult,
} from "./play/tactical/settlement.js";
export type {
  Civ7TargetCandidate,
  Civ7TargetCandidatesInput,
  Civ7TargetCandidatesResult,
} from "./play/tactical/target-candidates.js";
export {
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
} from "./play/operations/unit-target-action.js";
export type {
  Civ7UnitTargetActionCandidate,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResult,
} from "./play/operations/unit-target-action.js";
export type {
  Civ7ActionApproval,
} from "./action-approval.js";
export type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationTarget,
  Civ7OperationValidationResult,
} from "./play/operations/types.js";
export type {
  Civ7OperationRequestResult,
} from "./play/operations/validate-request.js";
export type {
  Civ7UnitOperationPostcondition,
  Civ7UnitOperationPostconditionClassification,
  Civ7UnitOperationPostconditionSnapshot,
} from "./play/operations/unit-postconditions.js";
export type {
  Civ7PopulationPlacementPostcondition,
  Civ7PopulationPlacementPostconditionClassification,
  Civ7PopulationPlacementPostconditionSnapshot,
} from "./play/operations/population-postconditions.js";
export type {
  Civ7ProductionPostcondition,
  Civ7ProductionPostconditionClassification,
  Civ7ProductionPostconditionSnapshot,
} from "./play/operations/production-postconditions.js";
export type {
  Civ7ProductionChoiceCommandPayload,
  Civ7ProductionChoiceInput,
  Civ7ProductionChoiceResult,
} from "./play/operations/production-choice.js";
export type {
  Civ7DiplomacyResponseCommandPayload,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "./play/operations/diplomacy-request.js";
export type {
  Civ7DiplomacyResponsePostcondition,
  Civ7DiplomacyResponsePostconditionClassification,
} from "./play/operations/diplomacy-postconditions.js";
export type {
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "./play/operations/narrative-request.js";
export type {
  Civ7NarrativeChoicePostcondition,
  Civ7NarrativeChoicePostconditionClassification,
} from "./play/operations/narrative-postconditions.js";

export { CIV7_SIGNED_INT_SEED_MAX, CIV7_SIGNED_INT_SEED_MIN, assessCiv7SignedIntSeed } from "./policy/setup.js";
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;

export type Civ7ResourcePlacementFeasibilityCellInput = Readonly<Civ7MapLocation & {
  resourceTypes: ReadonlyArray<number>;
}>;

export type Civ7ResourcePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxResourceTypesPerCell?: number;
  ignoreWeight?: boolean;
}>;

export type Civ7ResourcePlacementFeasibilityCell = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
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

export type Civ7FeaturePlacementFeasibilityCellInput = Readonly<Civ7MapLocation & {
  featureTypes: ReadonlyArray<number>;
}>;

export type Civ7FeaturePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxFeatureTypesPerCell?: number;
}>;

export type Civ7FeaturePlacementFeasibilityCell = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
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
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
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

export async function inspectCiv7RuntimeApi(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  roots?: ReadonlyArray<string>;
} = {}): Promise<Civ7RuntimeApiInspection> {
  return await inspectCiv7RuntimeApiFromModule(options);
}

export async function getCiv7AppUiSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AppUiSnapshotResult> {
  return await getCiv7AppUiSnapshotFromModule(options);
}

export async function beginCiv7Game(options: Civ7DirectControlOptions = {}): Promise<Civ7CommandResult> {
  return await beginCiv7GameFromModule(options);
}

export async function checkCiv7TunerHealth(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TunerHealthResult> {
  return await checkCiv7TunerHealthFromModule(options);
}

export async function restartCiv7Game(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7CommandResult> {
  return await restartCiv7GameFromModule(options);
}

export async function restartCiv7GameAndBegin(options: Civ7DirectControlOptions & {
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7RestartAndBeginResult> {
  return await restartCiv7GameAndBeginFromModule(options);
}

export async function waitForCiv7TunerReady(options: Civ7DirectControlOptions & {
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7TunerHealthResult & { ready: true }> {
  return await waitForCiv7TunerReadyFromModule(options);
}

export async function getCiv7PlayableStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlayableStatusResult> {
  return await getCiv7PlayableStatusFromModule(options);
}

export async function getCiv7MapSummary(
  options: Civ7MapSummaryOptions = {},
): Promise<Civ7MapSummaryResult> {
  return await getCiv7MapSummaryFromModule(options);
}

export async function getCiv7PlotSnapshot(
  input: Civ7PlotSnapshotInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlotSnapshotResult> {
  return await getCiv7PlotSnapshotFromModule(input, options);
}

export async function getCiv7MapGrid(
  input: Civ7MapGridInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7MapGridResult> {
  return await getCiv7MapGridFromModule(input, options);
}

export async function getCiv7ResourcePlacementFeasibility(
  input: Civ7ResourcePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ResourcePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell",
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
    "Civ7 resource placement feasibility",
  );
}

export async function getCiv7FeaturePlacementFeasibility(
  input: Civ7FeaturePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7FeaturePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxFeatureTypesPerCell = boundedInteger(
    input.maxFeatureTypesPerCell ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxFeatureTypesPerCell",
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
    "Civ7 feature placement feasibility",
  );
}

export async function getCiv7ResourceBuilderDiagnostics(
  input: Civ7ResourceBuilderDiagnosticsInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ResourceBuilderDiagnosticsResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell",
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
    "Civ7 ResourceBuilder diagnostics",
  );
}

export async function getCiv7FullMapGrid(
  input: Civ7FullMapGridInput,
  options: Civ7DirectControlOptions = {},
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
    "maxPlotsPerRead",
  );
  const readBounds = planCiv7MapGridReadBounds(bounds, maxPlotsPerRead);
  const fields = normalizePlotFields(input.fields);
  const plots: Civ7PlotSnapshot[] = [];
  const chunks: Civ7MapGridReadChunk[] = [];
  let omitted = 0;
  let hiddenInfoPolicy: Civ7HiddenInfoPolicy = input.playerId === undefined
    ? "not-player-scoped"
    : input.includeHidden === true
      ? "include-hidden"
      : "visibility-filtered";
  let lastGrid: Civ7MapGridResult | undefined;

  for (const chunkBounds of readBounds) {
    const grid = await getCiv7MapGrid({
      bounds: chunkBounds,
      fields,
      ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
      ...(input.includeHidden === undefined ? {} : { includeHidden: input.includeHidden }),
      maxPlots: maxPlotsPerRead,
    }, options);
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

export async function getCiv7PlayerSummary(
  input: Civ7PlayerSummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlayerSummaryResult> {
  return await getCiv7PlayerSummaryFromModule(input, options);
}

export async function getCiv7UnitSummary(
  input: Civ7UnitSummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitSummaryResult> {
  return await getCiv7UnitSummaryFromModule(input, options);
}

export async function getCiv7CitySummary(
  input: Civ7CitySummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7CitySummaryResult> {
  return await getCiv7CitySummaryFromModule(input, options);
}

export async function getCiv7VisibilitySummary(
  input: Civ7VisibilitySummaryInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7VisibilitySummaryResult> {
  return await getCiv7VisibilitySummaryFromModule(input, options);
}

export async function getCiv7GameInfoRows(
  input: Civ7GameInfoRowsInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7GameInfoRowsResult> {
  return await getCiv7GameInfoRowsFromModule(input, options);
}

export async function getCiv7SetupSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupSnapshotResult> {
  return await getCiv7SetupSnapshotFromModule(options);
}

export async function getCiv7SetupMapRows(
  input: Civ7SetupMapRowsInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupMapRowsResult> {
  return await getCiv7SetupMapRowsFromModule(input, options);
}

function setupReadDependencies() {
  return {
    ...defaultSetupReadDependencies,
    loadSavedGameConfiguration: loadCiv7SavedGameConfiguration,
    parseSetupPreparation: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<{
        before: Civ7SetupSnapshot;
        after: Civ7SetupSnapshot;
        applied: Record<string, Civ7SetupOptionValue>;
      }>(result, label),
    validateIdentifier,
  } as const;
}

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {},
): Promise<Civ7SavedGameConfigurationListResult> {
  return await listCiv7SavedGameConfigurationsFromModule(input, { boundedInteger });
}

export async function loadCiv7SavedGameConfiguration(
  input: Civ7SavedGameConfigurationRef,
  options: Civ7DirectControlOptions = {},
  wait: { waitTimeoutMs?: number; pollIntervalMs?: number } = {},
): Promise<Civ7SavedGameConfigurationLoadResult> {
  const savedConfig = normalizeSavedGameConfigurationRef(input);
  const before = await getCiv7SetupSnapshot(options);
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildLoadSavedGameConfigurationCommand(savedConfig),
  });
  const waitTimeoutMs = wait.waitTimeoutMs ?? options.timeoutMs ?? 30_000;
  const pollIntervalMs = wait.pollIntervalMs ?? 1_000;
  const after = await waitForCiv7SetupRevisionAfter(before, options, { waitTimeoutMs, pollIntervalMs }).catch(async () => {
    await sleep(Math.min(1_000, pollIntervalMs));
    return getCiv7SetupSnapshot(options);
  });
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    savedConfig,
    before,
    after,
    command,
    loaded: command.output.some((line) => line.includes('"ok":true')),
  };
}

export async function ensureCiv7SetupMapRowVisible(
  input: Civ7SetupMapRowVisibilityInput,
  options: Civ7DirectControlOptions = {},
  approval?: Civ7ActionApproval,
): Promise<Civ7SetupMapRowVisibilityResult> {
  return await ensureCiv7SetupMapRowVisibleFromModule(input, options, approval);
}

export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7PreparedSetupResult> {
  return await prepareCiv7SinglePlayerSetupFromModule(input, options, approval);
}

export async function startPreparedCiv7SinglePlayerGame(
  input: Civ7PreparedStartInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerStartResult> {
  return await startPreparedCiv7SinglePlayerGameFromModule(input, options, approval);
}

export async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerRunInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerRunResult> {
  return await runCiv7SinglePlayerFromSetupFromModule(input, options, approval);
}

export async function inspectCiv7Root(
  input: Civ7RootInspectionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7RootInspectionResult> {
  return await inspectCiv7RootFromModule(input, options);
}

export async function getCiv7AutoplayStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AutoplayStatusResult> {
  return await getCiv7AutoplayStatusFromModule(options);
}

export async function configureCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await configureCiv7AutoplayFromModule(options, approval);
}

export async function startCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await startCiv7AutoplayFromModule(options, approval);
}

export async function stopCiv7Autoplay(
  options: Civ7AutoplayOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await stopCiv7AutoplayFromModule(options, approval);
}

export async function revealCiv7MapForPlayer(
  input: Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7RevealMapResult> {
  return await revealCiv7MapForPlayerFromModule(input, options, approval);
}

export async function getCiv7TurnCompletionStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TurnCompletionStatusResult> {
  return await getCiv7TurnCompletionStatusFromModule(options);
}

export async function getCiv7PlayNotificationView(
  options: Civ7DirectControlOptions & { maxNotifications?: number } = {},
): Promise<Civ7PlayNotificationViewResult> {
  return await getCiv7PlayNotificationViewFromModule(options);
}

export async function getCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7NotificationDismissalResult> {
  return await getCiv7NotificationDismissalFromModule(input, options);
}

export async function requestCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NotificationDismissalResult> {
  return await requestCiv7NotificationDismissalFromModule(input, options, approval);
}

export async function sendCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  return await sendCiv7TurnCompleteFromModule(options, approval);
}

export async function sendCiv7TurnUnready(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  return await sendCiv7TurnUnreadyFromModule(options, approval);
}

export async function canStartCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7UnitOperationFromModule(input, options);
}

export async function requestCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7UnitOperationFromModule(input, options, approval);
}

export async function canStartCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7UnitCommandFromModule(input, options);
}

export async function requestCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7UnitCommandFromModule(input, options, approval);
}

export async function canStartCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7CityOperationFromModule(input, options);
}

export async function requestCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7CityOperationFromModule(input, options, approval);
}

export async function requestCiv7ProductionChoice(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7ProductionChoiceResult> {
  return await requestCiv7ProductionChoiceFromModule(input, options, approval);
}
export async function canStartCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7CityCommandFromModule(input, options);
}

export async function requestCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7CityCommandFromModule(input, options, approval);
}

export async function canStartCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7PlayerOperationFromModule(input, options);
}

export async function requestCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7PlayerOperationFromModule(input, options, approval);
}

export async function requestCiv7TechnologyChoiceCloseout(
  input: Civ7TechnologyChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TechnologyChoiceCloseoutResult> {
  return await requestCiv7TechnologyChoiceCloseoutFromModule(input, options, approval);
}

export async function requestCiv7CultureChoiceCloseout(
  input: Civ7CultureChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7CultureChoiceCloseoutResult> {
  return await requestCiv7CultureChoiceCloseoutFromModule(input, options, approval);
}

export async function requestCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7DiplomacyResponseResult> {
  return await requestCiv7DiplomacyResponseFromModule(input, options, approval);
}

export async function requestCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NarrativeChoiceResult> {
  return await requestCiv7NarrativeChoiceFromModule(input, options, approval);
}

export async function getCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitTargetActionResult> {
  return await getCiv7UnitTargetActionFromModule(input, options);
}

export async function getCiv7ReadyUnitView(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyUnitViewResult> {
  return await getCiv7ReadyUnitViewFromModule(input, options);
}

export async function getCiv7UnitMovePreview(
  input: Civ7UnitMovePreviewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitMovePreviewResult> {
  return await getCiv7UnitMovePreviewFromModule(input, options);
}

export async function getCiv7ReadyCityView(
  input: Civ7ReadyCityViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyCityViewResult> {
  return await getCiv7ReadyCityViewFromModule(input, options);
}

export async function getCiv7SettlementRecommendations(
  input: Civ7SettlementRecommendationInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SettlementRecommendationResult> {
  return await getCiv7SettlementRecommendationsFromModule(input, options);
}

export async function getCiv7TargetCandidates(
  input: Civ7TargetCandidatesInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TargetCandidatesResult> {
  return await getCiv7TargetCandidatesFromModule(input, options);
}

export async function getCiv7TraditionsView(
  input: Civ7TraditionsViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TraditionsViewResult> {
  return await getCiv7TraditionsViewFromModule(input, options);
}

export async function getCiv7ProgressDashboard(
  input: Civ7ProgressDashboardInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ProgressDashboardResult> {
  return await getCiv7ProgressDashboardFromModule(input, options);
}

export async function getCiv7BattlefieldScan(
  input: Civ7BattlefieldScanInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7BattlefieldScanResult> {
  return await getCiv7BattlefieldScanFromModule(input, options);
}

export async function getCiv7DestinationAnalysis(
  input: Civ7DestinationAnalysisInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7DestinationAnalysisResult> {
  return await getCiv7DestinationAnalysisFromModule(input, options);
}

export async function requestCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7UnitTargetActionResult> {
  return await requestCiv7UnitTargetActionFromModule(input, options, approval);
}

export async function generateCiv7CapabilityCatalog(
  options: Civ7CapabilityCatalogOptions = {},
): Promise<Civ7CapabilityCatalog> {
  return await generateCiv7CapabilityCatalogFromModule(options);
}

function buildResourcePlacementFeasibilityCommand(input: {
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput & {
    requestedResourceTypeCount: number;
  }>;
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
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCellInput & {
    requestedFeatureTypeCount: number;
  }>;
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
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput & {
    requestedResourceTypeCount: number;
  }>;
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

function buildLoadSavedGameConfigurationCommand(input: Civ7SavedGameConfigurationRef): string {
  return `(() => {
    const input = ${jsLiteral(input)};
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    const params = {
      Location: SaveLocations.LOCAL_STORAGE,
      LocationCategories: SaveLocationCategories.NORMAL,
      Type: SaveTypes.SINGLE_PLAYER,
      ContentType: SaveFileTypes.GAME_CONFIGURATION,
      FileName: input.fileName,
      DisplayName: input.displayName,
    };
    return JSON.stringify({
      ok: Network.loadGame(params, serverType),
      serverType,
      params,
    });
  })()`;
}
function normalizePlotFields(fields: ReadonlyArray<Civ7PlotSnapshotField> | undefined): ReadonlyArray<Civ7PlotSnapshotField> {
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
  maxResourceTypesPerCell: number,
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Resource placement feasibility reads require at least one cell",
    );
  }
  if (input.cells.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Resource placement feasibility cell lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS} entries`,
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.resourceTypes) || cell.resourceTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Resource placement feasibility cells require at least one resource type",
      );
    }
    if (cell.resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Resource placement feasibility resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
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
  maxFeatureTypesPerCell: number,
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Feature placement feasibility reads require at least one cell",
    );
  }
  if (input.cells.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Feature placement feasibility cell lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS} entries`,
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.featureTypes) || cell.featureTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Feature placement feasibility cells require at least one feature type",
      );
    }
    if (cell.featureTypes.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Feature placement feasibility feature type lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
      );
    }
    for (const featureType of cell.featureTypes.slice(0, maxFeatureTypesPerCell)) {
      if (!Number.isInteger(featureType) || featureType < 0) {
        throw new Civ7DirectControlError(
          "command-failed",
          `Feature placement feasibility feature types must be non-negative integers: ${featureType}`,
        );
      }
    }
  }
}

function uniqueBoundedResourceTypes(resourceTypes: ReadonlyArray<number>): number[] {
  if (resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
    throw new Civ7DirectControlError(
      "command-failed",
      `ResourceBuilder diagnostic resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
    );
  }
  return [...new Set(resourceTypes.map((resourceType) => boundedInteger(resourceType, 0, 1_000_000, "resourceType")))]
    .sort((left, right) => left - right);
}

export function planCiv7MapGridReadBounds(
  bounds: Civ7MapBounds,
  maxPlotsPerRead = HARD_CIV7_MAP_GRID_MAX_PLOTS,
): Civ7MapBounds[] {
  validateMapBounds(bounds);
  const maxPlots = boundedInteger(maxPlotsPerRead, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "maxPlotsPerRead");
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
  after: Civ7MapSummaryResult,
): Civ7FullMapGridIdentityCheck {
  const fields: ReadonlyArray<Readonly<{ label: string; before: Civ7RuntimeProbe<unknown>; after: Civ7RuntimeProbe<unknown> }>> = [
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
      throw new Civ7DirectControlError("command-failed", `Civ7 full-grid identity could not verify ${field.label}`);
    }
    checked.push(field.label);
    if (field.before.value !== field.after.value) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity changed during read: ${field.label} ${String(field.before.value)} -> ${String(field.after.value)}`,
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

async function waitForCiv7SetupRevisionAfter(
  before: Civ7SetupSnapshotResult,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
): Promise<Civ7SetupSnapshotResult> {
  const beforeRevision = probeValue(before.snapshot.setup.revision);
  const startedAt = Date.now();
  let last: Civ7SetupSnapshotResult | undefined;
  let shellPolls = 0;
  const stableShellMs = Math.min(2_000, wait.waitTimeoutMs);
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    try {
      const snapshot = await getCiv7SetupSnapshot(options);
      last = snapshot;
      const nextRevision = probeValue(snapshot.snapshot.setup.revision);
      if (snapshot.snapshot.phase === "shell") {
        shellPolls += 1;
        if (
          beforeRevision !== undefined &&
          nextRevision !== undefined &&
          nextRevision !== beforeRevision
        ) {
          return snapshot;
        }
        if (shellPolls >= 2 && Date.now() - startedAt >= stableShellMs) return snapshot;
      }
    } catch {
      // Keep polling while Civ applies the saved configuration.
    }
    await sleep(wait.pollIntervalMs);
  }
  if (last) return last;
  throw new Civ7DirectControlError(
    "setup-apply-timeout",
    "Timed out waiting for Civ7 saved configuration load to update setup state",
    { details: before },
  );
}

function toDirectControlError(err: unknown, fallbackCode: Civ7DirectControlErrorCode): Civ7DirectControlError {
  if (err instanceof Civ7DirectControlError) return err;
  return new Civ7DirectControlError(fallbackCode, errorMessage(err), { cause: err });
}
