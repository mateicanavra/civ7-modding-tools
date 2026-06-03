import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { Socket, createConnection } from "node:net";
import {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  type Civ7ComponentId,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
import { Civ7DirectControlError, type Civ7DirectControlErrorCode } from "./direct-control-error.js";
import {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  type Civ7TunerFrame,
} from "./session/framing.js";
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
  createStaticCiv7CapabilityCatalog as createStaticCiv7CapabilityCatalogFromModule,
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
  generateCiv7CapabilityCatalog as generateCiv7CapabilityCatalogFromModule,
  loadCiv7OfficialResourceCapabilities,
  type Civ7CapabilityCatalog,
  type Civ7CapabilityCatalogEntry,
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
import type { Civ7RuntimeProbe } from "./runtime/probe.js";
import {
  inspectCiv7Root as inspectCiv7RootFromModule,
  type Civ7RootInspectionInput,
  type Civ7RootInspectionResult,
} from "./runtime/root-inspection.js";
import {
  checkCiv7TunerHealth as checkCiv7TunerHealthFromModule,
  checkCiv7TunerHealthWithSession,
  type Civ7TunerHealthResult,
  type Civ7TunerHealthSnapshot,
} from "./runtime/tuner-health.js";
import {
  getCiv7PlayableStatus as getCiv7PlayableStatusFromModule,
  type Civ7PlayableStatusResult,
} from "./runtime/playable-status.js";
import {
  ensureCiv7SetupMapRowVisible as ensureCiv7SetupMapRowVisibleFromModule,
  getCiv7SetupMapRows as getCiv7SetupMapRowsFromModule,
  getCiv7SetupSnapshot as getCiv7SetupSnapshotFromModule,
} from "./setup/reads.js";
import {
  assertPreparedSetupMatches,
  normalizeSavedGameConfigurationRef,
  normalizeSinglePlayerSetupInput as normalizeSinglePlayerSetupInputFromModule,
  prepareCiv7SinglePlayerSetup as prepareCiv7SinglePlayerSetupFromModule,
} from "./setup/prepare.js";
import { startPreparedCiv7SinglePlayerGame as startPreparedCiv7SinglePlayerGameFromModule } from "./setup/start.js";
import { runCiv7SinglePlayerFromSetup as runCiv7SinglePlayerFromSetupFromModule } from "./setup/run.js";
import {
  beginCiv7Game as beginCiv7GameFromModule,
  restartCiv7Game as restartCiv7GameFromModule,
  restartCiv7GameAndBegin as restartCiv7GameAndBeginFromModule,
} from "./setup/restart.js";
import {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
  DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
} from "./setup/constants.js";
import {
  configureCiv7Autoplay as configureCiv7AutoplayFromModule,
  DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
  DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
  DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
  getCiv7AutoplayStatus as getCiv7AutoplayStatusFromModule,
  startCiv7Autoplay as startCiv7AutoplayFromModule,
  stopCiv7Autoplay as stopCiv7AutoplayFromModule,
} from "./play/autoplay.js";
import {
  getCiv7TurnCompletionStatus as getCiv7TurnCompletionStatusFromModule,
  sendCiv7TurnComplete as sendCiv7TurnCompleteFromModule,
  sendCiv7TurnUnready as sendCiv7TurnUnreadyFromModule,
} from "./play/turn-completion.js";
import {
  getCiv7NotificationDismissal as getCiv7NotificationDismissalFromModule,
  requestCiv7NotificationDismissal as requestCiv7NotificationDismissalFromModule,
} from "./play/notifications/dismissal-request.js";
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
import { requestCiv7DiplomacyResponse as requestCiv7DiplomacyResponseFromModule } from "./play/operations/diplomacy-request.js";
import { getCiv7PlayNotificationView as getCiv7PlayNotificationViewFromModule } from "./play/notifications/view.js";
import {
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  getCiv7UnitTargetAction as getCiv7UnitTargetActionFromModule,
  requestCiv7UnitTargetAction as requestCiv7UnitTargetActionFromModule,
} from "./play/operations/unit-target-action.js";
import { requestCiv7NarrativeChoice as requestCiv7NarrativeChoiceFromModule } from "./play/operations/narrative-request.js";
import { requestCiv7ProductionChoice as requestCiv7ProductionChoiceFromModule } from "./play/operations/production-choice.js";
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
} from "./play/operations/validate-request.js";
import {
  DEFAULT_CIV7_GAMEINFO_LIMIT,
  DEFAULT_CIV7_GAMEINFO_TABLES,
  DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  HARD_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
} from "./play/map/constants.js";
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
} from "./play/progression/reads.js";
import { buildCultureChoiceCloseoutCommand } from "./play/progression/culture.js";
import { buildTechnologyChoiceCloseoutCommand } from "./play/progression/technology.js";
import { getCiv7ReadyCityView as getCiv7ReadyCityViewFromModule } from "./play/ready/city.js";
import { getCiv7UnitMovePreview as getCiv7UnitMovePreviewFromModule } from "./play/ready/move-preview.js";
import { getCiv7ReadyUnitView as getCiv7ReadyUnitViewFromModule } from "./play/ready/unit.js";
import { getCiv7BattlefieldScan as getCiv7BattlefieldScanFromModule } from "./play/tactical/battlefield.js";
import { getCiv7DestinationAnalysis as getCiv7DestinationAnalysisFromModule } from "./play/tactical/destination.js";
import { getCiv7SettlementRecommendations as getCiv7SettlementRecommendationsFromModule } from "./play/tactical/settlement.js";
import { getCiv7TargetCandidates as getCiv7TargetCandidatesFromModule } from "./play/tactical/target-candidates.js";

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
export type {
  Civ7CommandResult,
  Civ7DirectControlEndpoint,
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
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
} from "./catalog/capabilities.js";
export type {
  Civ7CapabilityCatalog,
  Civ7CapabilityCatalogEntry,
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
export {
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
} from "./play/operations/unit-target-action.js";

export { CIV7_SIGNED_INT_SEED_MAX, CIV7_SIGNED_INT_SEED_MIN, assessCiv7SignedIntSeed } from "./policy/setup.js";
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Saves",
  "Single",
);

export type Civ7UiLoadingStateName = keyof typeof CIV7_UI_LOADING_STATES;

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

export type Civ7TraditionActionKind = "activate" | "deactivate";

export type Civ7TraditionAction = Readonly<{
  kind: Civ7TraditionActionKind;
  action: number | null;
  operationType: "CHANGE_TRADITION";
  args: Readonly<{
    TraditionType: number;
    Action: number | null;
  }>;
  validation: Civ7RuntimeProbe<unknown>;
  cli: string;
}>;

export type Civ7TraditionSummary = Readonly<{
  id: number;
  type: string | null;
  name: string | null;
  description: string | null;
  ageType: string | null;
  cultureSlotType: string | null;
  traitType: string | null;
  isCrisis: boolean;
  active: boolean;
  unlocked: boolean;
  recentUnlock: boolean;
  actionHints: ReadonlyArray<Civ7TraditionAction>;
}>;

export type Civ7TraditionsViewInput = Readonly<{
  playerId?: number;
}>;

export type Civ7TraditionsViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  governmentType: Civ7RuntimeProbe<number>;
  government: Readonly<{
    type: string | null;
    name: string | null;
  }>;
  slots: Readonly<{
    total: Civ7RuntimeProbe<number>;
    normal: Civ7RuntimeProbe<number>;
    crisis: Civ7RuntimeProbe<number>;
    active: number;
    unlocked: number;
    available: number;
    open: number;
  }>;
  actions: Readonly<{
    activate: number | null;
    deactivate: number | null;
  }>;
  active: ReadonlyArray<Civ7TraditionSummary>;
  available: ReadonlyArray<Civ7TraditionSummary>;
  recentUnlocks: ReadonlyArray<Civ7TraditionSummary>;
  traditions: ReadonlyArray<Civ7TraditionSummary>;
  recommendedCli: ReadonlyArray<string>;
  hiddenInfoPolicy: "player-culture-runtime";
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProgressDashboardInput = Readonly<{
  playerId?: number;
}>;

export type Civ7ProgressDashboardLegacyPath = Readonly<{
  legacyPathType: string | null;
  legacyPathClassType: string | null;
  ageType: string | null;
  name: string | null;
  description: string | null;
  enabledByDefault: boolean;
  enabledForPlayer: boolean | null;
  score: Civ7RuntimeProbe<number>;
  finalRequiredPathPoints: number | null;
  nextMilestone: unknown;
  milestones: ReadonlyArray<unknown>;
}>;

export type Civ7ProgressDashboardResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  age: Readonly<{
    hash: unknown;
    ageType: string | null;
    name: string | null;
    chronologyIndex: unknown;
    isFinalAge: Civ7RuntimeProbe<boolean>;
    isSingleAge: Civ7RuntimeProbe<boolean>;
    isExtendedGame: Civ7RuntimeProbe<boolean>;
    isAgeOver: Civ7RuntimeProbe<boolean>;
    currentAgeProgressionPoints: Civ7RuntimeProbe<number>;
    maxAgeProgressionPoints: Civ7RuntimeProbe<number>;
    primaryAgeProgression: Civ7RuntimeProbe<unknown>;
  }>;
  player: Readonly<{
    team: unknown;
    historicalLegacyPointCountForTeam: Civ7RuntimeProbe<number>;
  }>;
  legacyPaths: ReadonlyArray<Civ7ProgressDashboardLegacyPath>;
  victories: Readonly<{
    rows: ReadonlyArray<unknown>;
  }>;
  triumphs: Readonly<{
    count: number;
    rows: ReadonlyArray<unknown>;
    source: "runtime-gameinfo";
  }>;
  proof: Readonly<{
    victoryManagerGlobal: Civ7RuntimeProbe<string>;
    sources: ReadonlyArray<string>;
  }>;
  hiddenInfoPolicy: "local-player-runtime-progress";
  notes: ReadonlyArray<string>;
}>;

export type Civ7VisibilitySummaryInput = Readonly<{
  playerId: number;
  bounds?: Civ7MapBounds;
  includeGrid?: boolean;
  maxPlots?: number;
}>;

