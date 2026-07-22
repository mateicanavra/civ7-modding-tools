import {
  admitCiv7SetupShell,
  applyCiv7SinglePlayerSetupIdentity,
  applyCiv7SinglePlayerSetupOptions,
  beginCiv7Game,
  type Civ7AppUiSnapshotResult,
  type Civ7BeginGameResult,
  type Civ7DirectControlOptions,
  type Civ7MapSummaryOptions,
  type Civ7MapSummaryResult,
  type Civ7SavedGameConfigurationLoadRequestResult,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupMapRowsInput,
  type Civ7SetupMapRowsResult,
  type Civ7SetupMutationResult,
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

/** Provider-neutral identity needed to ask Civ7 to load one saved setup file. */
export type Civ7ControlOrpcSavedConfigIdentity = Omit<Civ7SavedGameConfigurationRef, "path">;

/** Direct-control atoms consumed by the Effect-owned control-oRPC lifecycle. */
export type Civ7ControlOrpcDirectLifecycleFacade = Readonly<{
  getSetupSnapshot(options?: Civ7DirectControlOptions): Promise<Civ7SetupSnapshotResult>;
  admitSetupShell(
    policy: Civ7SetupShellAdmissionPolicy,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupShellAdmissionResult>;
  requestSavedConfigLoad(
    input: Civ7ControlOrpcSavedConfigIdentity,
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
  applySinglePlayerSetupIdentity(
    input: Civ7SinglePlayerSetupValues,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupMutationResult>;
  applySinglePlayerSetupOptions(
    input: Civ7SinglePlayerSetupValues,
    options?: Civ7DirectControlOptions
  ): Promise<Civ7SetupMutationResult>;
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
    // Direct control's local-file record still carries a provider path, but the Civ7 load command
    // uses only FileName and DisplayName. Keep that compatibility field inside this adapter.
    requestCiv7SavedGameConfigurationLoad({ ...input, path: input.fileName }, options),
  reconcileRequiredTargetMod: async (targetModId, options) =>
    reconcileCiv7RequiredTargetMod(targetModId, options),
  getSetupMapRows: async (input, options) => getCiv7SetupMapRows(input, options),
  reloadSetupUiInShell: async (options) => reloadCiv7SetupUiInShell(options),
  applySinglePlayerSetupIdentity: async (input, options) =>
    applyCiv7SinglePlayerSetupIdentity(input, options),
  applySinglePlayerSetupOptions: async (input, options) =>
    applyCiv7SinglePlayerSetupOptions(input, options),
  hostPreparedSinglePlayerGame: async (expected, options) =>
    hostPreparedCiv7SinglePlayerGame(expected, options),
  getAppUiSnapshot: async (options) => getCiv7AppUiSnapshot(options),
  beginGame: async (options) => beginCiv7Game(options),
  checkTunerHealth: async (options) => checkCiv7TunerHealth(options),
  getMapSummary: async (options) => getCiv7MapSummary(options),
};
