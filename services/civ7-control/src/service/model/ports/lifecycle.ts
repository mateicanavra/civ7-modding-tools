import type {
  Civ7AppUiSnapshotResult,
  Civ7BeginGameResult,
  Civ7DirectControlOptions,
  Civ7MapSummaryOptions,
  Civ7MapSummaryResult,
  Civ7SavedGameConfigurationLoadRequestResult,
  Civ7SavedGameConfigurationRef,
  Civ7SetupMapRowsInput,
  Civ7SetupMapRowsResult,
  Civ7SetupMutationResult,
  Civ7SetupShellAdmissionPolicy,
  Civ7SetupShellAdmissionResult,
  Civ7SetupSnapshotResult,
  Civ7SetupUiReloadResult,
  Civ7SinglePlayerHostResult,
  Civ7SinglePlayerSetupValues,
  Civ7TargetModReconciliationResult,
  Civ7TunerHealthResult,
} from "@civ7/direct-control";

/** Provider-neutral identity needed to ask Civ7 to load one saved setup file. */
type Civ7ControlOrpcSavedConfigIdentity = Omit<Civ7SavedGameConfigurationRef, "path">;

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