export type Civ7VisibilitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  numPlotsRevealed: Civ7RuntimeProbe<number>;
  numPlotsVisible: Civ7RuntimeProbe<number>;
  counts: Record<string, number>;
  grid?: Readonly<{
    bounds: Civ7MapBounds;
    plotCount: number;
    omitted: number;
    states: ReadonlyArray<Readonly<Civ7MapLocation & {
      state: Civ7RuntimeProbe<number | string>;
      visible: Civ7RuntimeProbe<boolean>;
    }>>;
  }>;
}>;

export type Civ7SetupPhase = "shell" | "running-game" | "loading" | "begin-ready" | "unavailable";

export type Civ7SetupParameterValue = string | number | boolean | null;

export type Civ7SetupMapRow = Readonly<{
  source: "setup-domain" | "config-db";
  domain?: string;
  file: string;
  value?: string;
  name?: string;
  description?: string;
  sortIndex?: number;
}>;

export type Civ7SetupParameterSnapshot = Readonly<{
  id: string;
  exists: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  invalidReason?: number | string | null;
  value?: Civ7SetupParameterValue;
  rawValue?: unknown;
  possibleValues?: ReadonlyArray<unknown>;
}>;

export type Civ7PlayerSetupParameterSnapshot = Readonly<{
  playerId: number;
  parameters: ReadonlyArray<Civ7SetupParameterSnapshot>;
}>;

export type Civ7SetupSnapshot = Readonly<{
  phase: Civ7SetupPhase;
  ui: Pick<Civ7AppUiSnapshot["ui"], "inGame" | "inShell" | "inLoading" | "loadingState" | "loadingStateName" | "canBeginGame">;
  setup: Readonly<{
    revision: Civ7RuntimeProbe<number>;
    parameters: ReadonlyArray<Civ7SetupParameterSnapshot>;
    playerParameters: ReadonlyArray<Civ7PlayerSetupParameterSnapshot>;
    localPlayerId: Civ7RuntimeProbe<number>;
  }>;
  selectedMapRow?: Civ7SetupMapRow;
  mapRows: ReadonlyArray<Civ7SetupMapRow>;
  config: Readonly<{
    mapScript: Civ7RuntimeProbe<string>;
    mapSize: Civ7RuntimeProbe<string>;
    mapSeed: Civ7RuntimeProbe<number>;
    gameSeed: Civ7RuntimeProbe<number>;
    playerCount: Civ7RuntimeProbe<number>;
  }>;
}>;

export type Civ7SetupSnapshotResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  snapshot: Civ7SetupSnapshot;
}>;

export type Civ7SetupMapRowsInput = Readonly<{
  file?: string;
  limit?: number;
}>;

export type Civ7SetupMapRowsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  rows: ReadonlyArray<Civ7SetupMapRow>;
  limit: number;
  matchedFile?: string;
}>;

export type Civ7SetupMapRowVisibilityInput = Readonly<{
  file: string;
  limit?: number;
  reloadIfMissing?: "none" | "exit-to-shell";
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SetupMapRowVisibilityResult = Readonly<{
  initial: Civ7SetupMapRowsResult;
  final: Civ7SetupMapRowsResult;
  shellBefore?: Civ7SetupSnapshotResult;
  shellAfter?: Civ7SetupSnapshotResult;
  shellExit?: Civ7CommandResult;
  reload?: Civ7CommandResult;
  refreshed: boolean;
  verified: boolean;
}>;

export type Civ7SetupOptionValue = string | number | boolean;

export type Civ7PlayerSetupOptions = Readonly<{
  playerId: number;
  options: Readonly<Record<string, Civ7SetupOptionValue>>;
}>;

export type Civ7SavedGameConfigurationRef = Readonly<{
  id: string;
  displayName: string;
  fileName: string;
  path: string;
}>;

export type Civ7SavedGameConfigurationSummary = Readonly<{
  gameSpeed?: string;
  mapSize?: string;
  mapName?: string;
  leader?: string;
  civilization?: string;
  difficulty?: string;
  mapSeed?: number;
  gameSeed?: number;
}>;

export type Civ7SavedGameConfiguration = Civ7SavedGameConfigurationRef & Readonly<{
  sizeBytes: number;
  modifiedAt: string;
  source: "local-disk";
  summary: Civ7SavedGameConfigurationSummary;
  setupOptions: Readonly<Record<string, Civ7SetupOptionValue>>;
  playerOptions: ReadonlyArray<Civ7PlayerSetupOptions>;
}>;

export type Civ7SavedGameConfigurationListInput = Readonly<{
  directory?: string;
  maxFiles?: number;
}>;

export type Civ7SavedGameConfigurationListResult = Readonly<{
  directory: string;
  configurations: ReadonlyArray<Civ7SavedGameConfiguration>;
}>;

export type Civ7SavedGameConfigurationLoadResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  savedConfig: Civ7SavedGameConfigurationRef;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  loaded: boolean;
}>;

export type Civ7SinglePlayerSetupInput = Readonly<{
  mapScript: string;
  mapSize: string;
  seed: number;
  gameSeed?: number;
  playerCount?: number;
  savedConfig?: Civ7SavedGameConfigurationRef;
  options?: Readonly<Record<string, Civ7SetupOptionValue>>;
  playerOptions?: ReadonlyArray<Civ7PlayerSetupOptions>;
  requireShell?: boolean;
}>;

export type Civ7PreparedSetupResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  savedConfigLoad?: Civ7SavedGameConfigurationLoadResult;
  applied: Readonly<Record<string, Civ7SetupOptionValue>>;
  verified: boolean;
}>;

export type Civ7PreparedStartInput = Readonly<{
  expected: Civ7SinglePlayerSetupInput;
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerStartResult = Readonly<{
  command: Civ7CommandResult;
  begin?: Civ7CommandResult;
  beginAttempted: boolean;
  beginError?: string;
  before: Civ7SetupSnapshotResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  mapSummary?: Civ7MapSummaryResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
  verified: boolean;
}>;

export type Civ7SinglePlayerRunInput = Civ7SinglePlayerSetupInput & Readonly<{
  fromRunningGame?: "reject" | "exit-to-shell";
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerRunResult = Readonly<{
  shellExit?: Civ7CommandResult;
  prepare: Civ7PreparedSetupResult;
  start: Civ7SinglePlayerStartResult;
  verified: boolean;
}>;

export type Civ7AutoplayStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  autoplay: Civ7AppUiSnapshot["autoplay"];
  game: Civ7AppUiSnapshot["game"];
  gameContext: Civ7AppUiSnapshot["gameContext"];
}>;

export type Civ7AutoplayPollOptions = Civ7DirectControlOptions & Readonly<{
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  stabilityWindowMs?: number;
}>;

export type Civ7AutoplayOptions = Civ7AutoplayPollOptions & Readonly<{
  turns?: number;
  observeAsPlayer?: number;
  returnAsPlayer?: number;
  pause?: boolean;
  maxTurns?: number;
}>;

export type Civ7AutoplayActionResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7AutoplayStatusResult;
  after: Civ7AutoplayStatusResult;
  commands: ReadonlyArray<Civ7CommandResult>;
  verified: boolean;
}>;

export type Civ7RevealMapResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  before: Civ7VisibilitySummaryResult;
  after: Civ7VisibilitySummaryResult;
  command: Civ7CommandResult;
  classification: "revealed" | "already-revealed" | "unverified";
}>;

export type Civ7TurnCompletionStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
}>;

export type Civ7TurnCompletionActionResult = Readonly<{
  before: Civ7TurnCompletionStatusResult;
  after: Civ7TurnCompletionStatusResult;
  command: Civ7CommandResult;
  verified: boolean;
}>;

export type Civ7PlayDecisionHint = Readonly<{
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  confidence: "live-proof" | "official-ui" | "heuristic";
  notes: ReadonlyArray<string>;
}>;

export type Civ7PlayDecisionInput = Readonly<{
  name: string;
  source: string;
  required: boolean;
  note?: string;
}>;

export type Civ7PlayDecisionAction = Readonly<{
  label: string;
  cli?: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  when: string;
}>;

export type Civ7PlayNotificationSummary = Readonly<{
  id: Civ7ComponentId | null;
  type: unknown;
  typeName: string | null;
  groupType: unknown;
  player: unknown;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  isEndTurnBlocking: boolean;
  decision: Civ7PlayDecisionHint;
  details?: unknown;
}>;

export type Civ7PlayDecisionQueueItem = Readonly<{
  notificationId: Civ7ComponentId | null;
  isEndTurnBlocking: boolean;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  player: unknown;
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  notes: ReadonlyArray<string>;
  details?: unknown;
}>;

export type Civ7PlayNotificationViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  blockingNotificationId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  notifications: ReadonlyArray<Civ7PlayNotificationSummary>;
  decisions: ReadonlyArray<Civ7PlayDecisionHint>;
  hud: Readonly<{
    nextDecision: Civ7PlayDecisionQueueItem | null;
    decisionQueue: ReadonlyArray<Civ7PlayDecisionQueueItem>;
  }>;
  limits: Readonly<{
    maxNotifications: number;
    truncated: boolean;
  }>;
}>;

export type Civ7NotificationDismissInput = Readonly<{
  notificationId: Civ7ComponentId;
}>;

