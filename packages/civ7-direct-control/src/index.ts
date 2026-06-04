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
  generateCiv7CapabilityCatalog,
  loadCiv7OfficialResourceCapabilities,
  type Civ7CapabilityCatalog,
  type Civ7CapabilityCatalogEntry,
  type Civ7CapabilityCatalogOptions,
} from "./catalog/capabilities.js";
export {
  Civ7ProcedureConsumerClassSchema,
  Civ7ProcedureCorrelationPolicySchema,
  Civ7ProcedureContextRequirementSchema,
  Civ7ProcedureCoreCallDiagnosticsSchema,
  Civ7ProcedureCoreCallResultSchema,
  Civ7ProcedureCoreDescriptorSchema,
  Civ7ProcedureCoreErrorReasonSchema,
  Civ7ProcedureCoreErrorSummarySchema,
  Civ7ProcedureFamilySchema,
  Civ7ProcedurePlayerScopeSchema,
  Civ7ProcedureProjectionSchema,
  Civ7ProcedureProofBoundarySchema,
  Civ7ProcedureRiskSchema,
  Civ7ProcedureSchemaReferenceSchema,
  Civ7ProcedureSchemaTechnologySchema,
  assertCiv7ProcedureCoreDescriptor,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  isCiv7ProcedureCoreDescriptor,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  summarizeCiv7ProcedureCoreError,
  validateCiv7ProcedureCoreInput,
  validateCiv7ProcedureCoreOutput,
} from "./procedure-core.js";
export type {
  Civ7ProcedureConsumerClass,
  Civ7ProcedureCorrelationPolicy,
  Civ7ProcedureContextRequirement,
  Civ7ProcedureCoreCallContext,
  Civ7ProcedureCoreCallDiagnostics,
  Civ7ProcedureCoreCallOptions,
  Civ7ProcedureCoreCallResult,
  Civ7ProcedureCoreDescriptor,
  Civ7ProcedureCoreDescriptorErrorReason,
  Civ7ProcedureCoreErrorSummary,
  Civ7ProcedureCoreHandler,
  Civ7ProcedureCoreSummary,
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
import type {
  Civ7AppUiSnapshot,
  Civ7AppUiSnapshotResult,
} from "./runtime/app-ui-snapshot.js";
import type {
  Civ7RuntimeApiInspection,
  Civ7RuntimeApiMethod,
  Civ7RuntimeApiRoot,
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
import type {
  Civ7RootInspectionInput,
  Civ7RootInspectionResult,
} from "./runtime/root-inspection.js";
import type {
  Civ7TunerHealthResult,
  Civ7TunerHealthSnapshot,
} from "./runtime/tuner-health.js";
import type {
  Civ7PlayableStatusResult,
} from "./runtime/playable-status.js";
import {
  defaultSetupReadDependencies,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  waitForCiv7SetupPhase,
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
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
} from "./setup/constants.js";
import type {
  Civ7AutoplayActionResult,
  Civ7AutoplayOptions,
  Civ7AutoplayPollOptions,
  Civ7AutoplayStatusResult,
} from "./play/autoplay.js";
import type {
  Civ7TurnCompletionActionResult,
  Civ7TurnCompletionStatusResult,
} from "./play/turn-completion.js";
import type {
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
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
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlotSnapshot,
} from "./play/map/reads.js";
import {
  getCiv7GameInfoRows,
  type Civ7GameInfoRowsInput,
  type Civ7GameInfoRowsResult,
} from "./play/map/gameinfo.js";
import type {
  Civ7RevealMapResult,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
} from "./play/map/visibility.js";
import {
  type Civ7CitySummary,
  type Civ7CitySummaryInput,
  type Civ7CitySummaryResult,
  getCiv7CitySummary,
  type Civ7PlayerSummary,
  type Civ7PlayerSummaryInput,
  type Civ7PlayerSummaryResult,
  getCiv7PlayerSummary,
  type Civ7UnitSummary,
  type Civ7UnitSummaryInput,
  type Civ7UnitSummaryResult,
  getCiv7UnitSummary,
} from "./play/summaries.js";
import type {
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "./play/operations/diplomacy-request.js";
import {
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  type Civ7UnitTargetActionInput,
  type Civ7UnitTargetActionResult,
} from "./play/operations/unit-target-action.js";
import type {
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "./play/operations/narrative-request.js";
import type {
  Civ7ProductionChoiceInput,
  Civ7ProductionChoiceResult,
} from "./play/operations/production-choice.js";
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
  Civ7MapSummaryInput,
  Civ7MapSummaryOptions,
  Civ7MapSummaryResult,
  Civ7PlotSnapshot,
  Civ7PlotSnapshotField,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
} from "./play/map/types.js";
export { Civ7MapLocationSchema } from "./play/map/types.js";
import {
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
  type Civ7ProgressDashboardInput,
  type Civ7ProgressDashboardResult,
  type Civ7TraditionsViewInput,
  type Civ7TraditionsViewResult,
} from "./play/progression/reads.js";
import type {
  Civ7CultureChoiceCloseoutInput,
  Civ7CultureChoiceCloseoutResult,
} from "./play/progression/culture.js";
import type {
  Civ7TechnologyChoiceCloseoutInput,
  Civ7TechnologyChoiceCloseoutResult,
} from "./play/progression/technology.js";
import {
  getCiv7ReadyCityView,
  type Civ7ReadyCityOperationCandidate,
  type Civ7ReadyCityPopulationPlacement,
  type Civ7ReadyCityProductionCandidate,
  type Civ7ReadyCityTownFocusOption,
  type Civ7ReadyCityViewInput,
  type Civ7ReadyCityViewResult,
} from "./play/ready/city.js";
import {
  getCiv7UnitMovePreview,
  type Civ7UnitMovePreviewInput,
  type Civ7UnitMovePreviewResult,
} from "./play/ready/move-preview.js";
import {
  getCiv7ReadyUnitView,
  type Civ7ReadyUnitNearbyPlot,
  type Civ7ReadyUnitOperationCandidate,
  type Civ7ReadyUnitPromotionReadiness,
  type Civ7ReadyUnitViewInput,
  type Civ7ReadyUnitViewResult,
} from "./play/ready/unit.js";
import {
  getCiv7BattlefieldScan,
  type Civ7BattlefieldScanInput,
  type Civ7BattlefieldScanResult,
} from "./play/tactical/battlefield.js";
import {
  getCiv7DestinationAnalysis,
  type Civ7DestinationAnalysisInput,
  type Civ7DestinationAnalysisResult,
} from "./play/tactical/destination.js";
import {
  getCiv7SettlementRecommendations,
  type Civ7SettlementRecommendation,
  type Civ7SettlementRecommendationFactor,
  type Civ7SettlementRecommendationInput,
  type Civ7SettlementRecommendationOrigin,
  type Civ7SettlementRecommendationResult,
} from "./play/tactical/settlement.js";
import {
  getCiv7TargetCandidates,
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
  generateCiv7CapabilityCatalog,
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
export {
  callCiv7AppUiSnapshotProcedure,
  Civ7AppUiSnapshotProcedureDescriptor,
  Civ7AppUiSnapshotProcedureSchemaArtifacts,
} from "./runtime/app-ui-snapshot-procedure.js";
export type { Civ7AppUiSnapshotProcedureCallOptions } from "./runtime/app-ui-snapshot-procedure.js";
export type {
  Civ7RuntimeApiInspection,
  Civ7RuntimeApiMethod,
  Civ7RuntimeApiRoot,
} from "./runtime/inspection.js";
export { inspectCiv7RuntimeApi } from "./runtime/inspection.js";
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
  checkCiv7TunerHealth,
  Civ7TunerHealthInputSchema,
  Civ7TunerHealthResultSchema,
  Civ7TunerHealthSnapshotSchema,
  waitForCiv7TunerReady,
} from "./runtime/tuner-health.js";
export {
  callCiv7TunerHealthProcedure,
  Civ7TunerHealthProcedureDescriptor,
  Civ7TunerHealthProcedureSchemaArtifacts,
} from "./runtime/tuner-health-procedure.js";
export type { Civ7TunerHealthProcedureCallOptions } from "./runtime/tuner-health-procedure.js";
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
export {
  callCiv7PlayableStatusProcedure,
  Civ7PlayableStatusProcedureDescriptor,
  Civ7PlayableStatusProcedureSchemaArtifacts,
} from "./runtime/playable-status-procedure.js";
export type { Civ7PlayableStatusProcedureCallOptions } from "./runtime/playable-status-procedure.js";
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
export { ensureCiv7SetupMapRowVisible } from "./setup/reads.js";
export {
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
};
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
export { startPreparedCiv7SinglePlayerGame } from "./setup/start.js";
export type {
  Civ7SinglePlayerRunInput,
  Civ7SinglePlayerRunResult,
} from "./setup/run.js";
export type { Civ7RestartAndBeginResult } from "./setup/restart.js";
export {
  beginCiv7Game,
  restartCiv7Game,
  restartCiv7GameAndBegin,
} from "./setup/restart.js";
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
export { getCiv7GameInfoRows };
export {
  Civ7HiddenInfoPolicySchema,
  Civ7MapBoundsSchema,
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7PlotSnapshotFieldSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7PlotSnapshotSchema,
} from "./play/map/types.js";
export {
  callCiv7MapGridProcedure,
  Civ7MapGridProcedureDescriptor,
  Civ7MapGridProcedureSchemaArtifacts,
} from "./play/map/grid-procedure.js";
export type { Civ7MapGridProcedureCallOptions } from "./play/map/grid-procedure.js";
export {
  callCiv7PlotSnapshotProcedure,
  Civ7PlotSnapshotProcedureDescriptor,
  Civ7PlotSnapshotProcedureSchemaArtifacts,
} from "./play/map/plot-snapshot-procedure.js";
export type { Civ7PlotSnapshotProcedureCallOptions } from "./play/map/plot-snapshot-procedure.js";
export {
  callCiv7MapSummaryProcedure,
  Civ7MapSummaryProcedureDescriptor,
  Civ7MapSummaryProcedureSchemaArtifacts,
} from "./play/map/summary-procedure.js";
export type { Civ7MapSummaryProcedureCallOptions } from "./play/map/summary-procedure.js";
export type {
  GameInfoReadDependencies,
} from "./play/map/gameinfo.js";
export {
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
} from "./play/map/gameinfo.js";
export {
  callCiv7GameInfoRowsProcedure,
  Civ7GameInfoRowsProcedureDescriptor,
  Civ7GameInfoRowsProcedureSchemaArtifacts,
} from "./play/map/gameinfo-procedure.js";
export type { Civ7GameInfoRowsProcedureCallOptions } from "./play/map/gameinfo-procedure.js";
export type {
  MapGridReadDependencies,
  MapSummaryReadDependencies,
  PlotSnapshotReadDependencies,
} from "./play/map/reads.js";
export type {
  Civ7RevealMapResult,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
  VisibilityReadDependencies,
} from "./play/map/visibility.js";
export {
  Civ7VisibilityGridStateSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  getCiv7VisibilitySummary,
  revealCiv7MapForPlayer,
} from "./play/map/visibility.js";
export {
  callCiv7VisibilitySummaryProcedure,
  Civ7VisibilitySummaryProcedureDescriptor,
  Civ7VisibilitySummaryProcedureSchemaArtifacts,
} from "./play/map/visibility-procedure.js";
export type {
  Civ7VisibilitySummaryProcedureCallOptions,
} from "./play/map/visibility-procedure.js";
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
export {
  getCiv7CitySummary,
  getCiv7PlayerSummary,
  getCiv7UnitSummary,
};
export {
  callCiv7PlayerSummaryProcedure,
  Civ7PlayerSummaryProcedureDescriptor,
  Civ7PlayerSummaryProcedureSchemaArtifacts,
} from "./play/player-summary-procedure";
export type { Civ7PlayerSummaryProcedureCallOptions } from "./play/player-summary-procedure";
export {
  callCiv7CitySummaryProcedure,
  Civ7CitySummaryProcedureDescriptor,
  Civ7CitySummaryProcedureSchemaArtifacts,
} from "./play/city-summary-procedure";
export type { Civ7CitySummaryProcedureCallOptions } from "./play/city-summary-procedure";
export {
  callCiv7UnitSummaryProcedure,
  Civ7UnitSummaryProcedureDescriptor,
  Civ7UnitSummaryProcedureSchemaArtifacts,
} from "./play/unit-summary-procedure.js";
export type { Civ7UnitSummaryProcedureCallOptions } from "./play/unit-summary-procedure.js";
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
} from "./play/progression/reads.js";
export {
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
};
export {
  callCiv7TraditionsViewProcedure,
  Civ7TraditionsViewProcedureDescriptor,
  Civ7TraditionsViewProcedureSchemaArtifacts,
} from "./play/progression/traditions-procedure.js";
export type {
  Civ7TraditionsViewProcedureCallOptions,
} from "./play/progression/traditions-procedure.js";
export {
  callCiv7ProgressDashboardProcedure,
  Civ7ProgressDashboardProcedureDescriptor,
  Civ7ProgressDashboardProcedureSchemaArtifacts,
} from "./play/progression/progress-dashboard-procedure.js";
export type {
  Civ7ProgressDashboardProcedureCallOptions,
} from "./play/progression/progress-dashboard-procedure.js";
export type {
  Civ7TechnologyChoiceCloseoutInput,
  Civ7TechnologyChoiceCloseoutResult,
} from "./play/progression/technology.js";
export { requestCiv7TechnologyChoiceCloseout } from "./play/progression/technology.js";
export type {
  Civ7CultureChoiceCloseoutInput,
  Civ7CultureChoiceCloseoutResult,
} from "./play/progression/culture.js";
export { requestCiv7CultureChoiceCloseout } from "./play/progression/culture.js";
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
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlotSnapshot,
};
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
export {
  configureCiv7Autoplay,
  getCiv7AutoplayStatus,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "./play/autoplay.js";
export type {
  Civ7TurnCompletionActionResult,
  Civ7TurnCompletionStatusDependencies,
  Civ7TurnCompletionStatusInput,
  Civ7TurnCompletionStatusResult,
} from "./play/turn-completion.js";
export {
  Civ7TurnCompletionStatusInputSchema,
  Civ7TurnCompletionStatusResultSchema,
  getCiv7TurnCompletionStatus,
  sendCiv7TurnComplete,
  sendCiv7TurnUnready,
} from "./play/turn-completion.js";
export {
  callCiv7TurnCompletionStatusProcedure,
  Civ7TurnCompletionStatusProcedureDescriptor,
  Civ7TurnCompletionStatusProcedureSchemaArtifacts,
} from "./play/turn-completion-procedure.js";
export type { Civ7TurnCompletionStatusProcedureCallOptions } from "./play/turn-completion-procedure.js";
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
export {
  callCiv7ReadyUnitViewProcedure,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
} from "./play/ready/unit-procedure.js";
export type { Civ7ReadyUnitViewProcedureCallOptions } from "./play/ready/unit-procedure.js";
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
export {
  callCiv7UnitMovePreviewProcedure,
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
} from "./play/ready/move-preview-procedure.js";
export type { Civ7UnitMovePreviewProcedureCallOptions } from "./play/ready/move-preview-procedure.js";
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
export {
  callCiv7ReadyCityViewProcedure,
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
} from "./play/ready/city-procedure.js";
export type { Civ7ReadyCityViewProcedureCallOptions } from "./play/ready/city-procedure.js";
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
  Civ7PlayNotificationViewResultContract,
  Civ7PlayNotificationViewResult,
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
export {
  callCiv7PlayNotificationViewProcedure,
  Civ7PlayNotificationViewProcedureDescriptor,
  Civ7PlayNotificationViewProcedureSchemaArtifacts,
} from "./play/notifications/view-procedure.js";
export type {
  Civ7PlayNotificationViewProcedureCallOptions,
} from "./play/notifications/view-procedure.js";
export type {
  Civ7NotificationDismissInput,
  Civ7NotificationDismissRequestInput,
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
} from "./play/notifications/dismissal-request.js";
export type {
  Civ7NotificationDismissalPostcondition,
  Civ7NotificationDismissalPostconditionClassification,
} from "./play/notifications/postconditions.js";
export {
  Civ7NotificationDismissInputSchema,
  Civ7NotificationDismissRequestInputSchema,
  Civ7NotificationDismissalResultSchema,
  getCiv7NotificationDismissal,
  requestCiv7NotificationDismissal,
} from "./play/notifications/dismissal-request.js";
export {
  Civ7NotificationDismissalPostconditionClassificationSchema,
  Civ7NotificationDismissalPostconditionSchema,
  Civ7NotificationDismissalSummarySchema,
} from "./play/notifications/postconditions.js";
export {
  callCiv7NotificationDismissRequestProcedure,
  Civ7NotificationDismissRequestProcedureDescriptor,
  Civ7NotificationDismissRequestProcedureSchemaArtifacts,
} from "./play/notifications/dismissal-procedure.js";
export type {
  Civ7NotificationDismissRequestProcedureCallOptions,
} from "./play/notifications/dismissal-procedure.js";
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
export {
  callCiv7BattlefieldScanProcedure,
  Civ7BattlefieldScanProcedureDescriptor,
  Civ7BattlefieldScanProcedureSchemaArtifacts,
} from "./play/tactical/battlefield-procedure.js";
export type {
  Civ7BattlefieldScanProcedureCallOptions,
} from "./play/tactical/battlefield-procedure.js";
export type {
  DestinationAnalysisDependencies,
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResult,
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
export {
  callCiv7DestinationAnalysisProcedure,
  Civ7DestinationAnalysisProcedureDescriptor,
  Civ7DestinationAnalysisProcedureSchemaArtifacts,
} from "./play/tactical/destination-procedure.js";
export type {
  Civ7DestinationAnalysisProcedureCallOptions,
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
export {
  callCiv7SettlementRecommendationsProcedure,
  Civ7SettlementRecommendationsProcedureDescriptor,
  Civ7SettlementRecommendationsProcedureSchemaArtifacts,
} from "./play/tactical/settlement-procedure.js";
export type {
  Civ7SettlementRecommendationsProcedureCallOptions,
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
export {
  callCiv7TargetCandidatesProcedure,
  Civ7TargetCandidatesProcedureDescriptor,
  Civ7TargetCandidatesProcedureSchemaArtifacts,
} from "./play/tactical/target-candidates-procedure.js";
export type {
  Civ7TargetCandidatesProcedureCallOptions,
} from "./play/tactical/target-candidates-procedure.js";
export {
  Civ7UnitTargetActionCandidateSchema,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  Civ7UnitTargetActionInputSchema,
  Civ7UnitTargetActionRequestInputSchema,
  Civ7UnitTargetActionResultSchema,
  Civ7UnitTargetActionVerificationSchema,
} from "./play/operations/unit-target-action.js";
export type {
  Civ7UnitTargetActionCandidate,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionRequestInput,
  Civ7UnitTargetActionResult,
} from "./play/operations/unit-target-action.js";
export {
  getCiv7UnitTargetAction,
  requestCiv7UnitTargetAction,
} from "./play/operations/unit-target-action.js";
export {
  callCiv7UnitTargetActionRequestProcedure,
  Civ7UnitTargetActionRequestProcedureDescriptor,
  Civ7UnitTargetActionRequestProcedureSchemaArtifacts,
} from "./play/operations/unit-target-action-procedure.js";
export type {
  Civ7UnitTargetActionRequestProcedureCallOptions,
} from "./play/operations/unit-target-action-procedure.js";
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
export {
  Civ7ProductionPostconditionClassificationSchema,
  Civ7ProductionPostconditionSchema,
  Civ7ProductionPostconditionSnapshotSchema,
} from "./play/operations/production-postconditions.js";
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
export {
  callCiv7ProductionChoiceRequestProcedure,
  Civ7ProductionChoiceRequestProcedureDescriptor,
  Civ7ProductionChoiceRequestProcedureSchemaArtifacts,
} from "./play/operations/production-choice-procedure.js";
export type {
  Civ7ProductionChoiceRequestProcedureCallOptions,
} from "./play/operations/production-choice-procedure.js";
export type {
  Civ7DiplomacyResponseCommandPayload,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "./play/operations/diplomacy-request.js";
export { requestCiv7DiplomacyResponse } from "./play/operations/diplomacy-request.js";
export type {
  Civ7DiplomacyResponsePostcondition,
  Civ7DiplomacyResponsePostconditionClassification,
} from "./play/operations/diplomacy-postconditions.js";
export type {
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "./play/operations/narrative-request.js";
export { requestCiv7NarrativeChoice } from "./play/operations/narrative-request.js";
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

export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7PreparedSetupResult> {
  return await prepareCiv7SinglePlayerSetupFromModule(input, options, approval, setupReadDependencies());
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

export async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerRunInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerRunResult> {
  return await runCiv7SinglePlayerFromSetupFromModule(input, options, approval, {
    assertApproved,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    exitToMainMenuCommand: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
    getSetupSnapshot: getCiv7SetupSnapshot,
    prepareSetup: prepareCiv7SinglePlayerSetup,
    startPreparedGame: startPreparedCiv7SinglePlayerGameFromModule,
    validateIdentifier,
    waitForSetupPhase: waitForCiv7SetupPhase,
  });
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
