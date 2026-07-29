import {
  admitCiv7SetupShell,
  applyCiv7ExploreGrant,
  applyCiv7SinglePlayerSetupIdentity,
  applyCiv7SinglePlayerSetupOptions,
  beginCiv7Game,
  type Civ7ComponentId,
  type Civ7DirectControlOptions,
  type Civ7MapLocation,
  type Civ7PopulationPlacementProofSource,
  type Civ7SavedGameConfigurationRef,
  captureCiv7WindowShot,
  checkCiv7ProductionChoice,
  checkCiv7TunerHealth,
  checkCiv7UnitResettle,
  checkCiv7UnitUpgrade,
  closeCiv7Displays,
  enterCiv7CleanFrame,
  exitCiv7CleanFrame,
  focusCiv7CameraOnPlot,
  getCiv7AppUiSnapshot,
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7PlotSnapshot,
  getCiv7ProgressDashboard,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
  getCiv7SettlementRecommendations,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  getCiv7TargetCandidates,
  getCiv7TraditionsView,
  getCiv7TurnCompletionStatus,
  getCiv7VisibilitySummary,
  hostPreparedCiv7SinglePlayerGame,
  readCiv7DisplayQueue,
  reconcileCiv7RequiredTargetMod,
  releaseCiv7ExploreGrant,
  reloadCiv7SetupUiInShell,
  requestCiv7AdvisorWarningViewed,
  requestCiv7AttributePurchase,
  requestCiv7AttributeReviewCloseout,
  requestCiv7CelebrationChoice,
  requestCiv7CityCommand,
  requestCiv7CultureChoiceCloseout,
  requestCiv7CultureTarget,
  requestCiv7DiplomacyResponse,
  requestCiv7FirstMeetResponse,
  requestCiv7GovernmentChoice,
  requestCiv7NarrativeChoice,
  requestCiv7NotificationDismissal,
  requestCiv7PlayerOperation,
  requestCiv7SavedGameConfigurationLoad,
  requestCiv7TechnologyChoiceCloseout,
  requestCiv7TechnologyTarget,
  requestCiv7TownFocusChange,
  requestCiv7TownFocusReviewCloseout,
  requestCiv7TraditionChange,
  requestCiv7TraditionReviewCloseout,
  requestCiv7TurnComplete,
  requestCiv7UnitTargetAction,
  resumeCiv7DisplayQueue,
  sendCiv7ProductionChoice,
  sendCiv7UnitResettle,
  sendCiv7UnitUpgrade,
  suspendCiv7DisplayQueue,
} from "./index.js";

type Civ7AssignWorkerPlacementInput = Readonly<{
  playerId: number;
  location: number;
}>;

type Civ7ExpandCityPlacementInput = Readonly<{
  cityId: Civ7ComponentId;
  destination: Civ7MapLocation;
}>;

type Civ7PopulationPlacementResult = Civ7PopulationPlacementProofSource &
  Readonly<{
    before: Readonly<{ valid: boolean }>;
    after: Readonly<{ valid: boolean }>;
  }>;

/** Provider-neutral live direct-control atoms for qualified host composition. */
export const liveCiv7DirectControl = {
  checkCiv7ProductionChoice,
  sendCiv7ProductionChoice,
  requestCiv7NotificationDismissal,
  requestCiv7AdvisorWarningViewed,
  requestCiv7NarrativeChoice,
  requestCiv7DiplomacyResponse,
  requestCiv7FirstMeetResponse,
  requestCiv7GovernmentChoice,
  requestCiv7CelebrationChoice,
  requestCiv7TechnologyChoiceCloseout,
  requestCiv7CultureChoiceCloseout,
  requestCiv7TechnologyTarget,
  requestCiv7CultureTarget,
  requestCiv7AttributePurchase,
  requestCiv7AttributeReviewCloseout,
  requestCiv7TraditionChange,
  requestCiv7TraditionReviewCloseout,
  requestCiv7TownFocusChange,
  requestCiv7TownFocusReviewCloseout,
  requestCiv7AssignWorkerPlacement: async (
    input: Civ7AssignWorkerPlacementInput,
    options: Civ7DirectControlOptions | undefined
  ) =>
    requestCiv7PlayerOperation(
      {
        playerId: input.playerId,
        operationType: "ASSIGN_WORKER",
        args: {
          Location: input.location,
          Amount: 1,
        },
      },
      options
    ) as Promise<Civ7PopulationPlacementResult>,
  requestCiv7ExpandCityPlacement: async (
    input: Civ7ExpandCityPlacementInput,
    options: Civ7DirectControlOptions | undefined
  ) =>
    requestCiv7CityCommand(
      {
        cityId: input.cityId,
        operationType: "EXPAND",
        args: {
          X: input.destination.x,
          Y: input.destination.y,
        },
      },
      options
    ) as Promise<Civ7PopulationPlacementResult>,
  requestCiv7UnitTargetAction,
  checkCiv7UnitUpgrade,
  sendCiv7UnitUpgrade,
  checkCiv7UnitResettle,
  sendCiv7UnitResettle,
  requestCiv7TurnComplete,
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7ProgressDashboard,
  getCiv7TraditionsView,
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7PlotSnapshot,
  getCiv7MapGrid,
  getCiv7ReadyUnitView,
  getCiv7ReadyCityView,
  getCiv7SettlementRecommendations,
  getCiv7TargetCandidates,
  getCiv7TurnCompletionStatus,
  getCiv7VisibilitySummary,
  readCiv7DisplayQueue,
  closeCiv7Displays,
  suspendCiv7DisplayQueue,
  resumeCiv7DisplayQueue,
  applyCiv7ExploreGrant,
  releaseCiv7ExploreGrant,
  focusCiv7Camera: focusCiv7CameraOnPlot,
  enterCiv7CleanFrame,
  exitCiv7CleanFrame,
  captureCiv7WindowShot,
};

type Civ7SavedConfigIdentity = Omit<Civ7SavedGameConfigurationRef, "path">;

/** Provider-neutral live setup lifecycle atoms for qualified host composition. */
export const liveCiv7LifecycleControl = {
  getSetupSnapshot: getCiv7SetupSnapshot,
  admitSetupShell: admitCiv7SetupShell,
  requestSavedConfigLoad: (input: Civ7SavedConfigIdentity, options?: Civ7DirectControlOptions) =>
    requestCiv7SavedGameConfigurationLoad({ ...input, path: input.fileName }, options),
  reconcileRequiredTargetMod: reconcileCiv7RequiredTargetMod,
  getSetupMapRows: getCiv7SetupMapRows,
  reloadSetupUiInShell: reloadCiv7SetupUiInShell,
  applySinglePlayerSetupIdentity: applyCiv7SinglePlayerSetupIdentity,
  applySinglePlayerSetupOptions: applyCiv7SinglePlayerSetupOptions,
  hostPreparedSinglePlayerGame: hostPreparedCiv7SinglePlayerGame,
  getAppUiSnapshot: getCiv7AppUiSnapshot,
  beginGame: beginCiv7Game,
  checkTunerHealth: checkCiv7TunerHealth,
  getMapSummary: getCiv7MapSummary,
};