export type Civ7NotificationDismissalSummary = Readonly<{
  id: Civ7ComponentId | null;
  exists: boolean;
  type: unknown;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  blocksTurnAdvancement: Civ7RuntimeProbe<unknown>;
  endTurnBlockingType: Civ7RuntimeProbe<unknown>;
  isEndTurnBlocking: Civ7RuntimeProbe<boolean>;
  engineQueueCount: Civ7RuntimeProbe<number>;
  engineQueueContains: Civ7RuntimeProbe<boolean>;
  engineQueueFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isEngineQueueFront: Civ7RuntimeProbe<boolean>;
  notificationTrainCount: Civ7RuntimeProbe<number>;
  notificationTrainContains: Civ7RuntimeProbe<boolean>;
  notificationTrainFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isNotificationTrainFront: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7NotificationDismissalResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  notificationId: Civ7ComponentId;
  before: Civ7NotificationDismissalSummary;
  after: Civ7NotificationDismissalSummary | null;
  canDismiss: boolean;
  sent: boolean;
  result: unknown;
  closeoutPath?: string | null;
  verificationAttempts?: ReadonlyArray<Civ7NotificationDismissalSummary>;
  verified: boolean;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DiplomacyResponseInput = Readonly<{
  playerId: number;
  actionId: number;
  responseType: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
  uiCloseout?: boolean;
}>;

export type Civ7DiplomacyResponseCommandPayload = Readonly<{
  localPlayerId: number;
  playerId: number;
  actionId: number;
  responseType: number;
  args: Readonly<{ ID: number; Type: number }>;
  notificationId: Civ7ComponentId | null;
  discoveredNotification: unknown;
  activated: boolean;
  activationResult: unknown;
  canStart: unknown;
  sent: boolean;
  sendResult: unknown;
  uiCloseout: Readonly<{
    requested: boolean;
    acknowledgeStarted: unknown;
    closeCurrentDiplomacyProject: unknown;
    hide: unknown;
  }>;
  diplomacyState: Readonly<{
    before: unknown;
    after: unknown;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DiplomacyResponsePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "diplomacy-blocker-cleared"
  | "blocking-notification-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7DiplomacyResponsePostcondition = Readonly<{
  classification: Civ7DiplomacyResponsePostconditionClassification;
  reason: string;
}>;

export type Civ7DiplomacyResponseResult = Readonly<{
  before: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  payload?: Civ7DiplomacyResponseCommandPayload;
  after: Civ7PlayNotificationViewResult;
  afterValidation: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition: Civ7DiplomacyResponsePostcondition;
}>;

export type Civ7NarrativeChoiceInput = Readonly<{
  playerId: number;
  targetType: string;
  target: Civ7ComponentId;
  action: number;
}>;

export type Civ7NarrativeChoiceCommandPayload = Readonly<{
  localPlayerId: number;
  playerId: number;
  args: Readonly<{ TargetType: string; Target: Civ7ComponentId; Action: number }>;
  canStart: unknown;
  sent: boolean;
  sendResult: unknown;
  ui: Readonly<{
    before: unknown;
    after: unknown;
    panelClose: unknown;
    popupClose: unknown;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7NarrativeChoicePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "narrative-blocker-cleared"
  | "narrative-panel-cleared"
  | "validation-changed"
  | "no-state-change";

export type Civ7NarrativeChoicePostcondition = Readonly<{
  classification: Civ7NarrativeChoicePostconditionClassification;
  reason: string;
}>;

export type Civ7NarrativeChoiceResult = Readonly<{
  before: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  payload?: Civ7NarrativeChoiceCommandPayload;
  after: Civ7PlayNotificationViewResult;
  afterValidation: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition: Civ7NarrativeChoicePostcondition;
}>;

export type Civ7TechnologyChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7TechnologyChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

export type Civ7CultureChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7CultureChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

export type Civ7OperationFamily =
  | "unit-operation"
  | "unit-command"
  | "city-operation"
  | "city-command"
  | "player-operation";

export type Civ7OperationTarget =
  | Readonly<{ unitId: Civ7ComponentId }>
  | Readonly<{ cityId: Civ7ComponentId }>
  | Readonly<{ playerId: number }>;

export type Civ7OperationInput = Civ7OperationTarget & Readonly<{
  operationType: string;
  args?: unknown;
}>;

export type Civ7ActionApproval = Readonly<{
  approved: true;
  reason: string;
  disposableSession?: boolean;
}>;

export type Civ7OperationValidationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  family: Civ7OperationFamily;
  operationType: string;
  enumValue: unknown;
  target: Civ7OperationTarget;
  args: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7UnitOperationPostconditionClassification =
  | "not-sent"
  | "queue-advanced"
  | "selected-unit-changed"
  | "activity-changed"
  | "unit-state-changed"
  | "blocker-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7UnitOperationPostconditionSnapshot = Readonly<{
  unit: Civ7RuntimeProbe<unknown>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7UnitOperationPostcondition = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  classification: Civ7UnitOperationPostconditionClassification;
  before?: Civ7UnitOperationPostconditionSnapshot;
  after?: Civ7UnitOperationPostconditionSnapshot;
  reason: string;
}>;

export type Civ7PopulationPlacementPostconditionClassification =
  | "not-sent"
  | "population-ready-cleared"
  | "placement-state-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7PopulationPlacementPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  isReadyToPlacePopulation: Civ7RuntimeProbe<unknown>;
  cityWorkerCap: Civ7RuntimeProbe<unknown>;
  workablePlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  blockedPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
}>;

export type Civ7PopulationPlacementPostcondition = Readonly<{
  family: "player-operation" | "city-command";
  operationType: string;
  classification: Civ7PopulationPlacementPostconditionClassification;
  before?: Civ7PopulationPlacementPostconditionSnapshot;
  after?: Civ7PopulationPlacementPostconditionSnapshot;
  readyCleared: boolean;
  placementStateChanged: boolean;
  reason: string;
}>;

export type Civ7OperationRequestResult = Readonly<{
  before: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  after: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition?: Civ7UnitOperationPostcondition;
  populationPostcondition?: Civ7PopulationPlacementPostcondition;
  productionPostcondition?: Civ7ProductionPostcondition;
}>;

export type Civ7ProductionPostconditionClassification =
  | "not-sent"
  | "production-choice-cleared"
  | "production-state-changed"
  | "production-state-changed-blocker-still-live"
  | "validation-changed"
  | "no-state-change";

export type Civ7ProductionPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  buildQueue: Civ7RuntimeProbe<unknown>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
  canEndTurn: Civ7RuntimeProbe<unknown>;
  blockingProductionNotification: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7ProductionPostcondition = Readonly<{
  family: "city-operation";
  operationType: "BUILD";
  classification: Civ7ProductionPostconditionClassification;
  before?: Civ7ProductionPostconditionSnapshot;
  after?: Civ7ProductionPostconditionSnapshot;
  productionStateChanged: boolean;
  blockerStillLive: boolean;
  reason: string;
}>;

export type Civ7ProductionChoiceInput = Readonly<{
  cityId: Civ7ComponentId;
  args: Readonly<Record<string, number>>;
}>;

export type Civ7ProductionChoiceCommandPayload = Readonly<{
  cityId: Civ7ComponentId;
  args: unknown;
  beforeValidation: unknown;
  afterValidation: unknown;
  sent: boolean;
  sendResult?: Civ7RuntimeProbe<unknown>;
  beforeProductionPostcondition: Civ7ProductionPostconditionSnapshot;
  afterProductionPostcondition: Civ7ProductionPostconditionSnapshot;
  ui?: Readonly<{
    cityActivation?: Civ7RuntimeProbe<unknown>;
    interfaceClose?: Civ7RuntimeProbe<unknown>;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProductionChoiceResult = Civ7OperationRequestResult & Readonly<{
  payload?: Civ7ProductionChoiceCommandPayload;
}>;

export type Civ7UnitTargetActionInput = Readonly<{
  unitId: Civ7ComponentId;
  x: number;
  y: number;
}>;

export type Civ7UnitTargetActionCandidate = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  args: unknown;
  valid: boolean;
  result: unknown;
  targetInReturnedPlots: boolean | null;
  rejectedReason?: string;
}>;

export type Civ7UnitTargetActionResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  unitId: Civ7ComponentId;
  target: Readonly<{ x: number; y: number; index: Civ7RuntimeProbe<number> }>;
  beforeUnit: Civ7RuntimeProbe<unknown>;
  beforeTargetUnits: Civ7RuntimeProbe<unknown>;
  candidates: ReadonlyArray<Civ7UnitTargetActionCandidate>;
  selected: Civ7UnitTargetActionCandidate | null;
  sent: boolean;
  sendResult?: unknown;
  afterUnit?: Civ7RuntimeProbe<unknown>;
  afterTargetUnits?: Civ7RuntimeProbe<unknown>;
  verified?: boolean;
  verification?: Readonly<{
    status: "verified" | "no-state-change" | "not-sent";
    classification: "target-reached" | "path-shortfall" | "unit-state-changed" | "target-state-changed" | "no-state-change" | "not-sent";
    unitChanged: boolean;
    targetUnitsChanged: boolean;
    destinationReached: boolean | null;
    requestedLocation: Civ7MapLocation;
    landedLocation?: Civ7MapLocation | null;
    source?: "immediate" | "bounded-poll";
    attempts?: number;
    observedAfterMs?: number;
    reason: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyUnitViewInput = Readonly<{
  unitId?: Civ7ComponentId;
  radius?: number;
  maxOperations?: number;
}>;

export type Civ7ReadyUnitOperationCandidate = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  enumValue: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7ReadyUnitNearbyPlot = Readonly<{
  x: number;
  y: number;
  units: unknown;
}>;

export type Civ7ReadyUnitPromotionReadiness = Readonly<{
  hasExperience: boolean;
  canPromote: unknown;
  promotionClass: string | null;
  level: unknown;
  experiencePoints: unknown;
  experienceToNextLevel: unknown;
  totalPromotionsEarned: unknown;
  storedPromotionPoints: unknown;
  storedCommendations: unknown;
  canPurchase: boolean;
  availablePromotions: ReadonlyArray<Readonly<{
    disciplineType: string;
    promotionType: string;
    name: string | null;
    description: string | null;
    commendation: boolean;
    args: unknown;
    validation: unknown;
  }>>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyUnitViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedUnitId: Civ7ComponentId | null;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  unitId: Civ7ComponentId | null;
  unit: Civ7RuntimeProbe<unknown>;
  legalOperations: ReadonlyArray<Civ7ReadyUnitOperationCandidate>;
  promotionReadiness: Civ7RuntimeProbe<Civ7ReadyUnitPromotionReadiness | null>;
  nearby: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyUnitNearbyPlot>>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7UnitMovePreviewInput = Readonly<{
  unitId?: Civ7ComponentId;
  destination?: Civ7MapLocation;
  maxPlots?: number;
  maxPathPlots?: number;
}>;

export type Civ7UnitMovePreviewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedUnitId: Civ7ComponentId | null;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  unitId: Civ7ComponentId | null;
  unit: Civ7RuntimeProbe<unknown>;
  reachableMovement: Civ7RuntimeProbe<unknown>;
  reachableZonesOfControl: Civ7RuntimeProbe<unknown>;
  reachableTargets: Civ7RuntimeProbe<unknown>;
  queuedDestination: Civ7RuntimeProbe<Civ7MapLocation | null>;
  queuedPath: Civ7RuntimeProbe<unknown>;
  requestedDestination: Civ7MapLocation | null;
  requestedPath: Civ7RuntimeProbe<unknown>;
  relationshipPolicy: Readonly<{
    relationshipSource: "not-classified";
    relationshipProof: "none";
    unprovenLabel: "relationship-unproven";
    guidance: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyCityViewInput = Readonly<{
  cityId?: Civ7ComponentId;
  maxOperations?: number;
}>;

export type Civ7ReadyCityOperationCandidate = Readonly<{
  family: "city-operation" | "city-command";
  operationType: string;
  enumValue: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7ReadyCityProductionCandidate = Readonly<{
  kind: "unit" | "constructible" | "project";
  type: unknown;
  typeName: string | null;
  name: string | null;
  args: unknown;
  cost?: unknown;
  turns?: unknown;
  productionBasis?: unknown;
  baseYieldSummary?: unknown;
  valid: boolean;
  result: unknown;
  placementPlots?: ReadonlyArray<unknown>;
  cli: string;
}>;

export type Civ7ReadyCityTownFocusOption = Readonly<{
  name: string | null;
  description: string | null;
  args: unknown;
  valid: boolean;
  result: unknown;
  cli: string;
}>;

export type Civ7ReadyCityPopulationPlacement = Readonly<{
  isReadyToPlacePopulation: Civ7RuntimeProbe<unknown>;
  cityWorkerCap: Civ7RuntimeProbe<unknown>;
  yieldTypeOrder: ReadonlyArray<string>;
  allPlacementInfo: Civ7RuntimeProbe<unknown>;
  workablePlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  blockedPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  workablePlots: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionCandidates: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionResult: Civ7RuntimeProbe<unknown>;
  cliHints: ReadonlyArray<string>;
}>;

export type Civ7ReadyCityViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedCityId: Civ7ComponentId | null;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blockingCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  legalOperations: ReadonlyArray<Civ7ReadyCityOperationCandidate>;
  productionCandidates: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyCityProductionCandidate>>;
  townFocusOptions: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyCityTownFocusOption>>;
  populationPlacement: Civ7RuntimeProbe<Civ7ReadyCityPopulationPlacement>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7SettlementRecommendationInput = Readonly<{
  playerId?: number;
  locations?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  count?: number;
  includeSettlers?: boolean;
  includeCities?: boolean;
}>;

export type Civ7SettlementRecommendationFactor = Readonly<{
  positive: boolean;
  title: string | null;
  description: string | null;
}>;

export type Civ7SettlementRecommendationOrigin = Readonly<{
  kind: "requested" | "settler" | "city";
  location: Readonly<{ x: number; y: number }>;
  plotIndex: Civ7RuntimeProbe<number>;
  unitId?: Civ7ComponentId;
  cityId?: Civ7ComponentId;
  name?: string | null;
}>;

export type Civ7SettlementRecommendation = Readonly<{
  origin: Civ7SettlementRecommendationOrigin;
  suggestions: Civ7RuntimeProbe<ReadonlyArray<Readonly<{
    location: Readonly<{ x: number; y: number }> | null;
    plotIndex: Civ7RuntimeProbe<number>;
    factors: ReadonlyArray<Civ7SettlementRecommendationFactor>;
  }>>>;
}>;

export type Civ7SettlementRecommendationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  count: number;
  requestedLocations: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  origins: ReadonlyArray<Civ7SettlementRecommendationOrigin>;
  recommendations: ReadonlyArray<Civ7SettlementRecommendation>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7TargetCandidatesInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  maxCandidates?: number;
  maxPlayers?: number;
  unitRadius?: number;
}>;

export type Civ7TargetCandidate = Readonly<{
  owner: number;
  leaderName: Civ7RuntimeProbe<unknown>;
  civilizationName: Civ7RuntimeProbe<unknown>;
  isHuman: Civ7RuntimeProbe<unknown>;
  cityCount: number;
  unitCount: number;
  cities: unknown;
  nearestCity: unknown;
  nearestDistance: number | null;
  nearbyUnits: unknown;
  nearbyUnitCount: number;
  apparentStrength: number;
  approach: Readonly<{
    nearestOrigin: Readonly<{ x: number; y: number }> | null;
    targetLocation: Readonly<{ x: number; y: number }> | null;
    directGridDistance: number | null;
    routeHint: string;
    routeKind: string;
    originWater: Civ7RuntimeProbe<unknown> | null;
    targetWater: Civ7RuntimeProbe<unknown> | null;
    waterSampleCount: number;
    landSampleCount: number;
    notes: ReadonlyArray<string>;
  }>;
  reasons: ReadonlyArray<string>;
}>;

export type Civ7TargetCandidatesResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  unitRadius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  candidates: ReadonlyArray<Civ7TargetCandidate>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7BattlefieldScanInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius?: number;
  maxPlayers?: number;
  maxUnits?: number;
  maxCities?: number;
}>;

export type Civ7BattlefieldScanResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  units: unknown;
  cities: unknown;
  owners: unknown;
  pointsOfInterest: unknown;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DestinationAnalysisInput = Readonly<{
  playerId?: number;
  origin?: Readonly<{ x: number; y: number }>;
  destination: Readonly<{ x: number; y: number }>;
  corridorRadius?: number;
  destinationRadius?: number;
  maxPlayers?: number;
  maxUnits?: number;
  maxCities?: number;
}>;

export type Civ7DestinationAnalysisResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origin: Readonly<{ x: number; y: number }> | null;
  destination: Readonly<{ x: number; y: number }>;
  corridorRadius: number;
  destinationRadius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  corridor: unknown;
  destinationPressure: unknown;
  pointsOfInterest: unknown;
  notes: ReadonlyArray<string>;
}>;

export type Civ7CapabilityCatalogOptions = Civ7DirectControlOptions & Readonly<{
  includeRuntime?: boolean;
  includeStatic?: boolean;
  appUiRoots?: ReadonlyArray<string>;
  tunerRoots?: ReadonlyArray<string>;
}>;

export type Civ7RestartAndBeginResult = Readonly<{
  restart: Civ7CommandResult;
  begin?: Civ7CommandResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
}>;

export type Civ7DirectControlHealth =
  | Readonly<{
      ok: true;
      status: "ready";
      host: string;
      port: number;
      states: ReadonlyArray<Civ7TunerState>;
      selectedState?: Civ7TunerState;
    }>
  | Readonly<{
      ok: false;
      status: "unavailable" | "no-states" | "state-missing" | "command-failed";
      host?: string;
      port?: number;
      states?: ReadonlyArray<Civ7TunerState>;
      error: Civ7DirectControlError;
    }>;

type PendingCiv7TunerRequest = {
  resolve: (frame: Civ7TunerFrame) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
  message: string;
};

let nextListenerId = Math.trunc(Date.now() % 1_000_000);

export function createCiv7ControlRequestId(prefix = "civ7-control"): string {
  return `${prefix}-${Date.now().toString(36)}-${process.pid.toString(36)}`;
}

export function resolveCiv7DirectControlConfig(options: Civ7DirectControlOptions = {}): {
  hosts: string[];
  port: number;
  timeoutMs: number;
} {
  const env = options.env ?? process.env;
  const hosts = uniqueNonEmpty([
    ...(options.hosts ?? []),
    options.host,
    ...splitEnvList(env.CIV7_TUNER_HOSTS),
    env.CIV7_TUNER_HOST,
    DEFAULT_CIV7_TUNER_HOST,
  ]);
  if (hosts.length === 0) {
    throw new Civ7DirectControlError("no-hosts", "No Civ7 tuner hosts were configured");
  }
  return {
    hosts,
    port: options.port ?? portFromEnv(env) ?? DEFAULT_CIV7_TUNER_PORT,
    timeoutMs: options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  };
}

export async function discoverCiv7DirectControlEndpoint(
  options: Civ7DirectControlOptions = {},
): Promise<Readonly<{ endpoint: Civ7DirectControlEndpoint; states: ReadonlyArray<Civ7TunerState> }>> {
  const config = resolveCiv7DirectControlConfig(options);
  const errors: Array<{ host: string; error: string }> = [];
  for (const host of config.hosts) {
    try {
      const states = await queryCiv7TunerStates({
        host,
        port: config.port,
        timeoutMs: config.timeoutMs,
      });
      return {
        endpoint: { host, port: config.port },
        states,
      };
    } catch (err) {
      errors.push({ host, error: errorMessage(err) });
    }
  }
  throw new Civ7DirectControlError(
    "all-hosts-unavailable",
    `Unable to reach Civ7 tuner socket on ${config.hosts.join(", ")}:${config.port}`,
    { details: errors },
  );
}

export class Civ7DirectControlSession {
  private readonly config: ReturnType<typeof resolveCiv7DirectControlConfig>;
  private socket: Socket | undefined;
  private endpointValue: Civ7DirectControlEndpoint | undefined;
  private buffer = Buffer.alloc(0);
  private readonly pending = new Map<number, PendingCiv7TunerRequest>();

  constructor(options: Civ7DirectControlOptions = {}) {
    this.config = resolveCiv7DirectControlConfig(options);
  }

  get endpoint(): Civ7DirectControlEndpoint | undefined {
    return this.endpointValue;
  }

  async connect(): Promise<Civ7DirectControlEndpoint> {
    if (this.socket && !this.socket.destroyed && this.endpointValue) {
      return this.endpointValue;
    }

    await this.close();
    const errors: Array<{ host: string; error: string }> = [];
    for (const host of this.config.hosts) {
      try {
        const socket = await openCiv7TunerSocket({
          host,
          port: this.config.port,
          timeoutMs: this.config.timeoutMs,
        });
        this.socket = socket;
        this.endpointValue = { host, port: this.config.port };
        this.buffer = Buffer.alloc(0);
        socket.on("data", (chunk) => this.handleData(chunk));
        socket.once("error", (err) => {
          this.rejectPending(new Civ7DirectControlError("connection-failed", err.message, { cause: err }));
        });
        socket.once("close", () => {
          this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
          this.socket = undefined;
          this.endpointValue = undefined;
        });
        return this.endpointValue;
      } catch (err) {
        errors.push({ host, error: errorMessage(err) });
      }
    }

    throw new Civ7DirectControlError(
      "all-hosts-unavailable",
      `Unable to reach Civ7 tuner socket on ${this.config.hosts.join(", ")}:${this.config.port}`,
      { details: errors },
    );
  }

  async close(): Promise<void> {
    const socket = this.socket;
    this.socket = undefined;
    this.endpointValue = undefined;
    this.buffer = Buffer.alloc(0);
    this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
    if (socket && !socket.destroyed) socket.destroy();
  }

  async queryStates(options: { timeoutMs?: number } = {}): Promise<ReadonlyArray<Civ7TunerState>> {
    const response = await this.request("LSQ:", options.timeoutMs);
    return tunerStatesFromParts(response.parts);
  }

  async executeCommand(options: {
    command: string;
    state?: Civ7TunerStateSelection;
    timeoutMs?: number;
  }): Promise<Civ7CommandResult> {
    const command = options.command.trim();
    if (!command) {
      throw new Civ7DirectControlError("command-failed", "Civ7 command must not be empty");
    }
    const states = await this.queryStates({ timeoutMs: options.timeoutMs });
    const state = selectCiv7TunerState(states, options.state);
    const response = await this.request(`CMD:${state.id}:${command}`, options.timeoutMs);
    const endpoint = this.endpoint;
    if (!endpoint) {
      throw new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed after command completed");
    }
    return {
      host: endpoint.host,
      port: endpoint.port,
      state,
      output: response.parts,
    };
  }

  async request(message: string, timeoutMs = this.config.timeoutMs): Promise<Civ7TunerFrame> {
    await this.connect();
    const socket = this.socket;
    if (!socket || socket.destroyed) {
      throw new Civ7DirectControlError("socket-closed", `Civ7 tuner socket is closed before ${message}`);
    }
    const listenerId = allocateListenerId();
    const response = new Promise<Civ7TunerFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(listenerId);
        reject(
          new Civ7DirectControlError(
            "response-timeout",
            `Timed out waiting for Civ7 tuner response to ${message}`,
          ),
        );
      }, timeoutMs);
      this.pending.set(listenerId, { resolve, reject, timer, message });
    });
    socket.write(encodeCiv7TunerRequest(listenerId, message));
    return await response;
  }

  private handleData(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const parsed = parseCiv7TunerFrame(this.buffer);
      if (!parsed) return;
      this.buffer = this.buffer.subarray(parsed.bytesRead);
      const pending = this.pending.get(parsed.frame.listenerId);
      if (!pending) continue;
      clearTimeout(pending.timer);
      this.pending.delete(parsed.frame.listenerId);
      pending.resolve(parsed.frame);
    }
  }

  private rejectPending(err: Civ7DirectControlError): void {
    for (const [listenerId, pending] of this.pending) {
      clearTimeout(pending.timer);
      this.pending.delete(listenerId);
      pending.reject(
        new Civ7DirectControlError(
          err.code,
          err.message === "Civ7 tuner socket closed"
            ? `Civ7 tuner socket closed while waiting for ${pending.message}`
            : err.message,
          { cause: err, details: { message: pending.message } },
        ),
      );
    }
  }
}

