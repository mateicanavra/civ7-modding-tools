import {
  admitCiv7SetupShell,
  applyCiv7SinglePlayerSetup,
  beginCiv7Game,
  type Civ7AppUiSnapshotResult,
  type Civ7BeginGameResult,
  type Civ7DirectControlOptions,
  type Civ7MapSummaryOptions,
  type Civ7MapSummaryResult,
  type Civ7SavedGameConfigurationLoadRequestResult,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupApplicationResult,
  type Civ7SetupMapRowsInput,
  type Civ7SetupMapRowsResult,
  type Civ7SetupShellAdmissionPolicy,
  type Civ7SetupShellAdmissionResult,
  type Civ7SetupSnapshotResult,
  type Civ7SetupUiReloadResult,
  type Civ7SinglePlayerHostResult,
  type Civ7SinglePlayerSetupValues,
  type Civ7TargetModReconciliationResult,
  type Civ7TunerHealthResult,
  checkCiv7TunerHealth,
  getCiv7AppUiSnapshot,
  getCiv7MapSummary,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  hostPreparedCiv7SinglePlayerGame,
  reconcileCiv7RequiredTargetMod,
  reloadCiv7SetupUiInShell,
  requestCiv7SavedGameConfigurationLoad,
} from "@civ7/direct-control";

/** Direct-control atoms consumed by the Effect-owned control-oRPC lifecycle. */
export type Civ7ControlOrpcDirectLifecycleFacade = Readonly<{
  getSetupSnapshot(options?: Civ7DirectControlOptions): Promise<Civ7SetupSnapshotResult>;
  admitSetupShell(
    policy: Civ7SetupShellAdmissionPolicy,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupShellAdmissionResult>;
  requestSavedConfigLoad(
    input: Civ7SavedGameConfigurationRef,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SavedGameConfigurationLoadRequestResult>;
  reconcileRequiredTargetMod(
    targetModId: string,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7TargetModReconciliationResult>;
  getSetupMapRows(
    input: Civ7SetupMapRowsInput,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupMapRowsResult>;
  reloadSetupUiInShell(options?: Civ7DirectControlOptions): Promise<Civ7SetupUiReloadResult>;
  applySinglePlayerSetup(
    input: Civ7SinglePlayerSetupValues,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupApplicationResult>;
  hostPreparedSinglePlayerGame(
    expected: Civ7SinglePlayerSetupValues,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SinglePlayerHostResult>;
  getAppUiSnapshot(options?: Civ7DirectControlOptions): Promise<Civ7AppUiSnapshotResult>;
  beginGame(options?: Civ7DirectControlOptions): Promise<Civ7BeginGameResult>;
  checkTunerHealth(options?: Civ7DirectControlOptions): Promise<Civ7TunerHealthResult>;
  getMapSummary(options?: Civ7MapSummaryOptions): Promise<Civ7MapSummaryResult>;
}>;

export const liveCiv7ControlOrpcDirectLifecycleFacade: Civ7ControlOrpcDirectLifecycleFacade = {
  getSetupSnapshot: async (options) => getCiv7SetupSnapshot(options),
  admitSetupShell: async (policy, options) => admitCiv7SetupShell(policy, options),
  requestSavedConfigLoad: async (input, options) =>
    requestCiv7SavedGameConfigurationLoad(input, options),
  reconcileRequiredTargetMod: async (targetModId, options) =>
    reconcileCiv7RequiredTargetMod(targetModId, options),
  getSetupMapRows: async (input, options) => getCiv7SetupMapRows(input, options),
  reloadSetupUiInShell: async (options) => reloadCiv7SetupUiInShell(options),
  applySinglePlayerSetup: async (input, options) => applyCiv7SinglePlayerSetup(input, options),
  hostPreparedSinglePlayerGame: async (expected, options) =>
    hostPreparedCiv7SinglePlayerGame(expected, options),
  getAppUiSnapshot: async (options) => getCiv7AppUiSnapshot(options),
  beginGame: async (options) => beginCiv7Game(options),
  checkTunerHealth: async (options) => checkCiv7TunerHealth(options),
  getMapSummary: async (options) => getCiv7MapSummary(options),
};