export async function queryCiv7TunerStates(options: Civ7DirectControlOptions = {}): Promise<ReadonlyArray<Civ7TunerState>> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.queryStates();
  } finally {
    await session.close();
  }
}

export function selectCiv7TunerState(
  states: ReadonlyArray<Civ7TunerState>,
  selection: Civ7TunerStateSelection = { role: "app-ui" },
): Civ7TunerState {
  const requested = normalizeStateSelection(selection);
  const state = states.find((candidate) => {
    if (requested.id && candidate.id === requested.id) return true;
    if (requested.name && candidate.name === requested.name) return true;
    return false;
  });
  if (!state) {
    const requestedLabel = requested.name ?? requested.id ?? "unknown";
    throw new Civ7DirectControlError(
      "state-not-found",
      `Civ7 tuner state "${requestedLabel}" was not available; states: ${states.map((s) => s.name).join(", ")}`,
      { details: { requested, states } },
    );
  }
  return state;
}

export async function executeCiv7Command(options: Civ7DirectControlOptions & {
  command: string;
  state?: Civ7TunerStateSelection;
}): Promise<Civ7CommandResult> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.executeCommand(options);
  } finally {
    await session.close();
  }
}

export async function executeCiv7AppUiCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "app-ui" },
  });
}

export async function executeCiv7TunerCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "tuner" },
  });
}

export async function inspectCiv7RuntimeApi(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  roots?: ReadonlyArray<string>;
} = {}): Promise<Civ7RuntimeApiInspection> {
  return await inspectCiv7RuntimeApiFromModule(options, {
    appUiStateName: CIV7_TUNER_APP_UI_STATE_NAME,
    defaultAppUiApiRoots: DEFAULT_CIV7_APP_UI_API_ROOTS,
    defaultTunerApiRoots: DEFAULT_CIV7_TUNER_API_ROOTS,
    executeCommand: executeCiv7Command,
    tunerStateName: CIV7_TUNER_STATE_NAME,
  });
}

export async function getCiv7AppUiSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AppUiSnapshotResult> {
  return await getCiv7AppUiSnapshotFromModule(options, {
    executeAppUiCommand: executeCiv7AppUiCommand,
  });
}

export async function beginCiv7Game(options: Civ7DirectControlOptions = {}): Promise<Civ7CommandResult> {
  return await beginCiv7GameFromModule(options, {
    beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
    executeAppUiCommand: executeCiv7AppUiCommand,
  });
}

export async function checkCiv7TunerHealth(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TunerHealthResult> {
  return await checkCiv7TunerHealthFromModule(options, {
    withSession: async (sessionOptions, run) => {
      const session = new Civ7DirectControlSession(sessionOptions);
      try {
        return await run(session);
      } finally {
        await session.close();
      }
    },
    executeSessionCommandWithReconnect,
  });
}

export async function restartCiv7Game(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7CommandResult> {
  return await restartCiv7GameFromModule(options, {
    executeCommand: executeCiv7Command,
    restartCommand: CIV7_RESTART_COMMAND,
  });
}

export async function restartCiv7GameAndBegin(options: Civ7DirectControlOptions & {
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7RestartAndBeginResult> {
  return await restartCiv7GameAndBeginFromModule(options, {
    appUiState: { role: "app-ui" },
    beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
    executeAppUiCommand: executeCiv7AppUiCommand,
    executeCommand: executeCiv7Command,
    executeSessionCommandWithReconnect,
    restartCommand: CIV7_RESTART_COMMAND,
    uiLoadingStates: CIV7_UI_LOADING_STATES,
    waitForTunerReadyWithSession: waitForCiv7TunerReadyWithSession,
    withSession: async <T>(
      sessionOptions: Civ7DirectControlOptions,
      run: (session: Civ7DirectControlSession) => Promise<T>,
    ): Promise<T> => {
      const session = new Civ7DirectControlSession(sessionOptions);
      try {
        return await run(session);
      } finally {
        await session.close();
      }
    },
  });
}

export async function checkCiv7DirectControlHealth(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7DirectControlHealth> {
  try {
    const discovered = await discoverCiv7DirectControlEndpoint(options);
    if (discovered.states.length === 0) {
      return {
        ok: false,
        status: "no-states",
        host: discovered.endpoint.host,
        port: discovered.endpoint.port,
        states: discovered.states,
        error: new Civ7DirectControlError("state-not-found", "Civ7 tuner returned no scripting states"),
      };
    }
    let selectedState: Civ7TunerState | undefined;
    if (options.state) {
      try {
        selectedState = selectCiv7TunerState(discovered.states, options.state);
      } catch (err) {
        return {
          ok: false,
          status: "state-missing",
          host: discovered.endpoint.host,
          port: discovered.endpoint.port,
          states: discovered.states,
          error: toDirectControlError(err, "state-not-found"),
        };
      }
    }
    return {
      ok: true,
      status: "ready",
      host: discovered.endpoint.host,
      port: discovered.endpoint.port,
      states: discovered.states,
      selectedState,
    };
  } catch (err) {
    const error = toDirectControlError(err, "connection-failed");
    return {
      ok: false,
      status: error.code === "state-not-found" ? "state-missing" : "unavailable",
      error,
    };
  }
}

export async function waitForCiv7DirectControl(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7DirectControlHealth & { ok: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7DirectControlHealth | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const health = await checkCiv7DirectControlHealth(options);
    if (health.ok) return health;
    lastHealth = health;
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError("connection-timeout", `Timed out waiting for Civ7 tuner readiness after ${waitTimeoutMs}ms`, {
    details: lastHealth,
  });
}

export async function waitForCiv7TunerReady(options: Civ7DirectControlOptions & {
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7TunerHealthResult & { ready: true }> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await waitForCiv7TunerReadyWithSession(session, options);
  } finally {
    await session.close();
  }
}

export async function getCiv7PlayableStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlayableStatusResult> {
  return await getCiv7PlayableStatusFromModule(options, {
    checkTunerHealth: checkCiv7TunerHealth,
    errorMessage,
    getAppUiSnapshot: getCiv7AppUiSnapshot,
  });
}

export async function getCiv7MapSummary(
  options: Civ7MapSummaryOptions = {},
): Promise<Civ7MapSummaryResult> {
  return await getCiv7MapSummaryFromModule(options, {
    executeCommand: executeCiv7Command,
    executeTunerCommand: executeCiv7TunerCommand,
    parseMapSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapSummaryResult>(result, label),
    parsePlotSnapshot: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlotSnapshotResult>(result, label),
    parseMapGrid: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapGridResult>(result, label),
    boundedInteger,
    defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
    hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
    jsLiteral,
    probeHelperSource,
    validateMapBounds,
    validateMapLocation,
  });
}

export async function getCiv7PlotSnapshot(
  input: Civ7PlotSnapshotInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlotSnapshotResult> {
  return await getCiv7PlotSnapshotFromModule(input, options, {
    executeCommand: executeCiv7Command,
    executeTunerCommand: executeCiv7TunerCommand,
    parseMapSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapSummaryResult>(result, label),
    parsePlotSnapshot: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlotSnapshotResult>(result, label),
    parseMapGrid: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapGridResult>(result, label),
    boundedInteger,
    defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
    hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
    jsLiteral,
    probeHelperSource,
    validateMapBounds,
    validateMapLocation,
  });
}

export async function getCiv7MapGrid(
  input: Civ7MapGridInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7MapGridResult> {
  return await getCiv7MapGridFromModule(input, options, {
    executeCommand: executeCiv7Command,
    executeTunerCommand: executeCiv7TunerCommand,
    parseMapSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapSummaryResult>(result, label),
    parsePlotSnapshot: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlotSnapshotResult>(result, label),
    parseMapGrid: (result, label) =>
      jsonPayloadFromCommandResult<Civ7MapGridResult>(result, label),
    boundedInteger,
    defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
    hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
    jsLiteral,
    probeHelperSource,
    validateMapBounds,
    validateMapLocation,
  });
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
  validateMapBounds(bounds, "bounds");
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
  return await getCiv7PlayerSummaryFromModule(input, options, {
    executeTunerCommand: executeCiv7TunerCommand,
    parsePlayerSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlayerSummaryResult>(result, label),
    parseUnitSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitSummaryResult>(result, label),
    parseCitySummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7CitySummaryResult>(result, label),
    boundedInteger,
    jsLiteral,
    probeHelperSource,
    validatePlayerId,
  });
}

export async function getCiv7UnitSummary(
  input: Civ7UnitSummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitSummaryResult> {
  return await getCiv7UnitSummaryFromModule(input, options, {
    executeTunerCommand: executeCiv7TunerCommand,
    parsePlayerSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlayerSummaryResult>(result, label),
    parseUnitSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitSummaryResult>(result, label),
    parseCitySummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7CitySummaryResult>(result, label),
    boundedInteger,
    jsLiteral,
    probeHelperSource,
    validatePlayerId,
  });
}

export async function getCiv7CitySummary(
  input: Civ7CitySummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7CitySummaryResult> {
  return await getCiv7CitySummaryFromModule(input, options, {
    executeTunerCommand: executeCiv7TunerCommand,
    parsePlayerSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlayerSummaryResult>(result, label),
    parseUnitSummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitSummaryResult>(result, label),
    parseCitySummary: (result, label) =>
      jsonPayloadFromCommandResult<Civ7CitySummaryResult>(result, label),
    boundedInteger,
    jsLiteral,
    probeHelperSource,
    validatePlayerId,
  });
}

export async function getCiv7VisibilitySummary(
  input: Civ7VisibilitySummaryInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7VisibilitySummaryResult> {
  return await getCiv7VisibilitySummaryFromModule(input, options, visibilityDependencies());
}

function visibilityDependencies() {
  return {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    parseVisibilitySummary: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<Civ7VisibilitySummaryResult>(result, label),
    boundedInteger,
    defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
    hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
    jsLiteral,
    probeHelperSource,
    probeValue,
    validateMapBounds,
    validatePlayerId,
    getVisibilitySummary: getCiv7VisibilitySummary,
  } as const;
}

export async function getCiv7GameInfoRows(
  input: Civ7GameInfoRowsInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7GameInfoRowsResult> {
  return await getCiv7GameInfoRowsFromModule(input, options, {
    executeTunerCommand: executeCiv7TunerCommand,
    parseGameInfoRows: (result, label) =>
      jsonPayloadFromCommandResult<Civ7GameInfoRowsResult>(result, label),
    boundedInteger,
    defaultGameInfoLimit: DEFAULT_CIV7_GAMEINFO_LIMIT,
    hardGameInfoLimit: HARD_CIV7_GAMEINFO_LIMIT,
    jsLiteral,
    probeHelperSource,
    validateIdentifier,
  });
}

export async function getCiv7SetupSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupSnapshotResult> {
  return await getCiv7SetupSnapshotFromModule(options, setupReadDependencies());
}

export async function getCiv7SetupMapRows(
  input: Civ7SetupMapRowsInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupMapRowsResult> {
  return await getCiv7SetupMapRowsFromModule(input, options, setupReadDependencies());
}

function setupReadDependencies() {
  return {
    assertApproved,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    exitToMainMenuCommand: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
    jsLiteral,
    loadSavedGameConfiguration: loadCiv7SavedGameConfiguration,
    parseSetupMapRows: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<Civ7SetupMapRowsResult>(result, label),
    parseSetupPreparation: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<{
        before: Civ7SetupSnapshot;
        after: Civ7SetupSnapshot;
        applied: Record<string, Civ7SetupOptionValue>;
      }>(result, label),
    parseSetupSnapshot: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<Civ7SetupSnapshotResult>(result, label),
    probeHelperSource,
    playerSetupParameterIds: DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
    reloadUiCommand: CIV7_RELOAD_UI_COMMAND,
    setupParameterIds: DEFAULT_CIV7_SETUP_PARAMETER_IDS,
    validateIdentifier,
  } as const;
}

function setupStartDependencies() {
  return {
    ...setupReadDependencies(),
    appUiState: { role: "app-ui" } as const,
    beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
    executeSessionCommandWithReconnect,
    getMapSummary: getCiv7MapSummary,
    parseStartPayload: (result: Civ7CommandResult, label: string) =>
      jsonPayloadFromCommandResult<{ ok: unknown }>(result, label),
    uiLoadingStates: CIV7_UI_LOADING_STATES,
    waitForTunerReadyWithSession: waitForCiv7TunerReadyWithSession,
    withSession: async <T>(
      sessionOptions: Civ7DirectControlOptions,
      run: (session: Civ7DirectControlSession) => Promise<T>,
    ): Promise<T> => {
      const session = new Civ7DirectControlSession(sessionOptions);
      try {
        return await run(session);
      } finally {
        await session.close();
      }
    },
  } as const;
}

function setupRunDependencies() {
  return {
    assertApproved,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    exitToMainMenuCommand: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
    getSetupSnapshot: getCiv7SetupSnapshot,
    prepareSetup: prepareCiv7SinglePlayerSetup,
    startPreparedGame: startPreparedCiv7SinglePlayerGame,
    validateIdentifier,
    waitForSetupPhase: waitForCiv7SetupPhase,
  } as const;
}

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {},
): Promise<Civ7SavedGameConfigurationListResult> {
  const directory = resolve(input.directory ?? DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR);
  const entries = await readdir(directory, { withFileTypes: true }).catch((err: unknown) => {
    if (isNodeNotFound(err)) return [];
    throw err;
  });
  const maxFiles = boundedInteger(input.maxFiles ?? 200, 1, 2_000, "maxFiles");
  const configurations: Civ7SavedGameConfiguration[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".civ7cfg") continue;
    const filePath = join(directory, entry.name);
    configurations.push(await readCiv7SavedGameConfiguration(filePath));
    if (configurations.length >= maxFiles) break;
  }
  configurations.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || a.displayName.localeCompare(b.displayName));
  return { directory, configurations };
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
  return await ensureCiv7SetupMapRowVisibleFromModule(input, options, approval, setupReadDependencies());
}

export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7PreparedSetupResult> {
  return await prepareCiv7SinglePlayerSetupFromModule(input, options, approval, setupReadDependencies());
}

export async function startPreparedCiv7SinglePlayerGame(
  input: Civ7PreparedStartInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerStartResult> {
  return await startPreparedCiv7SinglePlayerGameFromModule(input, options, approval, setupStartDependencies());
}

export async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerRunInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerRunResult> {
  return await runCiv7SinglePlayerFromSetupFromModule(input, options, approval, setupRunDependencies());
}

export async function inspectCiv7Root(
  input: Civ7RootInspectionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7RootInspectionResult> {
  return await inspectCiv7RootFromModule(input, options, {
    boundedInteger,
    commandFailedError: (message) => new Civ7DirectControlError("command-failed", message),
    executeCommand: executeCiv7Command,
    jsonPayloadFromCommandResult,
    jsLiteral,
    rootMaxKeysDefault: DEFAULT_CIV7_ROOT_MAX_KEYS,
    rootMaxMethodsDefault: DEFAULT_CIV7_ROOT_MAX_METHODS,
    validateIdentifier,
  });
}

export async function getCiv7AutoplayStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AutoplayStatusResult> {
  return await getCiv7AutoplayStatusFromModule(options, {
    getAppUiSnapshot: getCiv7AppUiSnapshot,
  });
}

export async function configureCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await configureCiv7AutoplayFromModule(options, approval, autoplayDependencies());
}

export async function startCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await startCiv7AutoplayFromModule(options, approval, autoplayDependencies());
}

export async function stopCiv7Autoplay(
  options: Civ7AutoplayOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  return await stopCiv7AutoplayFromModule(options, approval, autoplayDependencies());
}

function autoplayDependencies() {
  return {
    assertApproved,
    boundedInteger,
    defaultMaxTurns: DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
    defaultPollIntervalMs: DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
    defaultStopStabilityMs: DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
    defaultStopWaitMs: DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
    defaultWaitMs: DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
    executeAppUiCommand: executeCiv7AppUiCommand,
    getAppUiSnapshot: getCiv7AppUiSnapshot,
    jsLiteral,
    sleep,
    validatePlayerId,
  };
}

export async function revealCiv7MapForPlayer(
  input: Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7RevealMapResult> {
  return await revealCiv7MapForPlayerFromModule(input, options, approval, visibilityDependencies());
}

export async function getCiv7TurnCompletionStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TurnCompletionStatusResult> {
  return await getCiv7TurnCompletionStatusFromModule(options, {
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseTurnCompletionStatus: (result, label) =>
      jsonPayloadFromCommandResult<Civ7TurnCompletionStatusResult>(result, label),
  });
}

export async function getCiv7PlayNotificationView(
  options: Civ7DirectControlOptions & { maxNotifications?: number } = {},
): Promise<Civ7PlayNotificationViewResult> {
  return await getCiv7PlayNotificationViewFromModule(options, {
    executeAppUiCommand: executeCiv7AppUiCommand,
    parsePlayNotificationView: (result, label) =>
      jsonPayloadFromCommandResult<Civ7PlayNotificationViewResult>(result, label),
  });
}

export async function getCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7NotificationDismissalResult> {
  return await getCiv7NotificationDismissalFromModule(input, options, {
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseNotificationDismissal: (result, label) =>
      jsonPayloadFromCommandResult<Civ7NotificationDismissalResult>(result, label),
    jsLiteral,
  });
}

export async function requestCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NotificationDismissalResult> {
  return await requestCiv7NotificationDismissalFromModule(input, options, approval, {
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseNotificationDismissal: (result, label) =>
      jsonPayloadFromCommandResult<Civ7NotificationDismissalResult>(result, label),
    assertApproved,
    jsLiteral,
  });
}

export async function sendCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  return await sendCiv7TurnCompleteFromModule(options, approval, {
    assertApproved,
    executeAppUiCommand: executeCiv7AppUiCommand,
    getPlayNotificationView: getCiv7PlayNotificationView,
    parseTurnCompletionStatus: (result, label) =>
      jsonPayloadFromCommandResult<Civ7TurnCompletionStatusResult>(result, label),
  });
}

export async function sendCiv7TurnUnready(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  return await sendCiv7TurnUnreadyFromModule(options, approval, {
    assertApproved,
    executeAppUiCommand: executeCiv7AppUiCommand,
    getPlayNotificationView: getCiv7PlayNotificationView,
    parseTurnCompletionStatus: (result, label) =>
      jsonPayloadFromCommandResult<Civ7TurnCompletionStatusResult>(result, label),
  });
}

export async function canStartCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7UnitOperationFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7UnitOperationFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function canStartCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7UnitCommandFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7UnitCommandFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function canStartCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7CityOperationFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7CityOperationFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7ProductionChoice(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7ProductionChoiceResult> {
  return await requestCiv7ProductionChoiceFromModule(input, options, approval, {
    assertApproved,
    assertComponentId: assertCiv7ComponentId,
    canStartCityOperation: canStartCiv7CityOperation,
    executeAppUiCommand: executeCiv7AppUiCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}
export async function canStartCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7CityCommandFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7CityCommandFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function canStartCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await canStartCiv7PlayerOperationFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7PlayerOperationFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    jsonPayloadFromCommandResult,
    jsLiteral,
  });
}

export async function requestCiv7TechnologyChoiceCloseout(
  input: Civ7TechnologyChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TechnologyChoiceCloseoutResult> {
  assertApproved(approval, "choosing Civ7 technology node through App UI closeout");
  validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) throw new Civ7DirectControlError("command-failed", "node must be an integer");
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTechnologyChoiceCloseoutCommand(input, { jsLiteral }),
  });
  const payload = jsonPayloadFromCommandResult<{
    sent?: boolean;
    chooseResult?: { ok?: boolean };
    clearTargetResult?: { ok?: boolean };
  }>(command, "Civ7 technology choice closeout");
  const sent = payload.sent === true;
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    command,
    payload,
    sent,
  };
}

export async function requestCiv7CultureChoiceCloseout(
  input: Civ7CultureChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7CultureChoiceCloseoutResult> {
  assertApproved(approval, "choosing Civ7 culture node through App UI closeout");
  validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) throw new Civ7DirectControlError("command-failed", "node must be an integer");
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildCultureChoiceCloseoutCommand(input, { jsLiteral }),
  });
  const payload = jsonPayloadFromCommandResult<{
    sent?: boolean;
    chooseResult?: { ok?: boolean };
    clearTargetResult?: { ok?: boolean };
  }>(command, "Civ7 culture choice closeout");
  const sent = payload.sent === true;
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    command,
    payload,
    sent,
  };
}

export async function requestCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7DiplomacyResponseResult> {
  return await requestCiv7DiplomacyResponseFromModule(input, options, approval, {
    assertApproved,
    validatePlayerId,
    executeAppUiCommand: executeCiv7AppUiCommand,
    getPlayNotificationView: getCiv7PlayNotificationView,
    canStartPlayerOperation: canStartCiv7PlayerOperation,
    parseDiplomacyPayload: (result, label) =>
      jsonPayloadFromCommandResult<Civ7DiplomacyResponseCommandPayload>(result, label),
    jsLiteral,
    invalidActionIdError: () => {
      throw new Civ7DirectControlError("command-failed", "actionId must be an integer");
    },
    invalidResponseTypeError: () => {
      throw new Civ7DirectControlError("command-failed", "responseType must be an integer");
    },
  });
}

export async function requestCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NarrativeChoiceResult> {
  return await requestCiv7NarrativeChoiceFromModule(input, options, approval, {
    assertApproved,
    validatePlayerId,
    assertComponentId: assertCiv7ComponentId,
    executeAppUiCommand: executeCiv7AppUiCommand,
    getPlayNotificationView: getCiv7PlayNotificationView,
    canStartPlayerOperation: canStartCiv7PlayerOperation,
    parseNarrativePayload: (result, label) =>
      jsonPayloadFromCommandResult<Civ7NarrativeChoiceCommandPayload>(result, label),
    jsLiteral,
    invalidTargetTypeError: () => {
      throw new Civ7DirectControlError("command-failed", "targetType is required");
    },
    invalidActionError: () => {
      throw new Civ7DirectControlError("command-failed", "action must be an integer");
    },
  });
}

export async function getCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitTargetActionResult> {
  return await getCiv7UnitTargetActionFromModule(input, options, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    parseUnitTargetAction: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitTargetActionResult>(result, label),
    verificationWaitMs: DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
    verificationPollIntervalMs: DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  });
}

export async function getCiv7ReadyUnitView(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyUnitViewResult> {
  return await getCiv7ReadyUnitViewFromModule(input, options, {
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseReadyUnitView: (result, label) =>
      jsonPayloadFromCommandResult<Civ7ReadyUnitViewResult>(result, label),
  });
}

export async function getCiv7UnitMovePreview(
  input: Civ7UnitMovePreviewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitMovePreviewResult> {
  return await getCiv7UnitMovePreviewFromModule(input, options, {
    validateMapLocation,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseUnitMovePreview: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitMovePreviewResult>(result, label),
  });
}

export async function getCiv7ReadyCityView(
  input: Civ7ReadyCityViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyCityViewResult> {
  return await getCiv7ReadyCityViewFromModule(input, options, {
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseReadyCityView: (result, label) =>
      jsonPayloadFromCommandResult<Civ7ReadyCityViewResult>(result, label),
  });
}

export async function getCiv7SettlementRecommendations(
  input: Civ7SettlementRecommendationInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SettlementRecommendationResult> {
  return await getCiv7SettlementRecommendationsFromModule(input, options, {
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseSettlementRecommendations: (result, label) =>
      jsonPayloadFromCommandResult<Civ7SettlementRecommendationResult>(result, label),
  });
}

export async function getCiv7TargetCandidates(
  input: Civ7TargetCandidatesInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TargetCandidatesResult> {
  return await getCiv7TargetCandidatesFromModule(input, options, {
    validatePlayerId,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseTargetCandidates: (result, label) =>
      jsonPayloadFromCommandResult<Civ7TargetCandidatesResult>(result, label),
  });
}

export async function getCiv7TraditionsView(
  input: Civ7TraditionsViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TraditionsViewResult> {
  return await getCiv7TraditionsViewFromModule(input, options, {
    validatePlayerId,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseTraditionsView: (result, label) =>
      jsonPayloadFromCommandResult<Civ7TraditionsViewResult>(result, label),
  });
}

export async function getCiv7ProgressDashboard(
  input: Civ7ProgressDashboardInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ProgressDashboardResult> {
  return await getCiv7ProgressDashboardFromModule(input, options, {
    validatePlayerId,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseProgressDashboard: (result, label) =>
      jsonPayloadFromCommandResult<Civ7ProgressDashboardResult>(result, label),
  });
}

export async function getCiv7BattlefieldScan(
  input: Civ7BattlefieldScanInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7BattlefieldScanResult> {
  return await getCiv7BattlefieldScanFromModule(input, options, {
    validatePlayerId,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseBattlefieldScan: (result, label) =>
      jsonPayloadFromCommandResult<Civ7BattlefieldScanResult>(result, label),
  });
}

export async function getCiv7DestinationAnalysis(
  input: Civ7DestinationAnalysisInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7DestinationAnalysisResult> {
  return await getCiv7DestinationAnalysisFromModule(input, options, {
    validatePlayerId,
    validateMapLocation,
    boundedInteger,
    executeAppUiCommand: executeCiv7AppUiCommand,
    parseDestinationAnalysis: (result, label) =>
      jsonPayloadFromCommandResult<Civ7DestinationAnalysisResult>(result, label),
  });
}

export async function requestCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7UnitTargetActionResult> {
  return await requestCiv7UnitTargetActionFromModule(input, options, approval, {
    assertApproved,
    executeTunerCommand: executeCiv7TunerCommand,
    parseUnitTargetAction: (result, label) =>
      jsonPayloadFromCommandResult<Civ7UnitTargetActionResult>(result, label),
    verificationWaitMs: DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
    verificationPollIntervalMs: DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  });
}

export function createStaticCiv7CapabilityCatalog(): Civ7CapabilityCatalog {
  return createStaticCiv7CapabilityCatalogFromModule({
    gameinfoTables: DEFAULT_CIV7_GAMEINFO_TABLES,
  });
}

export async function generateCiv7CapabilityCatalog(
  options: Civ7CapabilityCatalogOptions = {},
): Promise<Civ7CapabilityCatalog> {
  return await generateCiv7CapabilityCatalogFromModule(options, {
    appUiRoots: DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
    gameinfoTables: DEFAULT_CIV7_GAMEINFO_TABLES,
    inspectRoot: inspectCiv7Root,
    tunerRoots: DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
  });
}

async function openCiv7TunerSocket(options: {
  host: string;
  port: number;
  timeoutMs: number;
}): Promise<Socket> {
  return await new Promise<Socket>((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(
        new Civ7DirectControlError(
          "connection-timeout",
          `Timed out connecting to Civ7 tuner socket ${options.host}:${options.port}`,
        ),
      );
    }, options.timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(
        new Civ7DirectControlError(
          "connection-failed",
          `Failed connecting to Civ7 tuner socket ${options.host}:${options.port}: ${err.message}`,
          { cause: err },
        ),
      );
    });
  });
}

async function sendCiv7TunerMessage(options: {
  socket: Socket;
  message: string;
  timeoutMs: number;
}): Promise<Civ7TunerFrame> {
  const listenerId = allocateListenerId();
  return await new Promise<Civ7TunerFrame>((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Civ7DirectControlError(
          "response-timeout",
          `Timed out waiting for Civ7 tuner response to ${options.message}`,
        ),
      );
    }, options.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      options.socket.off("data", onData);
      options.socket.off("error", onError);
      options.socket.off("close", onClose);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(new Civ7DirectControlError("connection-failed", err.message, { cause: err }));
    };
    const onClose = () => {
      cleanup();
      reject(
        new Civ7DirectControlError(
          "socket-closed",
          `Civ7 tuner socket closed while waiting for ${options.message}`,
        ),
      );
    };
    const onData = (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseCiv7TunerFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        if (parsed.frame.listenerId === listenerId) {
          cleanup();
          resolve(parsed.frame);
          return;
        }
      }
    };
    options.socket.on("data", onData);
    options.socket.once("error", onError);
    options.socket.once("close", onClose);
    options.socket.write(encodeCiv7TunerRequest(listenerId, options.message));
  });
}

function normalizeStateSelection(selection: Civ7TunerStateSelection): { id?: string; name?: string } {
  if (typeof selection === "string") {
    return selection === CIV7_TUNER_APP_UI_STATE_NAME || selection === CIV7_TUNER_STATE_NAME
      ? { name: selection }
      : { id: selection, name: selection };
  }
  if (selection.role === "app-ui") return { name: CIV7_TUNER_APP_UI_STATE_NAME };
  if (selection.role === "tuner") return { name: CIV7_TUNER_STATE_NAME };
  return { id: selection.id, name: selection.name };
}

function allocateListenerId(): number {
  nextListenerId = (nextListenerId + 1) % 0xffff_ffff;
  if (nextListenerId <= 0) nextListenerId = 1;
  return nextListenerId;
}

function portFromEnv(env: NodeJS.ProcessEnv): number | undefined {
  if (!env.CIV7_TUNER_PORT) return undefined;
  const port = Number(env.CIV7_TUNER_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Civ7DirectControlError("invalid-port", `Invalid CIV7_TUNER_PORT: ${env.CIV7_TUNER_PORT}`);
  }
  return port;
}

function splitEnvList(value: string | undefined): string[] {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
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
function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

function jsonPayloadFromCommandResult<T extends object>(result: Civ7CommandResult, label: string): T {
  try {
    const payload = JSON.parse(result.output[0] ?? "{}") as T;
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      ...payload,
    } as T;
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `${label} returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result },
    );
  }
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
  validateMapBounds(bounds, "bounds");
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

function validateMapBounds(bounds: Civ7MapBounds, dimensionLabel = "bounds"): void {
  validateMapLocation(bounds);
  boundedInteger(bounds.width, 1, 1_000_000, `${dimensionLabel}.width`);
  boundedInteger(bounds.height, 1, 1_000_000, `${dimensionLabel}.height`);
}

function validateMapLocation(location: Civ7MapLocation): void {
  boundedInteger(location.x, 0, 1_000_000, "x");
  boundedInteger(location.y, 0, 1_000_000, "y");
}

function validatePlayerId(playerId: number): number {
  return boundedInteger(playerId, 0, 1024, "playerId");
}

function boundedInteger(value: number, min: number, max: number, label: string): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Civ7DirectControlError("command-failed", `${label} must be an integer between ${min} and ${max}`);
  }
  return value;
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

function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Civ7DirectControlError("command-failed", `${label} must be a simple identifier`);
  }
  return value;
}

async function readCiv7SavedGameConfiguration(path: string): Promise<Civ7SavedGameConfiguration> {
  const [info, bytes] = await Promise.all([stat(path), readFile(path)]);
  if (bytes.subarray(0, 4).toString("ascii") !== "CIV7") {
    throw new Civ7DirectControlError("command-failed", `Saved configuration is not a Civ7 file: ${path}`);
  }
  const fileName = basename(path);
  const displayName = basename(fileName, extname(fileName));
  const strings = extractAsciiStrings(bytes);
  const summary = summarizeCiv7CfgStrings(strings);
  const setupOptions: Record<string, Civ7SetupOptionValue> = {};
  if (summary.difficulty) setupOptions.Difficulty = summary.difficulty;
  if (summary.gameSpeed) setupOptions.GameSpeeds = summary.gameSpeed;

  const playerSetupOptions: Record<string, Civ7SetupOptionValue> = {};
  if (summary.leader) playerSetupOptions.PlayerLeader = summary.leader;
  if (summary.civilization) playerSetupOptions.PlayerCivilization = summary.civilization;
  if (summary.difficulty) playerSetupOptions.PlayerDifficulty = summary.difficulty;

  return {
    id: displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fileName,
    displayName,
    fileName,
    path,
    sizeBytes: info.size,
    modifiedAt: info.mtime.toISOString(),
    source: "local-disk",
    summary,
    setupOptions,
    playerOptions: Object.keys(playerSetupOptions).length > 0
      ? [{ playerId: 0, options: playerSetupOptions }]
      : [],
  };
}

function extractAsciiStrings(bytes: Buffer): string[] {
  const strings: string[] = [];
  let start = -1;
  for (let index = 0; index <= bytes.length; index += 1) {
    const byte = index < bytes.length ? bytes[index]! : 0;
    const printable = byte >= 32 && byte <= 126;
    if (printable) {
      if (start < 0) start = index;
      continue;
    }
    if (start >= 0 && index - start >= 3) {
      strings.push(bytes.subarray(start, index).toString("ascii"));
    }
    start = -1;
  }
  return strings;
}

function firstToken(strings: ReadonlyArray<string>, test: (value: string) => boolean): string | undefined {
  return strings.find(test);
}

function firstNumericSeed(strings: ReadonlyArray<string>, afterIndex = 0): number | undefined {
  for (const value of strings.slice(afterIndex)) {
    if (!/^\d{6,10}$/.test(value)) continue;
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed >= 0) return parsed;
  }
  return undefined;
}

function summarizeCiv7CfgStrings(strings: ReadonlyArray<string>): Civ7SavedGameConfigurationSummary {
  const mapSeedIndex = strings.findIndex((value) => /^\d{6,10}$/.test(value));
  const mapSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex) : undefined;
  const gameSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex + 1) : undefined;
  const civilization = firstToken(strings, (value) =>
    /^CIVILIZATION_[A-Z0-9_]+$/.test(value) &&
    !value.startsWith("CIVILIZATION_LEVEL_") &&
    value !== "CIVILIZATION_INDEPENDENT" &&
    value !== "CIVILIZATION_NONE"
  );
  const leader = firstToken(strings, (value) =>
    /^LEADER_[A-Z0-9_]+$/.test(value) &&
    value !== "LEADER_DEFAULT" &&
    !value.startsWith("LEADER_MINOR_CIV_") &&
    value !== "LEADER_INDEPENDENT"
  );
  const summary: {
    gameSpeed?: string;
    mapSize?: string;
    mapName?: string;
    leader?: string;
    civilization?: string;
    difficulty?: string;
    mapSeed?: number;
    gameSeed?: number;
  } = {};
  const gameSpeed = firstToken(strings, (value) => /^GAMESPEED_[A-Z0-9_]+$/.test(value));
  const mapSize = firstToken(strings, (value) => /^MAPSIZE_[A-Z0-9_]+$/.test(value));
  const mapName = firstToken(strings, (value) => /^LOC_MAP_[A-Z0-9_]+_NAME$/.test(value));
  const difficulty = firstToken(strings, (value) => /^DIFFICULTY_[A-Z0-9_]+$/.test(value));
  if (gameSpeed !== undefined) summary.gameSpeed = gameSpeed;
  if (mapSize !== undefined) summary.mapSize = mapSize;
  if (mapName !== undefined) summary.mapName = mapName;
  if (leader !== undefined) summary.leader = leader;
  if (civilization !== undefined) summary.civilization = civilization;
  if (difficulty !== undefined) summary.difficulty = difficulty;
  if (mapSeed !== undefined) summary.mapSeed = mapSeed;
  if (gameSeed !== undefined) summary.gameSeed = gameSeed;
  return summary;
}
async function waitForCiv7SetupPhase(
  phase: Civ7SetupPhase,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
): Promise<Civ7SetupSnapshotResult> {
  const startedAt = Date.now();
  let last: Civ7SetupSnapshotResult | undefined;
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    try {
      const snapshot = await getCiv7SetupSnapshot(options);
      last = snapshot;
      if (snapshot.snapshot.phase === phase) return snapshot;
    } catch {
      // Keep polling during shell transitions; callers get timeout details below.
    }
    await sleep(wait.pollIntervalMs);
  }
  throw new Civ7DirectControlError(
    "setup-phase-invalid",
    `Timed out waiting for Civ7 setup phase ${phase}`,
    { details: last },
  );
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

function assertApproved(approval: Civ7ActionApproval, action: string): void {
  if (!approval || approval.approved !== true || !approval.reason.trim()) {
    throw new Civ7DirectControlError("command-failed", `Explicit approval with a reason is required before ${action}`);
  }
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

function tunerStatesFromParts(parts: ReadonlyArray<string>): Civ7TunerState[] {
  const states: Civ7TunerState[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    states.push({ id: parts[i] ?? "", name: parts[i + 1] ?? "" });
  }
  return states;
}

async function waitForCiv7TunerReadyWithSession(
  session: Civ7DirectControlSession,
  options: {
    timeoutMs?: number;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
): Promise<Civ7TunerHealthResult & { ready: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7TunerHealthResult | undefined;
  let lastError: Civ7DirectControlError | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    try {
      const health = await checkCiv7TunerHealthWithSession(session, options.timeoutMs, {
        executeSessionCommandWithReconnect,
      });
      if (health.ready) return health as Civ7TunerHealthResult & { ready: true };
      lastHealth = health;
    } catch (err) {
      lastError = toDirectControlError(err, "command-failed");
      await session.close();
    }
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError(
    "connection-timeout",
    `Timed out waiting for Civ7 Tuner readiness after ${waitTimeoutMs}ms`,
    { details: lastHealth ?? lastError },
  );
}

async function executeSessionCommandWithReconnect(
  session: Civ7DirectControlSession,
  options: {
    command: string;
    state?: Civ7TunerStateSelection;
    timeoutMs?: number;
  },
  attempts = 6,
): Promise<Civ7CommandResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await session.executeCommand(options);
    } catch (err) {
      lastError = err;
      await session.close();
      await sleep(750 + attempt * 750);
    }
  }
  throw toDirectControlError(lastError, "command-failed");
}

function uniqueNonEmpty(values: ReadonlyArray<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function toDirectControlError(err: unknown, fallbackCode: Civ7DirectControlErrorCode): Civ7DirectControlError {
  if (err instanceof Civ7DirectControlError) return err;
  return new Civ7DirectControlError(fallbackCode, errorMessage(err), { cause: err });
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
